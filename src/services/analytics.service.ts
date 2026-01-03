import { query } from '../config/db';

export type DashboardStats = {
    totalSales: number;
    activeOrders: number;
    stockAlerts: number;
    inventoryValue: number;
    recentActivity: ActivityLog[];
};

export type ActivityLog = {
    id: string;
    description: string;
    time: Date;
    type: 'SALE' | 'PREP' | 'RESTOCK';
};

export class AnalyticsService {

    async getDashboardStats(): Promise<DashboardStats> {
        // 1. Total Sales (Sum of completed orders)
        // For now, let's sum total_amount from orders.
        const salesRes = await query(`SELECT SUM(total_amount) as total FROM orders`);
        const totalSales = Number(salesRes.rows[0].total || 0);

        // 2. Active Orders (Pending)
        const ordersRes = await query(`SELECT COUNT(*) as count FROM orders WHERE status = 'PENDING'`);
        const activeOrders = Number(ordersRes.rows[0].count || 0);

        // 3. Stock Alerts
        const alertsRes = await query(`
            SELECT COUNT(*) as count 
            FROM items 
            WHERE current_stock <= min_threshold 
            AND type IN ('RAW_MATERIAL', 'INTERMEDIATE')
        `);
        // We generally don't alert for Dishes (made to order) unless pre-made. 
        // But for simplicity let's include stocked items.
        const stockAlerts = Number(alertsRes.rows[0].count || 0);

        // 4. Inventory Value
        const valueRes = await query(`
            SELECT SUM(current_stock * cost_per_unit) as total 
            FROM items
        `);
        const inventoryValue = Number(valueRes.rows[0].total || 0);

        // 5. Recent Activity
        // Join transaction with items to get names
        const activityRes = await query(`
            SELECT t.id, t.transaction_type, t.quantity_change, t.created_at, i.name, i.unit
            FROM inventory_transactions t
            JOIN items i ON t.item_id = i.id
            ORDER BY t.created_at DESC
            LIMIT 5
        `);

        const recentActivity: ActivityLog[] = activityRes.rows.map(row => {
            let type: ActivityLog['type'] = 'SALE';
            let description = '';

            const qty = Math.abs(Number(row.quantity_change));

            switch (row.transaction_type) {
                case 'SALE':
                    type = 'SALE';
                    description = `Sold ${qty} ${row.unit} of ${row.name}`;
                    break;
                case 'PREP_IN':
                    type = 'PREP';
                    description = `Produced ${qty} ${row.unit} of ${row.name}`;
                    break;
                case 'PREP_OUT': // Ingredient usage
                    type = 'PREP'; // Group under Prep
                    description = `Used ${qty} ${row.unit} of ${row.name} for prep`;
                    break;
                default:
                    type = 'RESTOCK';
                    description = `Adjusted ${row.name}: ${row.quantity_change}`;
            }

            return {
                id: row.id,
                description,
                time: row.created_at,
                type
            };
        });

        return {
            totalSales,
            activeOrders,
            stockAlerts,
            inventoryValue,
            recentActivity
        };
    }
}

export const analyticsService = new AnalyticsService();
