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

    const handlePrint = (items: { item: Item; qty: number }[], total: number, orderId: string) => {
        const printWindow = window.open('', '', 'width=600,height=600');
        if (!printWindow) return;

        const date = new Date().toLocaleString();

        const html = `
            <html>
                <head>
                    <title>Receipt</title>
                    <style>
                        body { font-family: 'Courier New', monospace; text-align: center; max-width: 300px; margin: 0 auto; }
                        .header { margin-bottom: 20px; border-bottom: 1px dashed black; padding-bottom: 10px; }
                        .item { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px; }
                        .total { margin-top: 20px; border-top: 1px dashed black; pt: 10px; font-weight: bold; font-size: 18px; display: flex; justify-content: space-between; }
                        .footer { margin-top: 30px; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>GOURMET POS</h2>
                        <p>Order #${orderId.slice(0, 8)}</p>
                        <p>${date}</p>
                    </div>
                    <div class="items">
                        ${items.map(i => `
                            <div class="item">
                                <span>${i.qty} x ${i.item.name}</span>
                                <span>$${(Number(i.item.selling_price || 0) * i.qty).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="total">
                        <span>TOTAL</span>
                        <span>$${total.toFixed(2)}</span>
                    </div>
                    <div class="footer">
                        <p>Thank you for dining with us!</p>
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    const handleCheckout = () => {
        const total = cart.reduce((acc, curr) => acc + (Number(curr.item.selling_price || 0) * curr.qty), 0);
        const cartCopy = [...cart]; // Capture current cart state

        createOrderMutation.mutate(
            cart.map(line => ({ itemId: line.item.id, qty: line.qty })),
            {
                onSuccess: (data) => {
                    handlePrint(cartCopy, total, data.orderId || 'NEW');
                }
            }
        );
    };

    return (
        <div className="flex h-[calc(100vh-2rem)] gap-6 overflow-hidden">
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
    );
};

export default POS;
