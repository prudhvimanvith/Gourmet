import { Trash2, ChevronRight, ShoppingCart } from 'lucide-react';
import type { Item } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface CartSidebarProps {
    cart: { item: Item; qty: number }[];
    onRemove: (itemId: string) => void;
    onUpdateQty: (itemId: string, delta: number) => void;
    onCheckout: () => void;
    isProcessing: boolean;
}

const CartSidebar = ({ cart, onRemove, onUpdateQty, onCheckout, isProcessing }: CartSidebarProps) => {
    const total = cart.reduce((acc, curr) => acc + (Number(curr.item.selling_price || 0) * curr.qty), 0);

    return (
        <div className="flex h-full w-full flex-col bg-white/50 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-200 p-6 bg-white/50">
                <h2 className="text-xl font-bold text-slate-800">Current Order</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Order #{Math.floor(Math.random() * 1000)}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <AnimatePresence>
                    {cart.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex h-full flex-col items-center justify-center text-slate-400"
                        >
                            <ShoppingCart className="mb-4 h-12 w-12 opacity-20" />
                            <p className="font-medium">Cart is empty</p>
                        </motion.div>
                    ) : (
                        cart.map((line) => (
                            <motion.div
                                key={line.item.id}
                                layout
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="mb-3 flex items-center justify-between rounded-xl bg-white border border-slate-100 p-4 shadow-sm"
                            >
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800">{line.item.name}</h4>
                                    <p className="text-sm text-slate-500 font-medium">
                                        {line.qty} x ${Number(line.item.selling_price || 0).toFixed(2)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center rounded-lg bg-slate-50 border border-slate-200">
                                        <button
                                            onClick={() => onUpdateQty(line.item.id, -1)}
                                            className="px-2 py-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-l-lg transition-colors"
                                        >-</button>
                                        <span className="w-6 text-center text-sm font-bold text-slate-700">{line.qty}</span>
                                        <button
                                            onClick={() => onUpdateQty(line.item.id, 1)}
                                            className="px-2 py-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-r-lg transition-colors"
                                        >+</button>
                                    </div>
                                    <span className="font-mono font-bold text-slate-800 min-w-[3rem] text-right">
                                        ${(line.qty * Number(line.item.selling_price || 0)).toFixed(2)}
                                    </span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <div className="border-t border-slate-200 bg-white/80 p-6 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between text-slate-500 font-medium">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                </div>
                <div className="mb-6 flex items-center justify-between text-2xl font-bold text-slate-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                </div>

                <button
                    onClick={onCheckout}
                    disabled={cart.length === 0 || isProcessing}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 py-4 font-bold text-white shadow-lg shadow-primary-500/25 transition-all hover:shadow-primary-500/40 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    {isProcessing ? 'Processing...' : 'Charge & Print'}
                    {!isProcessing && <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />}
                </button>
            </div>
        </div>
    );
};

export default CartSidebar;
