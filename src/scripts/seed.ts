import pool from '../config/db';
import { recipeService } from '../services/recipe.service';
import { inventoryService } from '../services/inventory.service';

const seed = async () => {
    try {
        console.log('Starting Seed...');

        // 1. Create Raw Materials
        const flourId = await recipeService.createItem({
            name: 'Flour', type: 'RAW_MATERIAL', unit: 'kg', cost_per_unit: 1.50, min_threshold: 10, is_auto_explode: false, current_stock: 0
        });
        const waterId = await recipeService.createItem({
            name: 'Water', type: 'RAW_MATERIAL', unit: 'l', cost_per_unit: 0.10, min_threshold: 10, is_auto_explode: false, current_stock: 0
        });
        const yeastId = await recipeService.createItem({
            name: 'Yeast', type: 'RAW_MATERIAL', unit: 'g', cost_per_unit: 0.05, min_threshold: 100, is_auto_explode: false, current_stock: 0
        });
        const tomatoId = await recipeService.createItem({
            name: 'Tomato', type: 'RAW_MATERIAL', unit: 'kg', cost_per_unit: 2.00, min_threshold: 5, is_auto_explode: false, current_stock: 0
        });
        const cheeseId = await recipeService.createItem({
            name: 'Cheese', type: 'RAW_MATERIAL', unit: 'kg', cost_per_unit: 8.00, min_threshold: 5, is_auto_explode: false, current_stock: 0
        });

        console.log('Raw Materials Created');

        // 2. Create Intermediate: Pizza Dough
        const doughId = await recipeService.createItem({
            name: 'Pizza Dough', type: 'INTERMEDIATE', unit: 'kg', cost_per_unit: 0, min_threshold: 2, is_auto_explode: false, current_stock: 0
        });

        await recipeService.createRecipe({
            output_item_id: doughId,
            batch_size: 5, // Makes 5kg batch
            ingredients: [
                { component_item_id: flourId, quantity: 3, wastage_percent: 0 },
                { component_item_id: waterId, quantity: 1.5, wastage_percent: 0 },
                { component_item_id: yeastId, quantity: 50, wastage_percent: 0 } // 50g
            ],
            instructions: 'Mix and Knead'
        });

        console.log('Dough Recipe Created');

        // 3. Create Dish: Margherita Pizza
        const pizzaId = await recipeService.createItem({
            name: 'Margherita Pizza', type: 'DISH', unit: 'pcs', cost_per_unit: 0, min_threshold: 0, is_auto_explode: true, current_stock: 0
        });

        await recipeService.createRecipe({
            output_item_id: pizzaId,
            batch_size: 1,
            ingredients: [
                { component_item_id: doughId, quantity: 0.3, wastage_percent: 0 }, // 300g dough
                { component_item_id: tomatoId, quantity: 0.1, wastage_percent: 5 }, // 100g tomato
                { component_item_id: cheeseId, quantity: 0.15, wastage_percent: 0 } // 150g cheese
            ],
            instructions: 'Bake at 450F'
        });

        console.log('Pizza Recipe Created');

        // 4. Stock Up Raw Materials (Purchase)
        const client = await pool.connect();
        // Use a helper or raw query
        // We need to implement 'addStock' or just use recordTransaction if exposed, but it's private.
        // Let's use raw SQL for seeding stock.
        await client.query('UPDATE items SET current_stock = 100 WHERE type = \'RAW_MATERIAL\'');
        // Also stock up Dough for the "Stocked Intermediate" test
        await client.query('UPDATE items SET current_stock = 10 WHERE id = $1', [doughId]);

        client.release();
        console.log('Inventory Stocked');

        console.log('Seed Complete');
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
};

seed();
