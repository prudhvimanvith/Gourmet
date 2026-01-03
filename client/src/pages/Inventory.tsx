import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type Item } from '../lib/api';
import { Search, Plus, AlertTriangle, Package, Edit, Trash2, RefreshCw, X, Save } from 'lucide-react';
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
    const [formData, setFormData] = useState({ name: '', sku: '', type: 'RAW_MATERIAL', unit: 'kg', cost_per_unit: 0, min_threshold: 5 });
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

    const resetForm = () => setFormData({ name: '', sku: '', type: 'RAW_MATERIAL', unit: 'kg', cost_per_unit: 0, min_threshold: 5 });

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
            <div className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Inventory</h1>
                    <p className="text-slate-400">Manage stock, raw materials, and intermediates</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsCreateOpen(true); }}
                    className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 font-bold text-slate-900 hover:bg-emerald-400"
                >
                    <Plus className="h-5 w-5" /> Add Item
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search items by name or SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 py-4 pl-12 pr-4 text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none backdrop-blur-sm"
                    />
                </div>
                {(['ALL', 'RAW', 'INTERMEDIATE', 'DISH'] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setFilter(t)}
                        className={clsx(
                            "px-6 rounded-2xl font-bold transition-all",
                            filter === t ? "bg-slate-700 text-slate-100" : "bg-slate-900/50 text-slate-500 hover:bg-slate-800"
                        )}
                    >
                        {t === 'ALL' ? 'All Items' : t}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-800/50 text-slate-400 sticky top-0 backdrop-blur-md">
                        <tr>
                            <th className="p-4 font-medium">Item Name</th>
                            <th className="p-4 font-medium">SKU</th>
                            <th className="p-4 font-medium">Type</th>
                            <th className="p-4 font-medium text-right">Stock</th>
                            <th className="p-4 font-medium text-right">Cost</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {isLoading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading Inventory...</td></tr>
                        ) : filteredItems.map(item => (
                            <tr key={item.id} className="group hover:bg-slate-800/30 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold text-slate-200">{item.name}</div>
                                    {Number(item.current_stock) <= (item.min_threshold || 5) && item.type !== 'DISH' && (
                                        <div className="flex items-center gap-1 text-xs text-rose-400 mt-1">
                                            <AlertTriangle className="h-3 w-3" /> Low Stock
                                        </div>
                                    )}
                                </td>
                                <td className="p-4 text-sm text-slate-500 font-mono">{item.sku}</td>
                                <td className="p-4">
                                    <span className={clsx(
                                        "px-2 py-1 rounded text-xs font-bold",
                                        item.type === 'RAW_MATERIAL' ? "bg-blue-500/10 text-blue-400" :
                                            item.type === 'INTERMEDIATE' ? "bg-amber-500/10 text-amber-400" :
                                                "bg-emerald-500/10 text-emerald-400"
                                    )}>
                                        {item.type}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="font-mono text-slate-200">{Number(item.current_stock).toFixed(2)} <span className="text-secondary text-xs">{item.unit}</span></div>
                                </td>
                                <td className="p-4 text-right font-mono text-slate-400">${Number(item.cost_per_unit).toFixed(2)}</td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setAdjustingItem(item)}
                                            className="p-2 bg-slate-800 rounded-lg hover:bg-emerald-500 hover:text-slate-900 transition-colors" title="Adjust Stock">
                                            <RefreshCw className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => { setEditingItem(item); setFormData({ ...item, type: item.type as any, cost_per_unit: Number(item.cost_per_unit), min_threshold: item.min_threshold || 5 }); }}
                                            className="p-2 bg-slate-800 rounded-lg hover:bg-blue-500 hover:text-white transition-colors" title="Edit">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => { if (confirm('Delete ' + item.name + '?')) deleteMutation.mutate(item.id); }}
                                            className="p-2 bg-slate-800 rounded-lg hover:bg-rose-500 hover:text-white transition-colors" title="Delete">
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-100">{editingItem ? 'Edit Item' : 'Create New Item'}</h2>
                                <button onClick={() => { setIsCreateOpen(false); setEditingItem(null); }}><X className="text-slate-400 hover:text-white" /></button>
                            </div>
                            <div className="space-y-4">
                                <input placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:border-emerald-500 outline-none" />
                                <div className="grid grid-cols-2 gap-4">
                                    <input placeholder="SKU" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:border-emerald-500 outline-none" />
                                    <input placeholder="Unit (kg, ltr)" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:border-emerald-500 outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1 block">Cost per Unit</label>
                                        <input type="number" value={formData.cost_per_unit} onChange={e => setFormData({ ...formData, cost_per_unit: Number(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:border-emerald-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1 block">Min Threshold</label>
                                        <input type="number" value={formData.min_threshold} onChange={e => setFormData({ ...formData, min_threshold: Number(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:border-emerald-500 outline-none" />
                                    </div>
                                </div>
                                {!editingItem && (
                                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:border-emerald-500 outline-none">
                                        <option value="RAW_MATERIAL">Raw Material</option>
                                        <option value="INTERMEDIATE">Intermediate (Prep)</option>
                                        <option value="DISH">Dish (Product)</option>
                                    </select>
                                )}
                                <button
                                    onClick={() => editingItem ? updateMutation.mutate(formData) : createMutation.mutate({ ...formData, is_auto_explode: false })}
                                    className="w-full rounded-xl bg-emerald-500 py-3 font-bold text-slate-900 hover:bg-emerald-400 mt-4"
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-100">Adjust Stock</h2>
                                <button onClick={() => setAdjustingItem(null)}><X className="text-slate-400 hover:text-white" /></button>
                            </div>
                            <div className="text-center mb-6">
                                <div className="text-slate-400 text-sm">Current Stock for {adjustingItem.name}</div>
                                <div className="text-4xl font-mono font-bold text-slate-100 my-2">{Number(adjustingItem.current_stock)} <span className="text-lg">{adjustingItem.unit}</span></div>
                            </div>
                            <div className="space-y-4">
                                <input type="number" placeholder="Adjustment (+ / -)" value={adjData.change} onChange={e => setAdjData({ ...adjData, change: Number(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-2xl font-mono text-center text-slate-100 focus:border-emerald-500 outline-none" />
                                <input placeholder="Reason (Delivery, Waste...)" value={adjData.reason} onChange={e => setAdjData({ ...adjData, reason: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:border-emerald-500 outline-none" />
                                <button
                                    onClick={() => adjustMutation.mutate({ id: adjustingItem.id, ...adjData })}
                                    className="w-full rounded-xl bg-blue-500 py-3 font-bold text-white hover:bg-blue-400 mt-2"
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
