import { Trash2, ChevronRight, ShoppingCart } from 'lucide-react';
import type { Item } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface CartSidebarProps {
    cart: { item: Item; qty: number }[];
    onRemove: (itemId: string) => void;
    onCheckout: () => void;
    isProcessing: boolean;
}

const CartSidebar = ({ cart, onRemove, onCheckout, isProcessing }: CartSidebarProps) => {
    const total = cart.reduce((acc, curr) => acc + (12 * curr.qty), 0); // Mock price $12

    return (
        <div className="flex h-full w-96 flex-col border-l border-slate-800 bg-slate-900/95 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800 p-6">
                <h2 className="text-xl font-bold text-slate-100">Current Order</h2>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-400">
                    Order #{Math.floor(Math.random() * 1000)}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <AnimatePresence>
                    {cart.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex h-full flex-col items-center justify-center text-slate-500"
                        >
                            <ShoppingCart className="mb-4 h-12 w-12 opacity-20" />
                            <p>Cart is empty</p>
                        </motion.div>
                    ) : (
                        cart.map((line) => (
                            <motion.div
                                key={line.item.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="mb-3 flex items-center justify-between rounded-xl bg-slate-800/50 p-4"
                            >
                                <div>
                                    <h4 className="font-bold text-slate-200">{line.item.name}</h4>
                                    <p className="text-sm text-slate-500">{line.qty} x $12.00</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-mono font-bold text-emerald-400">
                                        ${(line.qty * 12).toFixed(2)}
                                    </span>
                                    <button
                                        onClick={() => onRemove(line.item.id)}
                                        className="rounded-lg p-2 text-rose-400 hover:bg-rose-500/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <div className="border-t border-slate-800 bg-slate-900 p-6">
                <div className="mb-4 flex items-center justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                </div>
                <div className="mb-6 flex items-center justify-between text-xl font-bold text-slate-100">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                </div>

                <button
                    onClick={onCheckout}
                    disabled={cart.length === 0 || isProcessing}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-4 font-bold text-slate-900 transition-all hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isProcessing ? 'Processing...' : 'Charge & Print'}
                    {!isProcessing && <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />}
                </button>
            </div>
        </div>
    );
};

export default CartSidebar;
