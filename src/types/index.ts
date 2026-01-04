export type ItemType = 'RAW_MATERIAL' | 'INTERMEDIATE' | 'DISH' | 'MODIFIER';

export interface Item {
    id: string;
    name: string;
    sku?: string;
    type: ItemType;
    unit: string;
    current_stock: number;
    min_threshold: number;
    cost_per_unit: number;
    selling_price: number;
    is_auto_explode: boolean;
    created_at: Date;
}

export interface Recipe {
    id: string;
    output_item_id: string;
    batch_size: number;
    instructions?: string;
    is_active: boolean;
    ingredients: RecipeIngredient[];
}

export interface RecipeIngredient {
    id: string;
    recipe_id: string;
    component_item_id: string;
    quantity: number;
    wastage_percent: number;
}

export interface InventoryTransaction {
    id: string;
    item_id: string;
    quantity_change: number;
    transaction_type: 'SALE' | 'PREP_IN' | 'PREP_OUT' | 'PURCHASE' | 'WASTAGE';
    reference_id?: string;
    created_at: Date;
}
