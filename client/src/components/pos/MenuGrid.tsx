import { Plus } from 'lucide-react';
import type { Item } from '../../lib/api';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface MenuGridProps {
    items: Item[];
    onAddToCart: (item: Item) => void;
    search: string;
}

const MenuGrid = ({ items, onAddToCart, search }: MenuGridProps) => {
    const filteredItems = items.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) && i.type === 'DISH'
    );

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredItems.map((item) => (
                <motion.button
                    key={item.id}
                    layoutId={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onAddToCart(item)}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 p-4 text-left shadow-lg hover:border-emerald-500/50 hover:bg-slate-750 transition-colors"
                >
                    <div>
                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-700/50 text-slate-300">
                            {item.name.charAt(0)}
                        </div>
                        <h3 className="line-clamp-2 font-bold text-slate-100">{item.name}</h3>
                        <p className="text-xs text-slate-400">{item.sku}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-lg font-bold text-emerald-400">$12.00</span> {/* Mock Price */}
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 opacity-0 transition-opacity group-hover:opacity-100">
                            <Plus className="h-5 w-5" />
                        </div>
                    </div>

                    {/* Simulated Stock Fuel Gauge */}
                    <div className="absolute bottom-0 left-0 h-1 w-full bg-slate-700">
                        <div
                            className={clsx(
                                "h-full transition-all duration-500",
                                item.current_stock > 10 ? "bg-emerald-500" : "bg-rose-500"
                            )}
                            style={{ width: `${Math.min(item.current_stock * 10, 100)}%` }} // Logic placeholder
                        />
                    </div>
                </motion.button>
            ))}
        </div>
    );
};

export default MenuGrid;
