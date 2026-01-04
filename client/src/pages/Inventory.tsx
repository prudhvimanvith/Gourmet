import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type Item } from '../lib/api';
import { Search, Plus, AlertTriangle, Edit, Trash2, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const Inventory = () => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'RAW' | 'INTERMEDIATE' | 'DISH'>('ALL');

    // Modal States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [adjustingItem, setAdjustingItem] = useState<Item | null>(null);

    // Form Data
    const [formData, setFormData] = useState<{
        name: string;
        sku: string;
        type: 'RAW_MATERIAL' | 'INTERMEDIATE' | 'DISH' | 'MODIFIER';
        unit: string;
        cost_per_unit: number;
        selling_price: number;
        min_threshold: number;
    }>({ name: '', sku: '', type: 'RAW_MATERIAL', unit: 'kg', cost_per_unit: 0, selling_price: 0, min_threshold: 5 });
    const [adjData, setAdjData] = useState({ change: 0, reason: '' });

    // Fetch Data
    const { data: items = [], isLoading } = useQuery({
        queryKey: ['items'],
        queryFn: api.getItems,
        refetchInterval: 5000
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: api.createItem,
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['items'] }); setIsCreateOpen(false); resetForm(); }
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<Item>) => api.updateItem(editingItem!.id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['items'] }); setEditingItem(null); }
    });

    const deleteMutation = useMutation({
        mutationFn: api.deleteItem,
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['items'] }); }
    });

    const adjustMutation = useMutation({
        mutationFn: ({ id, change, reason }: { id: string, change: number, reason: string }) => api.adjustStock(id, change, reason),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['items'] }); setAdjustingItem(null); setAdjData({ change: 0, reason: '' }); }
    });

    const resetForm = () => setFormData({ name: '', sku: '', type: 'RAW_MATERIAL', unit: 'kg', cost_per_unit: 0, selling_price: 0, min_threshold: 5 });

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase());
        const matchesType = filter === 'ALL' ||
            (filter === 'RAW' && item.type === 'RAW_MATERIAL') ||
            (filter === 'INTERMEDIATE' && item.type === 'INTERMEDIATE') ||
            (filter === 'DISH' && item.type === 'DISH');
        return matchesSearch && matchesType;
    });

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] gap-6 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white/70 p-6 backdrop-blur-xl shadow-glass">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Inventory Management</h1>
                    <p className="text-slate-500">Manage stock, raw materials, and intermediates</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsCreateOpen(true); }}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2 font-bold text-white hover:shadow-lg hover:shadow-primary-500/25 transition-all active:scale-95"
                >
                    <Plus className="h-5 w-5" /> Add Item
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search items by name or SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-slate-800 placeholder-slate-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none shadow-sm transition-all"
                    />
                </div>
                {(['ALL', 'RAW', 'INTERMEDIATE', 'DISH'] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setFilter(t)}
                        className={clsx(
                            "px-6 rounded-2xl font-bold transition-all border",
                            filter === t
                                ? "bg-slate-800 text-white border-slate-800 shadow-md"
                                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800"
                        )}
                    >
                        {t === 'ALL' ? 'All Items' : t}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto rounded-3xl border border-slate-200 bg-white/50 backdrop-blur-xl shadow-glass-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/80 text-slate-500 sticky top-0 backdrop-blur-md z-10">
                        <tr>
                            <th className="p-4 font-medium border-b border-slate-200">Item Name</th>
                            <th className="p-4 font-medium border-b border-slate-200">SKU</th>
                            <th className="p-4 font-medium border-b border-slate-200">Type</th>
                            <th className="p-4 font-medium text-right border-b border-slate-200">Stock</th>
                            <th className="p-4 font-medium text-right border-b border-slate-200">Cost</th>
                            <th className="p-4 font-medium text-right border-b border-slate-200">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-400">Loading Inventory...</td></tr>
                        ) : filteredItems.map(item => (
                            <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold text-slate-800">{item.name}</div>
                                    {Number(item.current_stock) <= (item.min_threshold || 5) && item.type !== 'DISH' && (
                                        <div className="flex items-center gap-1 text-xs text-red-500 mt-1 font-medium bg-red-50 w-fit px-2 py-0.5 rounded-full">
                                            <AlertTriangle className="h-3 w-3" /> Low Stock
                                        </div>
                                    )}
                                </td>
                                <td className="p-4 text-sm text-slate-500 font-mono">{item.sku}</td>
                                <td className="p-4">
                                    <span className={clsx(
                                        "px-2 py-1 rounded-md text-xs font-bold ring-1 ring-inset",
                                        item.type === 'RAW_MATERIAL' ? "bg-blue-50 text-blue-600 ring-blue-500/20" :
                                            item.type === 'INTERMEDIATE' ? "bg-amber-50 text-amber-600 ring-amber-500/20" :
                                                "bg-emerald-50 text-emerald-600 ring-emerald-500/20"
                                    )}>
                                        {item.type}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="font-mono font-bold text-slate-700">{Number(item.current_stock).toFixed(2)} <span className="text-slate-400 text-xs font-sans font-normal">{item.unit}</span></div>
                                </td>
                                <td className="p-4 text-right font-mono text-slate-500">${Number(item.cost_per_unit).toFixed(2)}</td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setAdjustingItem(item)}
                                            className="p-2 bg-white border border-slate-200 rounded-lg hover:border-primary-500 hover:text-primary-600 transition-colors shadow-sm" title="Adjust Stock">
                                            <RefreshCw className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingItem(item); setFormData({
                                                    name: item.name,
                                                    sku: item.sku,
                                                    type: item.type, // Type should match now as item.type is typed in API
                                                    unit: item.unit,
                                                    cost_per_unit: Number(item.cost_per_unit),
                                                    selling_price: Number(item.selling_price || 0),
                                                    min_threshold: item.min_threshold || 5
                                                });
                                            }}
                                            className="p-2 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors shadow-sm" title="Edit">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => { if (confirm('Delete ' + item.name + '?')) deleteMutation.mutate(item.id); }}
                                            className="p-2 bg-white border border-slate-200 rounded-lg hover:border-red-500 hover:text-red-500 transition-colors shadow-sm" title="Delete">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create / Edit Modal */}
            <AnimatePresence>
                {(isCreateOpen || editingItem) && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-slate-900/5"
                        >
                            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                <h2 className="text-xl font-bold text-slate-800">{editingItem ? 'Edit Item' : 'Create New Item'}</h2>
                                <button onClick={() => { setIsCreateOpen(false); setEditingItem(null); }}><X className="text-slate-400 hover:text-slate-800" /></button>
                            </div>
                            <div className="space-y-4">
                                <input placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all" />
                                <div className="grid grid-cols-2 gap-4">
                                    <input placeholder="SKU" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all" />
                                    <input placeholder="Unit (kg, ltr)" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1 block font-medium">Cost per Unit</label>
                                        <input type="number" value={formData.cost_per_unit} onChange={e => setFormData({ ...formData, cost_per_unit: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1 block font-medium">Min Threshold</label>
                                        <input type="number" value={formData.min_threshold} onChange={e => setFormData({ ...formData, min_threshold: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all" />
                                    </div>
                                </div>

                                {formData.type === 'DISH' && (
                                    <div>
                                        <label className="text-xs text-emerald-600 mb-1 block font-bold">Selling Price ($)</label>
                                        <input type="number" value={formData.selling_price} onChange={e => setFormData({ ...formData, selling_price: Number(e.target.value) })} className="w-full bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-700 font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
                                    </div>
                                )}

                                {!editingItem && (
                                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all">
                                        <option value="RAW_MATERIAL">Raw Material</option>
                                        <option value="INTERMEDIATE">Intermediate (Prep)</option>
                                        <option value="DISH">Dish (Product)</option>
                                    </select>
                                )}
                                <button
                                    onClick={() => editingItem ? updateMutation.mutate(formData) : createMutation.mutate({ ...formData, is_auto_explode: false })}
                                    className="w-full rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 py-3 font-bold text-white hover:shadow-lg hover:shadow-primary-500/25 transition-all mt-4"
                                >
                                    {editingItem ? 'Save Changes' : 'Create Item'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Adjust Stock Modal */}
            <AnimatePresence>
                {adjustingItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-slate-900/5"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-800">Adjust Stock</h2>
                                <button onClick={() => setAdjustingItem(null)}><X className="text-slate-400 hover:text-slate-800" /></button>
                            </div>
                            <div className="text-center mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="text-slate-500 text-sm font-medium">Current Stock for <span className="text-slate-800 font-bold">{adjustingItem.name}</span></div>
                                <div className="text-4xl font-mono font-bold text-slate-800 my-2">{Number(adjustingItem.current_stock)} <span className="text-lg text-slate-400">{adjustingItem.unit}</span></div>
                            </div>
                            <div className="space-y-4">
                                <input type="number" placeholder="Adjustment (+ / -)" value={adjData.change} onChange={e => setAdjData({ ...adjData, change: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-2xl font-mono text-center text-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all" />
                                <input placeholder="Reason (Delivery, Waste...)" value={adjData.reason} onChange={e => setAdjData({ ...adjData, reason: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all" />
                                <button
                                    onClick={() => adjustMutation.mutate({ id: adjustingItem.id, ...adjData })}
                                    className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25 transition-all mt-2"
                                >
                                    Confirm Adjustment
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Inventory;
