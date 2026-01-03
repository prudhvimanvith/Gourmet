import pool, { query } from '../config/db';
import { inventoryService } from '../services/inventory.service';
import { recipeService } from '../services/recipe.service';

const testDeduction = async () => {
    try {
        console.log('--- Starting Inventory Deduction Test ---');

        // 1. Get IDs (Assuming Seed ran correctly)
        // Helper to find item by name
        const findId = async (name: string) => {
            const res = await query('SELECT id FROM items WHERE name = $1', [name]);
            return res.rows[0]?.id;
        }

        const pizzaId = await findId('Margherita Pizza');
        const doughId = await findId('Pizza Dough');
        const tomatoId = await findId('Tomato');

        if (!pizzaId) throw new Error('Pizza not found. Run seed first.');

        // 2. Check Initial Stock
        const getStock = async (id: string, name: string) => {
            const res = await query('SELECT current_stock FROM items WHERE id = $1', [id]);
            console.log(`[initial] ${name} Stock: ${res.rows[0].current_stock}`);
            return parseFloat(res.rows[0].current_stock);
        };

        const initialDough = await getStock(doughId, 'Pizza Dough');
        const initialTomato = await getStock(tomatoId, 'Tomato');

        // 3. Place Order for 2 Pizzas
        console.log('\n>>> Placing Order for 2 Margherita Pizzas...');
        const orderId = require('crypto').randomUUID();
        // Create dummy order record first (optional but good for FK)
        await query("INSERT INTO orders (id, pos_order_ref, status) VALUES ($1, 'POS-001', 'PENDING')", [orderId]);

        await inventoryService.processOrder(orderId, [
            { itemId: pizzaId, qty: 2 }
        ]);

        // 4. Verify Deductions
        // Recipe: 1 Pizza = 0.3kg Dough, 0.1kg Tomato
        // Order: 2 Pizzas = 0.6kg Dough, 0.2kg Tomato (plus wastage for tomato?)
        // Tomato Wastage was 5% in seed -> 0.2 * 1.05 = 0.21kg

        console.log('\n>>> Verifying Stock Levels...');

        const checkStock = async (id: string, name: string, expectedDelta: number) => {
            const res = await query('SELECT current_stock FROM items WHERE id = $1', [id]);
            const current = parseFloat(res.rows[0].current_stock);
            // We need original stock from step 2 to compare
            // But let's just log for now
            console.log(`[final] ${name} Stock: ${current}`);
            return current;
        }

        const finalDough = await checkStock(doughId, 'Pizza Dough', -0.6);
        const finalTomato = await checkStock(tomatoId, 'Tomato', -0.21);

        const doughDelta = initialDough - finalDough;
        const tomatoDelta = initialTomato - finalTomato;

        console.log(`\nDough Deducted: ${doughDelta.toFixed(4)} (Expected ~0.6)`);
        console.log(`Tomato Deducted: ${tomatoDelta.toFixed(4)} (Expected ~0.21)`);

        if (Math.abs(doughDelta - 0.6) < 0.001 && Math.abs(tomatoDelta - 0.21) < 0.001) {
            console.log('\nSUCCESS: Deductions are accurate!');
        } else {
            console.error('\nFAILURE: Deductions do not match expected values.');
        }

    } catch (err) {
        console.error('Test Failed:', err);
    } finally {
        pool.end();
    }
};

testDeduction();
