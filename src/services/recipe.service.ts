import { query } from '../config/db';
import { Item, Recipe, RecipeIngredient } from '../types';

export class RecipeService {

    // Create a new Item (Ingredient, Dish, etc.)
    public async createItem(data: Omit<Item, 'id' | 'created_at'>): Promise<string> {
        const res = await query(
            `INSERT INTO items (name, sku, type, unit, cost_per_unit, is_auto_explode) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [data.name, data.sku, data.type, data.unit, data.cost_per_unit, data.is_auto_explode]
        );
        return res.rows[0].id;
    }

    // Update Item Details (For Raw Materials/Modifiers)
    public async updateItem(id: string, data: Partial<Item>) {
        const fields = [];
        const values = [];
        let idx = 1;

        if (data.name) { fields.push(`name = $${idx++}`); values.push(data.name); }
        if (data.sku) { fields.push(`sku = $${idx++}`); values.push(data.sku); }
        if (data.unit) { fields.push(`unit = $${idx++}`); values.push(data.unit); }
        if (data.cost_per_unit !== undefined) { fields.push(`cost_per_unit = $${idx++}`); values.push(data.cost_per_unit); }
        if (data.min_threshold !== undefined) { fields.push(`min_threshold = $${idx++}`); values.push(data.min_threshold); }

        if (fields.length === 0) return;

        values.push(id);
        await query(`UPDATE items SET ${fields.join(', ')} WHERE id = $${idx}`, values);
    }

    // Create a Recipe for an Item
    public async createRecipe(data: Omit<Recipe, 'id' | 'is_active' | 'ingredients'> & { ingredients: Omit<RecipeIngredient, 'id' | 'recipe_id'>[] }): Promise<string> {
        // Start transaction? For simplicity using single queries but ideally invalid if Ingredients fail

        // 1. Create Header
        const res = await query(
            `INSERT INTO recipes (output_item_id, batch_size, instructions) 
       VALUES ($1, $2, $3) RETURNING id`,
            [data.output_item_id, data.batch_size, data.instructions]
        );
        const recipeId = res.rows[0].id;

        // 2. Add Ingredients
        for (const ing of data.ingredients) {
            await query(
                `INSERT INTO recipe_ingredients (recipe_id, component_item_id, quantity, wastage_percent)
         VALUES ($1, $2, $3, $4)`,
                [recipeId, ing.component_item_id, ing.quantity, ing.wastage_percent]
            );
        }

        return recipeId;
    }

    public async getItems(): Promise<Item[]> {
        const res = await query('SELECT * FROM items ORDER BY name');
        return res.rows;
    }

    // --- New CRUD Methods ---

    // Get Full Recipe Details
    public async getRecipeDetails(itemId: string): Promise<Recipe | null> {
        const recipeRes = await query('SELECT * FROM recipes WHERE output_item_id = $1', [itemId]);
        if (recipeRes.rows.length === 0) return null;

        const recipe = recipeRes.rows[0];
        const ingredientsRes = await query(
            `SELECT ri.*, i.name, i.sku, i.unit, i.cost_per_unit
             FROM recipe_ingredients ri
             JOIN items i ON ri.component_item_id = i.id
             WHERE ri.recipe_id = $1`,
            [recipe.id]
        );

        return { ...recipe, ingredients: ingredientsRes.rows };
    }

    // Delete Recipe (and the Output Item)
    public async deleteRecipe(itemId: string) {
        // Cascade should handle foreign keys, but let's be safe.
        // If we delete the ITEM, the RECIPE and INGREDIENTS should go if FKs are set to CASCADE.
        // Assuming schema.sql set ON DELETE CASCADE.
        await query('DELETE FROM items WHERE id = $1', [itemId]);
    }

    // Update Recipe
    public async updateRecipe(itemId: string, data: { name: string, sku: string, unit: string, ingredients: any[] }) {
        const client = await import('../config/db').then(m => m.default.connect());
        try {
            await client.query('BEGIN');

            // 1. Update Item Details
            await client.query(
                'UPDATE items SET name = $1, sku = $2, unit = $3 WHERE id = $4',
                [data.name, data.sku, data.unit, itemId]
            );

            // 2. Get Recipe ID
            const rRes = await client.query('SELECT id FROM recipes WHERE output_item_id = $1', [itemId]);
            if (rRes.rows.length === 0) throw new Error('Recipe not found');
            const recipeId = rRes.rows[0].id;

            // 3. Replace Ingredients
            await client.query('DELETE FROM recipe_ingredients WHERE recipe_id = $1', [recipeId]);

            for (const ing of data.ingredients) {
                await client.query(
                    `INSERT INTO recipe_ingredients (recipe_id, component_item_id, quantity, wastage_percent)
                     VALUES ($1, $2, $3, $4)`,
                    [recipeId, ing.component_item_id, ing.quantity, ing.wastage_percent]
                );
            }

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }
}

export const recipeService = new RecipeService();
