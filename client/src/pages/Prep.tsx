import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type Item } from '../lib/api';
import { ChefHat, ArrowUpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const Prep = () => {
    const queryClient = useQueryClient();
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [quantity, setQuantity] = useState(1);

    // Fetch Only Intermediate Items
    const { data: items = [], isLoading } = useQuery({
        queryKey: ['items'],
        queryFn: api.getItems
    });

    const intermediateItems = items.filter(i => i.type === 'INTERMEDIATE');

    const prepMutation = useMutation({
        mutationFn: ({ itemId, qty }: { itemId: string, qty: number }) => api.recordPrep(itemId, qty),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            setSelectedItem(null);
            setQuantity(1);
            alert("Prep Recorded Successfully!");
        },
        onError: (err) => {
            alert("Failed to record prep: " + err);
        }
    });

    const handlePrep = () => {
        if (!selectedItem) return;
        prepMutation.mutate({ itemId: selectedItem.id, qty: quantity });
    };

    return (
        <div className="flex h-[calc(100vh-2rem)] flex-col gap-6 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white/70 p-6 backdrop-blur-xl shadow-glass">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Kitchen Prep Station</h1>
                    <p className="text-slate-500">Record production of batters, doughs, and sauces</p>
                </div>
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden">
                {/* Left: Item Selection */}
                <div className="flex-1 overflow-y-auto rounded-3xl border border-slate-200 bg-white/50 p-6 backdrop-blur-xl shadow-glass-sm">
                    {isLoading ? (
                        <div className="text-slate-400 font-medium text-center p-10 animate-pulse">Loading Prep Items...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {intermediateItems.length === 0 ? (
                                <div className="col-span-full text-center text-slate-400 py-10">
                                    No intermediate items found. Create some in Inventory first.
                                </div>
                            ) : intermediateItems.map((item) => (
                                <motion.button
                                    key={item.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedItem(item)}
                                    className={clsx(
                                        "flex flex-col items-start gap-2 rounded-2xl border p-6 text-left transition-all duration-300",
                                        selectedItem?.id === item.id
                                            ? "border-primary-500 bg-primary-50 shadow-md ring-1 ring-primary-500"
                                            : "border-slate-200 bg-white hover:border-primary-200 hover:shadow-lg hover:shadow-primary-500/5"
                                    )}
                                >
                                    <div className="flex w-full items-center justify-between">
                                        <div className={clsx(
                                            "flex h-10 w-10 items-center justify-center rounded-xl",
                                            selectedItem?.id === item.id ? "bg-primary-500 text-white" : "bg-slate-100 text-slate-500"
                                        )}>
                                            <ChefHat className="h-6 w-6" />
                                        </div>
                                        <span className={clsx(
                                            "font-mono text-sm font-bold px-2 py-1 rounded-md",
                                            Number(item.current_stock) < (item.min_threshold || 5)
                                                ? "bg-red-50 text-red-500"
                                                : "bg-slate-50 text-slate-500"
                                        )}>
                                            {Number(item.current_stock)} {item.unit}
                                        </span>
                                    </div>
                                    <h3 className={clsx(
                                        "text-lg font-bold mt-2",
                                        selectedItem?.id === item.id ? "text-primary-900" : "text-slate-800"
                                    )}>{item.name}</h3>
                                    <p className={clsx(
                                        "text-xs font-mono",
                                        selectedItem?.id === item.id ? "text-primary-600" : "text-slate-400"
                                    )}>{item.sku}</p>
                                </motion.button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Action Panel */}
                <AnimatePresence>
                    {selectedItem && (
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 50, opacity: 0 }}
                            className="w-96 flex flex-col justify-between rounded-3xl border border-slate-200 bg-white/80 p-8 backdrop-blur-xl shadow-glass z-10"
                        >
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 mb-2">Record Production</h2>
                                <p className="text-slate-500 mb-8 text-sm">
                                    Producing <span className="font-bold text-slate-800">{selectedItem.name}</span> will deduct raw ingredients from inventory.
                                </p>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide">Quantity ({selectedItem.unit})</label>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Number(e.target.value))}
                                            min="0"
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-3xl font-bold text-slate-800 placeholder-slate-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:bg-white outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handlePrep}
                                disabled={prepMutation.isPending || quantity <= 0}
                                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-4 font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                <span className="relative z-10">
                                    {prepMutation.isPending ? 'Recording...' : 'Confirm Production'}
                                </span>
                                <ArrowUpCircle className="relative z-10 h-5 w-5 transition-transform group-hover:-translate-y-1" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Prep;
