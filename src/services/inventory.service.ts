import pool, { query } from '../config/db';
import { Item, Recipe, RecipeIngredient } from '../types';

export class InventoryService {

    // Fetch item details including type and auto_explode status
    private async getItem(itemId: string): Promise<Item | null> {
        const res = await query('SELECT * FROM items WHERE id = $1', [itemId]);
        return res.rows[0] || null;
    }

    // Fetch recipe and ingredients for an item
    private async getRecipe(itemId: string): Promise<Recipe | null> {
        const recipeRes = await query('SELECT * FROM recipes WHERE output_item_id = $1 AND is_active = true', [itemId]);
        if (recipeRes.rows.length === 0) return null;

        const recipe = recipeRes.rows[0];
        const ingredientsRes = await query('SELECT * FROM recipe_ingredients WHERE recipe_id = $1', [recipe.id]);

        return {
            ...recipe,
            ingredients: ingredientsRes.rows
        };
    }

    // Record a transaction in the ledger
    private async recordTransaction(client: any, itemId: string, change: number, type: string, refId: string) {
        // 1. Insert Transaction Log
        await client.query(
            'INSERT INTO inventory_transactions (item_id, quantity_change, transaction_type, reference_id) VALUES ($1, $2, $3, $4)',
            [itemId, change, type, refId]
        );

        // 2. Update Current Stock Balance
        await client.query(
            'UPDATE items SET current_stock = current_stock + $1 WHERE id = $2',
            [change, itemId]
        );
    }

    // Manual Stock Adjustment (e.g., Delivery, Spoilage, Correction)
    public async adjustStock(itemId: string, change: number, reason: string) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const refId = `ADJ-${Date.now()}`;
            // If change is positive -> RESTOCK, negative -> WASTE/CORRECTION
            const type = change > 0 ? 'RESTOCK' : 'CORRECTION';

            await this.recordTransaction(client, itemId, change, type, refId);

            // Optional: Log specific reason in a separate notes column if schema allowed, 
            // for now we trust transaction_type and refId timestamps.

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    /**
     * CORE LOGIC: Recursive Deduction
     * This function determines whether to deduct the item itself or recurse down to its ingredients.
     * 
     * @param client - DB Client for transaction context
     * @param itemId - The item being sold/consumed
     * @param quantity - Amount needed
     * @param referenceId - Order ID or Prep Log ID
     */
    public async deductStock(client: any, itemId: string, quantity: number, referenceId: string) {
        const item = await this.getItem(itemId);
        if (!item) throw new Error(`Item ${itemId} not found`);

        console.log(`Processing deduction for ${item.name} (${item.type}): Qty ${quantity}`);

        // LOGIC:
        // If Item is RAW_MATERIAL -> Deduct directly.
        // If Item is DISH -> Always explode (Dish itself isn't "stocked" usually, unless pre-made). 
        //    *Design Choice*: We assume DISHES are made to order, so we explode.
        // If Item is INTERMEDIATE:
        //    - If is_auto_explode = TRUE (Phantom) -> Recurse.
        //    - If is_auto_explode = FALSE (Stocked) -> Deduct from Intermediate Stock.

        if (item.type === 'RAW_MATERIAL') {
            await this.recordTransaction(client, itemId, -quantity, 'SALE', referenceId);
        }
        else if (item.type === 'INTERMEDIATE' && !item.is_auto_explode) {
            // It's a stocked intermediate (e.g., Marinara Sauce in a tub)
            await this.recordTransaction(client, itemId, -quantity, 'SALE', referenceId);
        }
        else {
            // It's a DISH or a Phantom INTERMEDIATE -> Explode!
            const recipe = await this.getRecipe(itemId);

            if (!recipe) {
                // Fallback: If no recipe exists, just deduct the item itself (maybe it's a resell item like a Coke bottle)
                console.warn(`No recipe found for explodable item ${item.name}. Deducting directly.`);
                await this.recordTransaction(client, itemId, -quantity, 'SALE', referenceId);
                return;
            }

            for (const ingredient of recipe.ingredients) {
                // Calculate needed ingredient quantity
                // Recipe makes 'batch_size'. We need 'quantity'.
                // Factor = quantity / batch_size
                const factor = quantity / recipe.batch_size;

                let requiredQty = ingredient.quantity * factor;

                // Handle Wastage (Extra amount consumed)
                if (ingredient.wastage_percent > 0) {
                    requiredQty = requiredQty * (1 + (ingredient.wastage_percent / 100));
                }

                // RECURSION
                await this.deductStock(client, ingredient.component_item_id, requiredQty, referenceId);
            }
        }
    }

    // Entry point for processing a Prep/Production event within a transaction
    // Increases stock of 'itemId' (Intermediate) and consumes its ingredients.
    public async processPrep(itemId: string, quantity: number, refId: string) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const item = await this.getItem(itemId);
            if (!item) throw new Error(`Item ${itemId} not found`);
            if (item.type !== 'INTERMEDIATE') throw new Error(`Only Intermediate items can be prepped directly.`);

            // 1. Deduct Ingredients (Recursively)
            // We reuse the logic: "To make 5kg dough, we need X flour..."
            // But we need to find the recipe first to know WHAT to deduct.
            const recipe = await this.getRecipe(itemId);
            if (!recipe) throw new Error(`No recipe found for ${item.name}`);

            for (const ingredient of recipe.ingredients) {
                // Calculate needed ingredient quantity
                const factor = quantity / recipe.batch_size;
                let requiredQty = ingredient.quantity * factor;

                if (ingredient.wastage_percent > 0) {
                    requiredQty = requiredQty * (1 + (ingredient.wastage_percent / 100));
                }

                await this.deductStock(client, ingredient.component_item_id, requiredQty, refId);
            }

            // 2. Increase Stock of the Output Item
            await this.recordTransaction(client, itemId, quantity, 'PREP_IN', refId);

            await client.query('COMMIT');
            console.log(`Prep recorded: ${quantity} ${item.unit} of ${item.name}`);
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    // Entry point for processing a Sale
    public async processOrder(orderId: string, items: { itemId: string, qty: number }[]) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            let totalOrderAmount = 0;

            for (const entry of items) {
                // 1. Get Item Price
                const itemRes = await client.query('SELECT selling_price FROM items WHERE id = $1', [entry.itemId]);
                const price = Number(itemRes.rows[0]?.selling_price || 0);
                totalOrderAmount += (price * entry.qty);

                // 2. Insert Order Item
                await client.query(
                    'INSERT INTO order_items (order_id, item_id, quantity, price_at_sale) VALUES ($1, $2, $3, $4)',
                    [orderId, entry.itemId, entry.qty, price]
                );

                // 3. Deduct Stock
                await this.deductStock(client, entry.itemId, entry.qty, orderId);
            }

            // 4. Update Order Total and Status
            await client.query(
                'UPDATE orders SET status = $1, total_amount = $2 WHERE id = $3',
                ['COMPLETED', totalOrderAmount, orderId]
            );

            await client.query('COMMIT');
            console.log(`Order ${orderId} processed successfully. Total: $${totalOrderAmount}`);
        } catch (err) {
            await client.query('ROLLBACK');
            console.error(`Order processing failed:`, err);
            throw err;
        } finally {
            client.release();
        }
    }
}

export const inventoryService = new InventoryService();
