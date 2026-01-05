import { LayoutDashboard, Store, Package, ChefHat, Settings, LogOut, ScrollText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const { user, logout } = useAuth();

    const allNavItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['ADMIN', 'CHEF', 'CASHIER'] },
        { icon: Store, label: 'POS Terminal', path: '/pos', roles: ['ADMIN', 'CASHIER'] },
        { icon: ScrollText, label: 'Recipes', path: '/recipes', roles: ['ADMIN', 'CHEF'] },
        { icon: ChefHat, label: 'Kitchen / Prep', path: '/prep', roles: ['ADMIN', 'CHEF'] },
        { icon: Package, label: 'Inventory', path: '/items', roles: ['ADMIN', 'CHEF'] },
        { icon: Settings, label: 'Settings', path: '/settings', roles: ['ADMIN', 'CHEF', 'CASHIER'] },
    ];

    const navItems = allNavItems.filter(item => user && item.roles.includes(user.role));

    return (
        <aside className="flex h-screen w-20 flex-col items-center border-r border-slate-200 bg-white/70 py-8 backdrop-blur-xl transition-all duration-300 hover:w-64 group z-50 shadow-glass">

            {/* Brand */}
            <div className="mb-12 flex items-center justify-center gap-3 overflow-hidden whitespace-nowrap px-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/20 text-white">
                    <span className="text-xl font-bold">G</span>
                </div>
                <span className="hidden text-xl font-bold tracking-wider text-slate-800 opacity-0 transition-all group-hover:block group-hover:opacity-100">
                    GOURMET
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
                                    ? "bg-primary-50 text-primary-600 shadow-sm ring-1 ring-primary-200"
                                    : "text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                            )}
                        >
                            {/* Active Indicator Line */}
                            {isActive && (
                                <div className="absolute left-0 h-6 w-1 rounded-r-full bg-primary-500" />
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
                <div className="mb-2 hidden px-4 text-xs text-slate-400 font-medium group-hover:block uppercase tracking-wider">
                    <span className="text-primary-600">{user?.username}</span> Workspace
                </div>
                <button
                    onClick={logout}
                    className="flex h-12 w-full items-center gap-4 overflow-hidden rounded-xl px-4 text-critical hover:bg-red-50"
                >
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
