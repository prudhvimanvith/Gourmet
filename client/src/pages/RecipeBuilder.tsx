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
    const [sku, setSku] = useState('');
    const [outputUnit, setOutputUnit] = useState('serving');
    const [ingredients, setIngredients] = useState<IngredientRow[]>([]);

    // Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [itemSearch, setItemSearch] = useState('');

    // Fetch All Items (Ingredients & Dishes)
    const { data: items = [] } = useQuery({ queryKey: ['items'], queryFn: api.getItems });

    // Arrays for easy access
    const existingRecipes = items.filter(i => i.type === 'DISH' || (i.type === 'INTERMEDIATE' && i.is_auto_explode));
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
        setSku('');
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
                name: recipeName, sku, type: 'DISH', unit: outputUnit, cost_per_unit: 0, is_auto_explode: true
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
                name: recipeName, sku, unit: outputUnit,
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
            <div className="w-80 flex flex-col rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <div className="p-4 border-b border-slate-800">
                    <button
                        onClick={resetForm}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 py-3 font-bold text-emerald-400 hover:bg-emerald-500/20 mb-4"
                    >
                        <Plus className="h-4 w-4" /> New Recipe
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Find recipe..."
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 pl-10 text-sm text-slate-100 focus:outline-none"
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
                                        ? "bg-slate-800 border-emerald-500/50"
                                        : "hover:bg-slate-800/50 border-transparent text-slate-400"
                                )}
                            >
                                <div className="font-bold text-slate-200">{r.name}</div>
                                <div className="text-xs">{r.sku}</div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Main Editor */}
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                {/* Header Actions */}
                <div className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">
                            {mode === 'CREATE' ? 'New Recipe' : 'Edit Recipe'}
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        {mode === 'EDIT' && (
                            <button
                                onClick={() => deleteMutation.mutate()}
                                className="flex items-center gap-2 rounded-xl bg-rose-500/10 px-6 py-2 font-bold text-rose-400 hover:bg-rose-500/20"
                            >
                                <Trash2 className="h-4 w-4" /> Delete
                            </button>
                        )}
                        <button
                            onClick={handleSubmit}
                            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2 font-bold text-slate-900 hover:bg-emerald-400"
                        >
                            <Save className="h-4 w-4" /> {mode === 'CREATE' ? 'Create' : 'Update'}
                        </button>
                    </div>
                </div>

                {/* Form Content */}
                <div className="flex flex-1 gap-6 overflow-hidden">
                    {/* Left: Inputs & Grid */}
                    <div className="flex-1 overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <input
                                value={recipeName}
                                onChange={(e) => setRecipeName(e.target.value)}
                                placeholder="Recipe Name"
                                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 font-bold text-slate-100 focus:border-emerald-500 focus:outline-none"
                            />
                            <input
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                                placeholder="SKU"
                                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 font-mono text-slate-100 focus:outline-none"
                            />
                            <select
                                value={outputUnit}
                                onChange={(e) => setOutputUnit(e.target.value)}
                                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 focus:outline-none"
                            >
                                <option value="serving">Serving</option>
                                <option value="kg">Kg</option>
                                <option value="ltr">Ltr</option>
                            </select>
                        </div>

                        {/* Ingredients List */}
                        <div className="space-y-3">
                            {ingredients.map((row, idx) => (
                                <motion.div
                                    key={row.item.id}
                                    layout
                                    className="grid grid-cols-12 gap-4 items-center rounded-xl border border-slate-800 bg-slate-800/50 p-4"
                                >
                                    <div className="col-span-1 text-slate-500">#{idx + 1}</div>
                                    <div className="col-span-5 font-bold text-slate-200">{row.item.name}</div>
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            value={row.qty}
                                            onChange={(e) => updateIngredient(row.item.id, 'qty', Number(e.target.value))}
                                            className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-slate-100"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            value={row.wastage}
                                            onChange={(e) => updateIngredient(row.item.id, 'wastage', Number(e.target.value))}
                                            className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-slate-100"
                                        />
                                    </div>
                                    <div className="col-span-2 text-right">
                                        <button onClick={() => removeIngredient(row.item.id)} className="text-rose-400 hover:text-rose-300">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                            {ingredients.length === 0 && (
                                <div className="text-center p-8 text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                                    No ingredients added. Select from sidebar.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Ingredient Selector */}
                    <div className="w-80 flex flex-col rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                        <div className="p-4 border-b border-slate-800">
                            <input
                                value={itemSearch}
                                onChange={(e) => setItemSearch(e.target.value)}
                                placeholder="Search ingredients..."
                                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 px-4 text-sm text-slate-100 focus:outline-none"
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {availableIngredients.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => addIngredient(item)}
                                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-slate-700 cursor-pointer text-sm"
                                >
                                    <span className="text-slate-200">{item.name}</span>
                                    <Plus className="h-4 w-4 text-emerald-500" />
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
