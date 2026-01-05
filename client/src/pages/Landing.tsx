import { motion } from 'framer-motion';
import { ArrowRight, ChefHat, Database, BarChart3, LayoutGrid, DollarSign, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-primary-100">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                            G
                        </div>
                        Gourmet POS
                    </div>
                    <Link to="/login">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-5 py-2 rounded-full bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                        >
                            Staff Login
                        </motion.button>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 -z-10 opacity-30">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-200 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-200 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-bold uppercase tracking-wider mb-6 border border-primary-100">
                            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                            Next Gen Food Tech
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
                            The Brain of Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-amber-500">Modern Kitchen.</span>
                        </h1>
                        <p className="text-xl text-slate-600 mb-8 max-w-lg leading-relaxed">
                            A complete operating system for restaurants. From smart inventory deduction to dynamic recipe costing, Gourmet handles the math so you can focus on the food.
                        </p>
                        <div className="flex gap-4">
                            <Link to="/login">
                                <button className="px-8 py-4 rounded-2xl bg-primary-500 text-white font-bold text-lg hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/30 flex items-center gap-2 group">
                                    Launch Demo <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            <button className="px-8 py-4 rounded-2xl bg-white text-slate-700 font-bold text-lg hover:bg-slate-50 transition-all shadow-md border border-slate-200">
                                View Docs
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative"
                    >
                        {/* Abstract UI representation */}
                        <div className="relative z-10 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl p-6 rotate-2 hover:rotate-0 transition-transform duration-500">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 rounded-3xl -z-10"></div>
                            {/* Mock Chart */}
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <div className="h-2 w-24 bg-slate-200 rounded-full mb-2"></div>
                                    <div className="h-4 w-16 bg-slate-800 rounded-full"></div>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-slate-100"></div>
                            </div>
                            <div className="flex items-end gap-4 h-48 mb-6">
                                <div className="w-full bg-primary-100 rounded-t-xl h-[60%] relative group overflow-hidden"><div className="absolute inset-0 bg-primary-500 opacity-20 group-hover:opacity-30 transition-opacity"></div></div>
                                <div className="w-full bg-primary-500 rounded-t-xl h-[80%] shadow-lg shadow-primary-500/30"></div>
                                <div className="w-full bg-primary-100 rounded-t-xl h-[50%]"></div>
                                <div className="w-full bg-amber-100 rounded-t-xl h-[70%]"></div>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600 font-bold">$</div>
                                    <div>
                                        <div className="text-xs text-slate-400 font-bold uppercase">Net Profit</div>
                                        <div className="font-bold text-slate-800">+24.5%</div>
                                    </div>
                                </div>
                                <div className="text-xs font-mono text-slate-400">REALTIME</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Core Technology</h2>
                        <p className="text-slate-500 text-lg">Gourmet isn't just a POS. It's an intelligent engine that understands the relationship between your menu and your stockroom.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Database className="h-6 w-6 text-indigo-500" />}
                            title="Recursive Inventory"
                            desc="When you sell a Burger, Gourmet doesn't just deduct '1 Burger'. It explodes the recipe and deducts 1 Bun, 1 Patty, and 20g Sauce automatically."
                            color="bg-indigo-50"
                        />
                        <FeatureCard
                            icon={<ChefHat className="h-6 w-6 text-primary-500" />}
                            title="Smart Prep"
                            desc="Track intermediate items (like Marinara Sauce) separately. Prep batches in the kitchen and see them update in stock instantly."
                            color="bg-primary-50"
                        />
                        <FeatureCard
                            icon={<DollarSign className="h-6 w-6 text-emerald-500" />}
                            title="Dynamic Costing"
                            desc="Know exactly how much every dish costs to make. If the price of flour goes up, your Pizza cost updates automatically."
                            color="bg-emerald-50"
                        />
                        <FeatureCard
                            icon={<LayoutGrid className="h-6 w-6 text-amber-500" />}
                            title="Visual POS"
                            desc="A cashier interface designed for speed. Visual cues, instant stock warnings, and lightning-fast checkout flows."
                            color="bg-amber-50"
                        />
                        <FeatureCard
                            icon={<BarChart3 className="h-6 w-6 text-blue-500" />}
                            title="Deep Analytics"
                            desc="Visualize sales trends, wastage reports, and inventory value over time with beautiful, interactive charts."
                            color="bg-blue-50"
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="h-6 w-6 text-rose-500" />}
                            title="Role-Based Security"
                            desc="Granular permissions for Admins, Chefs, and Cashiers. Keep sensitive data and settings secure."
                            color="bg-rose-50"
                        />
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-24 bg-slate-50 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">How the Magic Happens</h2>
                            <div className="space-y-8">
                                <Step
                                    num="01"
                                    title="Define the Recipe"
                                    desc="Chefs build recipes in the system using raw ingredients. Example: 'Pizza' = 200g Dough + 50g Sauce + 100g Cheese."
                                />
                                <Step
                                    num="02"
                                    title="Sell or Prep"
                                    desc="When a cashier sells a Pizza, Gourmet looks up the recipe. It doesn't find 'Pizza' in stock, so it looks deeper."
                                />
                                <Step
                                    num="03"
                                    title="Auto-Deduction"
                                    desc="The system automatically deducts the exact grams of Cheese, Sauce, and Dough from your inventory in real-time."
                                />
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-square rounded-3xl bg-white border border-slate-200 shadow-2xl p-8 flex flex-col justify-center">
                                {/* Visual Diagram */}
                                <div className="flex justify-center mb-8">
                                    <div className="p-4 rounded-xl bg-slate-800 text-white font-bold shadow-lg">Pizza (Dish)</div>
                                </div>
                                <div className="flex justify-center mb-8">
                                    <div className="h-8 w-px bg-slate-300"></div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="bg-primary-50 p-3 rounded-lg border border-primary-100">
                                        <div className="text-xs text-primary-500 font-bold mb-1">200g</div>
                                        <div className="text-slate-700 font-medium text-sm">Dough</div>
                                    </div>
                                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                                        <div className="text-xs text-amber-500 font-bold mb-1">50g</div>
                                        <div className="text-slate-700 font-medium text-sm">Sauce</div>
                                    </div>
                                    <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                        <div className="text-xs text-emerald-500 font-bold mb-1">100g</div>
                                        <div className="text-slate-700 font-medium text-sm">Cheese</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="bg-slate-900 py-12 text-slate-400 text-sm">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
                    <div className="col-span-2">
                        <div className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                            <div className="h-6 w-6 rounded-lg bg-primary-500 flex items-center justify-center text-white text-xs">G</div>
                            Gourmet POS
                        </div>
                        <p className="max-w-xs leading-relaxed opacity-80">
                            Built for modern culinary businesses that demand precision and efficiency.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Product</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Company</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                            <li><a href="/login" className="hover:text-white transition-colors">Staff Login</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-800 text-center">
                    &copy; {new Date().getFullYear()} Gourmet Systems Inc. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc, color }: any) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all"
    >
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-6`}>
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
    </motion.div>
);

const Step = ({ num, title, desc }: any) => (
    <div className="flex gap-6">
        <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center font-bold text-slate-300">
            {num}
        </div>
        <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-500">{desc}</p>
        </div>
    </div>
);

export default Landing;
