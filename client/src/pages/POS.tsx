import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api, type Item, type OrderItem } from '../lib/api';
import MenuGrid from '../components/pos/MenuGrid';
import CartSidebar from '../components/pos/CartSidebar';
import { Search } from 'lucide-react';

const POS = () => {
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<{ item: Item; qty: number }[]>([]);

    // Fetch Items
    const { data: items = [], isLoading } = useQuery({
        queryKey: ['items'],
        queryFn: api.getItems
    });

    // Calculate Deductions (Preview)
    // In a real app, we might query an endpoint for this, here we imply it visually.

    // Checkout Mutation
    const checkoutMutation = useMutation({
        mutationFn: api.createOrder,
        onSuccess: () => {
            setCart([]); // Clear cart
            alert('Order Placed Successfully! Inventory Deducted.');
        },
        onError: (err) => {
            alert('Order Failed: ' + err);
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

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(i => i.item.id !== itemId));
    };

    const handleCheckout = () => {
        const orderItems: OrderItem[] = cart.map(c => ({ itemId: c.item.id, qty: c.qty }));
        checkoutMutation.mutate(orderItems);
    };

    return (
        <div className="flex h-[calc(100vh-2rem)] gap-6 overflow-hidden">
            {/* Left: Menu Area */}
            <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                {/* Top Bar */}
                <div className="flex items-center justify-between border-b border-slate-800 p-6">
                    <h1 className="text-2xl font-bold text-slate-100">Menu</h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search dishes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-64 rounded-xl border border-slate-700 bg-slate-800 py-2 pl-10 pr-4 text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex h-full items-center justify-center text-emerald-400">Loading Menu...</div>
                    ) : (
                        <MenuGrid items={items} search={search} onAddToCart={addToCart} />
                    )}
                </div>
            </div>

            {/* Right: Cart */}
            <div className="overflow-hidden rounded-3xl border border-slate-800">
                <CartSidebar
                    cart={cart}
                    onRemove={removeFromCart}
                    onCheckout={handleCheckout}
                    isProcessing={checkoutMutation.isPending}
                />
            </div>
        </div>
    );
};

export default POS;
