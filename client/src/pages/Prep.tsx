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
            <div className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Kitchen Prep Station</h1>
                    <p className="text-slate-400">Record production of batters, doughs, and sauces</p>
                </div>
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden">
                {/* Left: Item Selection */}
                <div className="flex-1 overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
                    {isLoading ? (
                        <div className="text-emerald-400">Loading Prep Items...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {intermediateItems.map((item) => (
                                <motion.button
                                    key={item.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedItem(item)}
                                    className={clsx(
                                        "flex flex-col items-start gap-2 rounded-2xl border p-6 text-left transition-all",
                                        selectedItem?.id === item.id
                                            ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                                            : "border-slate-700 bg-slate-800 hover:border-slate-600 hover:bg-slate-750"
                                    )}
                                >
                                    <div className="flex w-full items-center justify-between">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700 text-amber-400">
                                            <ChefHat className="h-6 w-6" />
                                        </div>
                                        <span className={clsx(
                                            "font-mono text-sm font-bold",
                                            Number(item.current_stock) < (item.min_threshold || 5) ? "text-rose-400" : "text-slate-400"
                                        )}>
                                            {Number(item.current_stock)} {item.unit}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-100">{item.name}</h3>
                                    <p className="text-xs text-slate-500">{item.sku}</p>
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
                            className="w-96 flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm"
                        >
                            <div>
                                <h2 className="text-xl font-bold text-slate-100 mb-2">Record Production</h2>
                                <p className="text-slate-400 mb-8">
                                    Producing <b>{selectedItem.name}</b> will deduct raw ingredients from inventory.
                                </p>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Quantity Produced ({selectedItem.unit})</label>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Number(e.target.value))}
                                            min="0"
                                            className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-6 py-4 text-3xl font-bold text-slate-100 placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handlePrep}
                                disabled={prepMutation.isPending || quantity <= 0}
                                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-emerald-500 py-4 font-bold text-slate-900 transition-all hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
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
