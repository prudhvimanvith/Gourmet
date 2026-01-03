const API_URL = 'http://localhost:3000/api/v1';

export type Item = {
    id: string;
    name: string;
    type: 'RAW_MATERIAL' | 'INTERMEDIATE' | 'DISH' | 'MODIFIER';
    unit: string;
    cost_per_unit: number | string; // PG returns numeric as string
    current_stock: number | string;
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
        const res = await fetch(`${API_URL}/items`);
        if (!res.ok) throw new Error('Failed to fetch items');
        return res.json();
    },

    createOrder: async (items: OrderItem[]) => {
        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items }),
        });
        if (!res.ok) throw new Error('Failed to place order');
        return res.json();
    },

    createItem: async (data: CreateItemDTO) => {
        const res = await fetch(`${API_URL}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to create item');
        return res.json();
    },

    createRecipe: async (data: CreateRecipeDTO) => {
        const res = await fetch(`${API_URL}/recipes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to create recipe');
        return res.json();
    },

    // --- Recipe CRUD ---
    getRecipe: async (itemId: string) => {
        const res = await fetch(`${API_URL}/recipes/${itemId}`);
        if (!res.ok) throw new Error('Failed to fetch recipe');
        return res.json();
    },

    deleteRecipe: async (itemId: string) => {
        const res = await fetch(`${API_URL}/recipes/${itemId}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete recipe');
        return res.json();
    },

    updateRecipe: async (itemId: string, data: any) => {
        const res = await fetch(`${API_URL}/recipes/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update recipe');
        return res.json();
    },

    updateRecipe: async (itemId: string, data: any) => {
        const res = await fetch(`${API_URL}/recipes/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update recipe');
        return res.json();
    },

    // --- Item CRUD (Raw Materials) ---
    updateItem: async (itemId: string, data: Partial<Item>) => {
        const res = await fetch(`${API_URL}/items/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update item');
        return res.json();
    },

    deleteItem: async (itemId: string) => {
        // We reuse the recipe delete endpoint as it deletes the underlying item
        const res = await fetch(`${API_URL}/recipes/${itemId}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete item');
        return res.json();
    },

    adjustStock: async (itemId: string, change: number, reason: string) => {
        const res = await fetch(`${API_URL}/inventory/adjust`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId, change, reason }),
        });
        if (!res.ok) throw new Error('Failed to adjust stock');
        return res.json();
    },

    recordPrep: async (itemId: string, quantity: number) => {
        const res = await fetch(`${API_URL}/prep`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId, quantity }),
        });
        if (!res.ok) throw new Error('Failed to record prep');
        return res.json();
    },

    getDashboardStats: async (): Promise<DashboardStats> => {
        const res = await fetch(`${API_URL}/analytics/dashboard`);
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
