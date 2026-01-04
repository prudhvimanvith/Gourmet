import { useState, useEffect } from 'react';
import { Plus, Save, Search, Trash2, Edit3, X, ChefHat, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type Item } from '../lib/api';
import clsx from 'clsx';

type IngredientRow = {
    item: Item;
    qty: number;
    wastage: number;
};

const RecipeBuilder = () => {
    const queryClient = useQueryClient();

    // Mode: 'CREATE' or 'EDIT'
    const [mode, setMode] = useState<'CREATE' | 'EDIT'>('CREATE');
    const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

    // Form State
    const [recipeName, setRecipeName] = useState('');
    const [recipeType, setRecipeType] = useState<'DISH' | 'INTERMEDIATE'>('DISH');
    const [sku, setSku] = useState('');
    const [outputUnit, setOutputUnit] = useState('serving');
    const [sellingPrice, setSellingPrice] = useState(0);
    const [ingredients, setIngredients] = useState<IngredientRow[]>([]);

    // Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [itemSearch, setItemSearch] = useState('');

    // Fetch All Items (Ingredients & Dishes)
    const { data: items = [] } = useQuery({ queryKey: ['items'], queryFn: api.getItems });

    // Arrays for easy access
    const existingRecipes = items.filter(i => i.type === 'DISH' || i.type === 'INTERMEDIATE');
    const availableIngredients = items.filter(i =>
        i.name.toLowerCase().includes(itemSearch.toLowerCase()) && i.type !== 'DISH'
    );

    // Load Recipe for Editing
    const loadRecipe = async (item: Item) => {
        try {
            const recipeData = await api.getRecipe(item.id);
            setMode('EDIT');
            setSelectedRecipeId(item.id);
            setRecipeName(item.name);
            setSku(item.sku);
            setOutputUnit(item.unit);
            setSellingPrice(Number(item.selling_price || 0));
            setRecipeType(item.type as 'DISH' | 'INTERMEDIATE');

            // Map ingredients
            const rows = recipeData.ingredients.map((ing: any) => ({
                item: {
                    id: ing.component_item_id,
                    name: ing.name,
                    sku: ing.sku,
                    unit: ing.unit,
                    type: 'RAW_MATERIAL' as const,
                    cost_per_unit: ing.cost_per_unit,
                    current_stock: 0
                },
                qty: Number(ing.quantity),
                wastage: Number(ing.wastage_percent)
            }));
            setIngredients(rows);
        } catch (err) {
            console.error(err);
            alert("Failed to load recipe details.");
        }
    };

    const resetForm = () => {
        setMode('CREATE');
        setSelectedRecipeId(null);
        setRecipeName('');
        setRecipeType('DISH');
        setSku('');
        setSellingPrice(0);
        setIngredients([]);
    };

    // Ingredient Management
    const addIngredient = (item: Item) => {
        if (ingredients.find(row => row.item.id === item.id)) return;
        setIngredients(prev => [...prev, { item, qty: 1, wastage: 0 }]);
    };

    const removeIngredient = (id: string) => {
        setIngredients(prev => prev.filter(row => row.item.id !== id));
    };

    const updateIngredient = (id: string, field: 'qty' | 'wastage', value: number) => {
        setIngredients(prev => prev.map(row =>
            row.item.id === id ? { ...row, [field]: value } : row
        ));
    };

    // CRUD Ops
    const createMutation = useMutation({
        mutationFn: async () => {
            const { id } = await api.createItem({
                name: recipeName, sku, type: recipeType, unit: outputUnit, cost_per_unit: 0, selling_price: sellingPrice, is_auto_explode: recipeType === 'DISH'
            });
            await api.createRecipe({
                output_item_id: id, batch_size: 1, instructions: ' Std',
                ingredients: ingredients.map(r => ({ component_item_id: r.item.id, quantity: r.qty, wastage_percent: r.wastage }))
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            resetForm();
            alert("Recipe Created!");
        }
    });

    const updateMutation = useMutation({
        mutationFn: async () => {
            if (!selectedRecipeId) return;
            await api.updateRecipe(selectedRecipeId, {
                name: recipeName, sku, unit: outputUnit, selling_price: sellingPrice,
                ingredients: ingredients.map(r => ({ component_item_id: r.item.id, quantity: r.qty, wastage_percent: r.wastage }))
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            alert("Recipe Updated!");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            if (!selectedRecipeId) return;
            if (!confirm(`Are you sure you want to delete ${recipeName}?`)) return;
            await api.deleteRecipe(selectedRecipeId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            resetForm();
        }
    });

    const handleSubmit = () => {
        if (!recipeName || ingredients.length === 0) return alert("Fill required fields");
        if (mode === 'CREATE') createMutation.mutate();
        else updateMutation.mutate();
    };

    return (
        <div className="flex h-[calc(100vh-2rem)] gap-6 overflow-hidden">
            {/* Sidebar: Recipe List */}
            <div className="w-80 flex flex-col rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-xl shadow-glass">
                <div className="p-4 border-b border-slate-200">
                    <button
                        onClick={resetForm}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 py-3 font-bold text-white shadow-md hover:shadow-lg transition-all mb-4"
                    >
                        <Plus className="h-4 w-4" /> New Recipe
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Find recipe..."
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 text-sm text-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {existingRecipes
                        .filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(r => (
                            <div
                                key={r.id}
                                onClick={() => loadRecipe(r)}
                                className={clsx(
                                    "p-3 rounded-xl cursor-pointer transition-all border",
                                    selectedRecipeId === r.id
                                        ? "bg-primary-50 border-primary-500/50 shadow-sm"
                                        : "hover:bg-slate-50 border-transparent text-slate-500 hover:text-slate-800"
                                )}
                            >
                                <div className={clsx("font-bold", selectedRecipeId === r.id ? "text-primary-900" : "text-slate-700")}>{r.name}</div>
                                <div className={clsx("text-xs font-mono", selectedRecipeId === r.id ? "text-primary-600" : "text-slate-400")}>{r.sku}</div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Main Editor */}
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                {/* Header Actions */}
                <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white/70 p-6 backdrop-blur-xl shadow-glass">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            {mode === 'CREATE' ? 'New Recipe' : 'Edit Recipe'}
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        {mode === 'EDIT' && (
                            <button
                                onClick={() => deleteMutation.mutate()}
                                className="flex items-center gap-2 rounded-xl bg-red-50 px-6 py-2 font-bold text-red-500 hover:bg-red-100 transition-colors border border-red-200"
                            >
                                <Trash2 className="h-4 w-4" /> Delete
                            </button>
                        )}
                        <button
                            onClick={handleSubmit}
                            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2 font-bold text-white hover:bg-emerald-600 shadow-md transition-all hover:shadow-lg"
                        >
                            <Save className="h-4 w-4" /> {mode === 'CREATE' ? 'Create' : 'Update'}
                        </button>
                    </div>
                </div>

                {/* Form Content */}
                <div className="flex flex-1 gap-6 overflow-hidden">
                    {/* Left: Inputs & Grid */}
                    <div className="flex-1 overflow-y-auto rounded-3xl border border-slate-200 bg-white/50 p-6 backdrop-blur-xl shadow-glass-sm">
                        <div className="grid grid-cols-4 gap-4 mb-6">
                            <div className="col-span-2">
                                <label className="text-xs text-slate-500 mb-1 ml-1 block font-medium">Recipe Name</label>
                                <input
                                    value={recipeName}
                                    onChange={(e) => setRecipeName(e.target.value)}
                                    placeholder="e.g. Cheese Burger / Marinara Sauce"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-slate-500 mb-1 ml-1 block font-medium">Item Type</label>
                                <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200">
                                    <button
                                        onClick={() => setRecipeType('DISH')}
                                        className={clsx("flex-1 py-2 rounded-lg font-bold text-sm transition-all shadow-sm", recipeType === 'DISH' ? "bg-emerald-500 text-white shadow-md" : "text-slate-500 hover:bg-white")}
                                    >DISH (Sale)</button>
                                    <button
                                        onClick={() => setRecipeType('INTERMEDIATE')}
                                        className={clsx("flex-1 py-2 rounded-lg font-bold text-sm transition-all shadow-sm", recipeType === 'INTERMEDIATE' ? "bg-amber-500 text-white shadow-md" : "text-slate-500 hover:bg-white")}
                                    >PREP (Batch)</button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 ml-1 block font-medium">SKU / Code</label>
                                <input
                                    value={sku}
                                    onChange={(e) => setSku(e.target.value)}
                                    placeholder="SKU"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 ml-1 block font-medium">Unit</label>
                                <select
                                    value={outputUnit}
                                    onChange={(e) => setOutputUnit(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                                >
                                    <option value="serving">Serving</option>
                                    <option value="kg">Kg</option>
                                    <option value="ltr">Ltr</option>
                                    <option value="pan">Pan</option>
                                </select>
                            </div>
                            {recipeType === 'DISH' && (
                                <div className="col-span-2">
                                    <label className="text-xs text-emerald-600 mb-1 ml-1 block font-bold">Selling Price ($)</label>
                                    <input
                                        type="number"
                                        value={sellingPrice}
                                        onChange={(e) => setSellingPrice(Number(e.target.value))}
                                        placeholder="0.00"
                                        className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 font-bold text-emerald-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-right transition-all"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Ingredients List */}
                        <div className="space-y-3">
                            {ingredients.map((row, idx) => (
                                <motion.div
                                    key={row.item.id}
                                    layout
                                    className="grid grid-cols-12 gap-4 items-center rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
                                >
                                    <div className="col-span-1 text-slate-400 font-medium">#{idx + 1}</div>
                                    <div className="col-span-5 font-bold text-slate-700">{row.item.name}</div>
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            value={row.qty}
                                            onChange={(e) => updateIngredient(row.item.id, 'qty', Number(e.target.value))}
                                            className="w-full rounded bg-slate-50 border border-slate-200 px-2 py-1 text-slate-800 text-center focus:border-primary-500 focus:outline-none"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            value={row.wastage}
                                            onChange={(e) => updateIngredient(row.item.id, 'wastage', Number(e.target.value))}
                                            className="w-full rounded bg-slate-50 border border-slate-200 px-2 py-1 text-slate-800 text-center focus:border-primary-500 focus:outline-none"
                                        />
                                    </div>
                                    <div className="col-span-2 text-right">
                                        <button onClick={() => removeIngredient(row.item.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                            {ingredients.length === 0 && (
                                <div className="text-center p-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                                    No ingredients added. Select from sidebar.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Ingredient Selector */}
                    <div className="w-80 flex flex-col rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-xl shadow-glass">
                        <div className="p-4 border-b border-slate-200">
                            <input
                                value={itemSearch}
                                onChange={(e) => setItemSearch(e.target.value)}
                                placeholder="Search ingredients..."
                                className="w-full rounded-xl border border-slate-200 bg-white py-2 px-4 text-sm text-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {availableIngredients.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => addIngredient(item)}
                                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 hover:border-primary-200 hover:shadow-md cursor-pointer text-sm transition-all group"
                                >
                                    <span className="text-slate-700 font-medium">{item.name}</span>
                                    <Plus className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeBuilder;
