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
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:shadow-neon hover:border-primary-400 transition-all duration-300"
                >
                    <div>
                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 font-bold group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                            {item.name.charAt(0)}
                        </div>
                        <h3 className="line-clamp-2 font-bold text-slate-800 group-hover:text-primary-700 transition-colors">{item.name}</h3>
                        <p className="text-xs text-slate-400 font-mono mt-1">{item.sku}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-lg font-bold text-slate-800">${Number(item.selling_price || 0).toFixed(2)}</span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-500 opacity-0 transition-opacity group-hover:opacity-100 shadow-sm">
                            <Plus className="h-5 w-5" />
                        </div>
                    </div>

                    {/* Simulated Stock Fuel Gauge */}
                    <div className="absolute bottom-0 left-0 h-1 w-full bg-slate-100">
                        <div
                            className={clsx(
                                "h-full transition-all duration-500",
                                Number(item.current_stock) > 10 ? "bg-primary-500" : "bg-red-500"
                            )}
                            style={{ width: `${Math.min(Number(item.current_stock) * 10, 100)}%` }}
                        />
                    </div>
                </motion.button>
            ))}
        </div>
    );
};

export default MenuGrid;
