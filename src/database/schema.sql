-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum for Item Types
DO $$ BEGIN
    CREATE TYPE item_type AS ENUM ('RAW_MATERIAL', 'INTERMEDIATE', 'DISH', 'MODIFIER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Items Table
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(50) UNIQUE,
    type item_type NOT NULL,
    unit VARCHAR(20) NOT NULL,
    current_stock DECIMAL(10, 4) DEFAULT 0 CHECK (current_stock >= 0),
    min_threshold DECIMAL(10, 4) DEFAULT 10,
    cost_per_unit DECIMAL(10, 2) DEFAULT 0,
    is_auto_explode BOOLEAN DEFAULT FALSE, -- If TRUE, automatically deduct ingredients on sale (for phantom/JIT items)
    created_at TIMESTAMP DEFAULT NOW()
);

-- Recipes Header
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    output_item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    batch_size DECIMAL(10, 4) DEFAULT 1,
    instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Recipe Ingredients
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    component_item_id UUID REFERENCES items(id) ON DELETE RESTRICT,
    quantity DECIMAL(10, 4) NOT NULL,
    wastage_percent DECIMAL(5, 2) DEFAULT 0
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pos_order_ref VARCHAR(100),
    status VARCHAR(50) DEFAULT 'PENDING',
    total_amount DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id),
    quantity INT NOT NULL,
    price_at_sale DECIMAL(10, 2)
);

-- Inventory Transactions (Ledger)
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES items(id),
    quantity_change DECIMAL(10, 4) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- SALE, PREP_IN, PREP_OUT, PURCHASE, WASTAGE
    reference_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_items_type ON items(type);
CREATE INDEX IF NOT EXISTS idx_recipe_output ON recipes(output_item_id);
CREATE INDEX IF NOT EXISTS idx_inv_item_date ON inventory_transactions(item_id, created_at);
