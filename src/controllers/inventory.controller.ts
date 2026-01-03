import { Request, Response } from 'express';
import { inventoryService } from '../services/inventory.service';
import { query } from '../config/db';
import { randomUUID } from 'crypto';

export class InventoryController {

    // POST /api/v1/orders
    // Payload: { items: [{ itemId: string, qty: number }] }
    async processOrder(req: Request, res: Response) {
        try {
            const { items } = req.body;
            if (!items || !Array.isArray(items)) {
                res.status(400).json({ error: 'Invalid payload: items array required' });
                return;
            }

            // Generate a new Order ID
            const orderId = randomUUID();

            // Create Order Header first (Requirement for FK)
            await query(
                "INSERT INTO orders (id, pos_order_ref, status) VALUES ($1, $2, 'PENDING')",
                [orderId, `POS-${Date.now()}`]
            );

            // Trigger Deduction
            await inventoryService.processOrder(orderId, items);

            res.status(200).json({
                message: 'Order processed successfully',
                orderId
            });
        } catch (error: any) {
            console.error('Order processing error:', error);
            res.status(500).json({ error: error.message || 'Internal Server Error' });
        }
    }

    // POST /api/v1/prep
    // Payload: { itemId: string, quantity: number }
    async recordPrep(req: Request, res: Response) {
        try {
            const { itemId, quantity } = req.body;
            if (!itemId || !quantity || quantity <= 0) {
                res.status(400).json({ error: 'Invalid payload' });
                return;
            }

            const refId = `PREP-${Date.now()}`;
            await inventoryService.processPrep(itemId, quantity, refId);

            res.status(200).json({ message: 'Prep recorded successfully', refId });
        } catch (error: any) {
            console.error('Prep error:', error);
            res.status(500).json({ error: error.message || 'Internal Server Error' });
        }
    }

    // GET /api/v1/inventory/:itemId
    async getStock(req: Request, res: Response) {
        try {
            const { itemId } = req.params;
            const result = await query('SELECT id, name, type, current_stock, unit FROM items WHERE id = $1', [itemId]);

            if (result.rows.length === 0) {
                res.status(404).json({ error: 'Item not found' });
                return;
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Get stock error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // POST /api/v1/inventory/adjust
    async adjustStock(req: Request, res: Response) {
        try {
            const { itemId, change, reason } = req.body;
            await inventoryService.adjustStock(itemId, Number(change), reason || 'Manual Adjustment');
            res.json({ message: 'Stock adjusted successfully' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export const inventoryController = new InventoryController();
