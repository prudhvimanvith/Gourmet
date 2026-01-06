import pool, { query } from '../config/db';
import { Item, Recipe, RecipeIngredient } from '../types';

export class InventoryService {

    // Fetch item details (using active client if available)
    private async getItem(itemId: string, client?: any): Promise<Item | null> {
        const executor = client || pool;
        const res = await executor.query('SELECT * FROM items WHERE id = $1', [itemId]);
        return res.rows[0] || null;
    }

    // Fetch recipe (using active client)
    private async getRecipe(itemId: string, client?: any): Promise<Recipe | null> {
        const executor = client || pool;
        const recipeRes = await executor.query('SELECT * FROM recipes WHERE output_item_id = $1 AND is_active = true', [itemId]);
        if (recipeRes.rows.length === 0) return null;

        const recipe = recipeRes.rows[0];
        const ingredientsRes = await executor.query('SELECT * FROM recipe_ingredients WHERE recipe_id = $1', [recipe.id]);

        return {
            ...recipe,
            ingredients: ingredientsRes.rows
        };
    }

    // Record a transaction in the ledger
    private async recordTransaction(client: any, itemId: string, change: number, type: string, refId: string) {
        await client.query(
            'INSERT INTO inventory_transactions (item_id, quantity_change, transaction_type, reference_id) VALUES ($1, $2, $3, $4)',
            [itemId, change, type, refId]
        );
        await client.query(
            'UPDATE items SET current_stock = current_stock + $1 WHERE id = $2',
            [change, itemId]
        );
    }

    public async adjustStock(itemId: string, change: number, reason: string) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const refId = `ADJ-${Date.now()}`;
            const type = change > 0 ? 'RESTOCK' : 'CORRECTION';

            await this.recordTransaction(client, itemId, change, type, refId);
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    public async deductStock(client: any, itemId: string, quantity: number, referenceId: string) {
        // PERF: Pass client to reuse connection
        const item = await this.getItem(itemId, client);
        if (!item) throw new Error(`Item ${itemId} not found`);

        if (item.type === 'RAW_MATERIAL') {
            await this.recordTransaction(client, itemId, -quantity, 'SALE', referenceId);
        }
        else if (item.type === 'INTERMEDIATE' && !item.is_auto_explode) {
            await this.recordTransaction(client, itemId, -quantity, 'SALE', referenceId);
        }
        else {
            const recipe = await this.getRecipe(itemId, client);

            if (!recipe) {
                console.warn(`No recipe found for explodable item ${item.name}. Deducting directly.`);
                await this.recordTransaction(client, itemId, -quantity, 'SALE', referenceId);
                return;
            }

            // Parallelize ingredient processing? Recursion makes it risky for deadlocks, keeping sequential for safety but reusing client.
            for (const ingredient of recipe.ingredients) {
                const factor = quantity / recipe.batch_size;
                let requiredQty = ingredient.quantity * factor;

                if (ingredient.wastage_percent > 0) {
                    requiredQty = requiredQty * (1 + (ingredient.wastage_percent / 100));
                }

                await this.deductStock(client, ingredient.component_item_id, requiredQty, referenceId);
            }
        }
    }

    public async processPrep(itemId: string, quantity: number, refId: string) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const item = await this.getItem(itemId, client);
            if (!item) throw new Error(`Item ${itemId} not found`);
            if (item.type !== 'INTERMEDIATE') throw new Error(`Only Intermediate items can be prepped directly.`);

            const recipe = await this.getRecipe(itemId, client);
            if (!recipe) throw new Error(`No recipe found for ${item.name}`);

            for (const ingredient of recipe.ingredients) {
                const factor = quantity / recipe.batch_size;
                let requiredQty = ingredient.quantity * factor;

                if (ingredient.wastage_percent > 0) {
                    requiredQty = requiredQty * (1 + (ingredient.wastage_percent / 100));
                }

                await this.deductStock(client, ingredient.component_item_id, requiredQty, refId);
            }

            await this.recordTransaction(client, itemId, quantity, 'PREP_IN', refId);

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    public async processOrder(orderId: string, items: { itemId: string, qty: number }[]) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // 1. Bulk Fetch Prices to avoid N queries
            const ids = items.map(i => i.itemId);
            // Use ANY($1) for array match
            const priceRes = await client.query('SELECT id, selling_price FROM items WHERE id = ANY($1)', [ids]);
            const priceMap = new Map();
            priceRes.rows.forEach((row: any) => priceMap.set(row.id, Number(row.selling_price || 0)));

            let totalOrderAmount = 0;

            for (const entry of items) {
                const price = priceMap.get(entry.itemId) || 0;
                totalOrderAmount += (price * entry.qty);

                await client.query(
                    'INSERT INTO order_items (order_id, item_id, quantity, price_at_sale) VALUES ($1, $2, $3, $4)',
                    [orderId, entry.itemId, entry.qty, price]
                );

                await this.deductStock(client, entry.itemId, entry.qty, orderId);
            }

            await client.query(
                'UPDATE orders SET status = $1, total_amount = $2 WHERE id = $3',
                ['COMPLETED', totalOrderAmount, orderId]
            );

            await client.query('COMMIT');
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
