import { LayoutDashboard, Store, Package, ChefHat, Settings, LogOut, ScrollText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx'; // Using clsx for conditional classes

const Sidebar = () => {
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Store, label: 'POS Terminal', path: '/pos' },
        { icon: ScrollText, label: 'Recipes', path: '/recipes' },
        { icon: ChefHat, label: 'Kitchen / Prep', path: '/prep' },
        { icon: Package, label: 'Inventory', path: '/items' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside className="flex h-screen w-20 flex-col items-center border-r border-slate-800 bg-slate-900/95 py-8 backdrop-blur-xl transition-all duration-300 hover:w-64 group z-50">

            {/* Brand */}
            <div className="mb-12 flex items-center justify-center gap-3 overflow-hidden whitespace-nowrap px-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/20">
                    <span className="text-xl font-bold text-slate-900">G</span>
                </div>
                <span className="hidden text-xl font-bold tracking-wider text-slate-100 opacity-0 transition-all group-hover:block group-hover:opacity-100">
                    GOURMET<span className="text-emerald-400">POS</span>
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex w-full flex-1 flex-col gap-2 px-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                "group/item relative flex h-12 w-full items-center gap-4 overflow-hidden rounded-xl px-4 transition-all",
                                isActive
                                    ? "bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                            )}
                        >
                            {/* Active Indicator Line */}
                            {isActive && (
                                <div className="absolute left-0 h-8 w-1 rounded-r-full bg-emerald-400" />
                            )}

                            <item.icon className={clsx("h-6 w-6 shrink-0 transition-transform", isActive && "scale-110")} />

                            <span className="hidden whitespace-nowrap font-medium opacity-0 transition-opacity group-hover:block group-hover:opacity-100">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / User */}
            <div className="mt-auto w-full px-2">
                <button className="flex h-12 w-full items-center gap-4 overflow-hidden rounded-xl px-4 text-rose-400 hover:bg-rose-500/10">
                    <LogOut className="h-6 w-6 shrink-0" />
                    <span className="hidden whitespace-nowrap font-medium opacity-0 group-hover:block group-hover:opacity-100">
                        Logout
                    </span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
