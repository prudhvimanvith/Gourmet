import { endpoints } from '../config/api';

export type Item = {
    id: string;
    name: string;
    type: 'RAW_MATERIAL' | 'INTERMEDIATE' | 'DISH' | 'MODIFIER';
    unit: string;
    cost_per_unit: number | string; // PG returns numeric as string
    current_stock: number | string;
    selling_price?: number | string;
    sku: string;
    min_threshold?: number;
    is_auto_explode?: boolean;
};

export type OrderItem = {
    itemId: string;
    qty: number;
};

export type CreateItemDTO = {
    name: string;
    sku: string;
    type: 'RAW_MATERIAL' | 'INTERMEDIATE' | 'DISH' | 'MODIFIER';
    unit: string;
    cost_per_unit: number;
    selling_price?: number;
    is_auto_explode: boolean;
};

export type CreateRecipeDTO = {
    output_item_id: string;
    batch_size: number;
    instructions: string;
    ingredients: {
        component_item_id: string;
        quantity: number;
        wastage_percent: number;
    }[];
};

export const api = {
    getItems: async (): Promise<Item[]> => {
        const res = await fetch(`${endpoints.inventory}/items`); // endpoints.inventory is base/inventory, so this might be wrong if routes are different. Checking api.ts config.
        // Actually, endpoints in config/api.ts are specific full URLs.
        // Let's use the BASE URL from config instead or just use the endpoints object correctly.
        // endpoints.inventory = .../inventory
        // The original fetch was `${API_URL}/items`.
        // config/api.ts doesn't have a generic `items` endpoint defined, only `inventory`.
        // But `routes/api.routes.ts` has `router.get('/items', ...)`
        // So I should add `items` to config/api.ts or just rely on a function helper.

        // Let's just fix the import and use the BASE first to be safe, or direct replacement.
        // Re-reading config/api.ts...
        // login: ..., inventory: .../inventory, recipes: .../recipes

        // Use relative path if possible or re-declare API_URL based on env.
        // The best approach is to use the same logic as config/api.ts

        const res = await fetch(`${endpoints.inventory}/../items`); // Hacky? No, let's just use the same env var.
        /* 
           Better plan: Update this file to use `import.meta.env.VITE_API_URL` directly like config/api.ts
           OR import the BASE URL from there if exported.
           config/api.ts does NOT export base url.
        */
        const res = await fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/items`);

        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Failed to fetch items' }));
            throw new Error(err.error || err.message || 'Failed to fetch items');
        }
        return res.json();
    },

    createOrder: async (items: OrderItem[]) => {
        const res = await fetch(`${endpoints.processOrder}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Failed to place order' }));
            throw new Error(err.error || err.message || 'Failed to place order');
        },
        return res.json();
    },

    createItem: async (data: CreateItemDTO) => {
        const res = await fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Failed to create item' }));
            throw new Error(err.error || err.message || 'Failed to create item');
        }
        return res.json();
    },

    createRecipe: async (data: CreateRecipeDTO) => {
        const res = await fetch(`${endpoints.recipes}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Failed to create recipe' }));
            throw new Error(err.error || err.message || 'Failed to create recipe');
        }
        return res.json();
    },

    // --- Recipe CRUD ---
    getRecipe: async (itemId: string) => {
        const res = await fetch(`${endpoints.recipes}/${itemId}`);
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Failed to fetch recipe' }));
            throw new Error(err.error || err.message || 'Failed to fetch recipe');
        }
        return res.json();
    },

    deleteRecipe: async (itemId: string) => {
        const res = await fetch(`${endpoints.recipes}/${itemId}`, {
            method: 'DELETE',
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Failed to delete recipe' }));
            throw new Error(err.error || err.message || 'Failed to delete recipe');
        }
        return res.json();
    },

    updateRecipe: async (itemId: string, data: any) => {
        const res = await fetch(`${endpoints.recipes}/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Failed to update recipe' }));
            throw new Error(err.error || err.message || 'Failed to update recipe');
        }
        return res.json();
    },

    // --- Item CRUD (Raw Materials) ---
    updateItem: async (itemId: string, data: Partial<Item>) => {
        const res = await fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/items/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Failed to update item' }));
            throw new Error(err.error || err.message || 'Failed to update item');
        }
        return res.json();
    },

    deleteItem: async (itemId: string) => {
        // We reuse the recipe delete endpoint as it deletes the underlying item
        const res = await fetch(`${endpoints.recipes}/${itemId}`, {
            method: 'DELETE',
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Failed to delete item' }));
            throw new Error(err.error || err.message || 'Failed to delete item');
        }
        return res.json();
    },

    adjustStock: async (itemId: string, change: number, reason: string) => {
        const res = await fetch(`${endpoints.inventory}/adjust`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId, change, reason }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Failed to adjust stock' }));
            throw new Error(err.error || err.message || 'Failed to adjust stock');
        }
        return res.json();
    },

    recordPrep: async (itemId: string, quantity: number) => {
        const res = await fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/prep`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId, quantity }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Failed to record prep' }));
            throw new Error(err.error || err.message || 'Failed to record prep');
        }
        return res.json();
    },

    getDashboardStats: async (): Promise<DashboardStats> => {
        const res = await fetch(`${endpoints.analytics}/dashboard`);
        if (!res.ok) throw new Error('Failed to fetch dashboard stats');
        return res.json();
    }
};

export type ActivityLog = {
    id: string;
    description: string;
    time: string;
    type: 'SALE' | 'PREP' | 'RESTOCK';
};

export type DashboardStats = {
    totalSales: number;
    activeOrders: number;
    stockAlerts: number;
    inventoryValue: number;
    recentActivity: ActivityLog[];
};
