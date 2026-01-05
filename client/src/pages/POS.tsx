import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api, type Item } from '../lib/api';
import MenuGrid from '../components/pos/MenuGrid';
import CartSidebar from '../components/pos/CartSidebar';

const POS = () => {
    const [cart, setCart] = useState<{ item: Item; qty: number }[]>([]);
    const [search, setSearch] = useState('');

    const { data: items = [], isLoading } = useQuery({
        queryKey: ['items'],
        queryFn: api.getItems
    });

    const createOrderMutation = useMutation({
        mutationFn: api.createOrder,
        onSuccess: () => {
            alert('Order Processed Successfully!');
            setCart([]);
        }
    });

    const addToCart = (item: Item) => {
        setCart(prev => {
            const existing = prev.find(i => i.item.id === item.id);
            if (existing) {
                return prev.map(i => i.item.id === item.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { item, qty: 1 }];
        });
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setCart(prev => {
            return prev.map(line => {
                if (line.item.id === itemId) {
                    const newQty = line.qty + delta;
                    if (newQty <= 0) return null; // Remove if 0
                    return { ...line, qty: newQty };
                }
                return line;
            }).filter(Boolean) as { item: Item; qty: number }[];
        });
    };

    // State for storing last successful order to print
    const [lastOrder, setLastOrder] = useState<{ items: { item: Item; qty: number }[], total: number, orderId: string } | null>(null);

    const handleCheckout = () => {
        const total = cart.reduce((acc, curr) => acc + (Number(curr.item.selling_price || 0) * curr.qty), 0);
        const cartCopy = [...cart];

        createOrderMutation.mutate(
            cart.map(line => ({ itemId: line.item.id, qty: line.qty })),
            {
                onSuccess: (data) => {
                    // 1. Set receipt data
                    setLastOrder({
                        items: cartCopy,
                        total,
                        orderId: data.orderId || 'NEW'
                    });

                    // 2. Clear cart
                    setCart([]);

                    // 3. Trigger print after render
                    setTimeout(() => {
                        window.print();
                    }, 100);
                }
            }
        );
    };

    return (
        <>
            <div className="flex h-[calc(100vh-2rem)] gap-6 overflow-hidden print:hidden">
                {/* Main Content: Menu */}
                <div className="flex flex-1 flex-col gap-6 overflow-hidden">
                    {/* Search Bar */}
                    <div className="rounded-3xl border border-slate-200 bg-white/70 p-4 backdrop-blur-xl shadow-glass">
                        <input
                            type="text"
                            placeholder="Search menu..."
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-lg text-slate-800 placeholder-slate-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-100 outline-none transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Grid */}
                    <div className="flex-1 overflow-y-auto rounded-3xl border border-slate-200 bg-white/50 p-6 backdrop-blur-xl shadow-glass-sm">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 animate-pulse">
                                <span className="text-xl font-medium">Loading Menu...</span>
                            </div>
                        ) : (
                            <MenuGrid items={items} onAddToCart={addToCart} search={search} />
                        )}
                    </div>
                </div>

                {/* Sidebar: Cart */}
                <div className="w-96 overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-2xl backdrop-blur-xl z-20">
                    <CartSidebar
                        cart={cart.map(line => ({
                            ...line,
                            item: items.find(i => i.id === line.item.id) || line.item
                        }))}
                        onUpdateQty={updateQuantity}
                        onCheckout={handleCheckout}
                        isProcessing={createOrderMutation.isPending}
                    />
                </div>
            </div>

            {/* HIDDEN PRINTABLE RECEIPT */}
            <div id="printable-receipt" className="hidden">
                {lastOrder && (
                    <div className="p-8 max-w-[300px] mx-auto text-center font-mono text-black">
                        <div className="mb-6 border-b border-dashed border-black pb-4">
                            <h2 className="text-2xl font-bold mb-2">GOURMET POS</h2>
                            <p className="text-sm">Order #{lastOrder.orderId.slice(0, 8)}</p>
                            <p className="text-xs">{new Date().toLocaleString()}</p>
                        </div>

                        <div className="mb-4">
                            {lastOrder.items.map((line, i) => (
                                <div key={i} className="flex justify-between text-sm mb-2">
                                    <span>{line.qty} x {line.item.name}</span>
                                    <span>${(Number(line.item.selling_price || 0) * line.qty).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-dashed border-black pt-4 mb-8">
                            <div className="flex justify-between font-bold text-lg">
                                <span>TOTAL</span>
                                <span>${lastOrder.total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="text-xs">
                            <p>Thank you for dining with us!</p>
                            <p className="mt-2 text-[10px] text-gray-500">Powered by GourmetPOS</p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default POS;
