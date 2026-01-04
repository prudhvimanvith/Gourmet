import { Activity, AlertTriangle, Clock, DollarSign, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import StatCard from '../components/dashboard/StatCard';

const Dashboard = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: api.getDashboardStats,
        refetchInterval: 5000 // Real-time polling
    });

    if (isLoading || !stats) {
        return <div className="p-8 text-primary-500 animate-pulse font-medium">Loading System Metrics...</div>;
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Mission Control</h1>
                    <p className="text-slate-500">Real-time operational overview</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/50 px-4 py-2 text-sm font-medium text-primary-600 border border-primary-200 shadow-sm backdrop-blur-sm">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-primary-500" />
                    System Online
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Sales"
                    value={`$${stats.totalSales.toFixed(2)}`}
                    icon={DollarSign}
                    color="primary"
                    trend="Today"
                    trendUp={true}
                />
                <StatCard
                    title="Active Orders"
                    value={stats.activeOrders.toString()}
                    icon={ShoppingBag}
                    color="cyan"
                />
                <StatCard
                    title="Stock Alerts"
                    value={stats.stockAlerts.toString()}
                    icon={AlertTriangle}
                    color="critical"
                    trend={stats.stockAlerts > 0 ? "Critical" : "Healthy"}
                    trendUp={stats.stockAlerts === 0}
                />
                <StatCard
                    title="Inventory Value"
                    value={`$${stats.inventoryValue.toFixed(2)}`}
                    icon={Activity}
                    color="warning"
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Live Flow Visualization Placeholder */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="col-span-2 min-h-[400px] rounded-3xl border border-slate-200 bg-white/70 p-6 backdrop-blur-xl shadow-glass"
                >
                    <h3 className="mb-6 text-xl font-bold text-slate-800">Live Inventory Flow</h3>
                    <div className="flex h-full w-full items-center justify-center rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/50">
                        <p className="text-slate-400 font-medium">Node Graph Visualization (Coming Soon)</p>
                    </div>
                </motion.div>

                {/* Activity Feed */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-3xl border border-slate-200 bg-white/70 p-6 backdrop-blur-xl shadow-glass"
                >
                    <h3 className="mb-6 text-xl font-bold text-slate-800">Live Activity</h3>
                    <div className="space-y-4">
                        {stats.recentActivity.length === 0 ? (
                            <p className="text-slate-400 text-sm">No recent activity recorded.</p>
                        ) : (
                            stats.recentActivity.map((log) => (
                                <div key={log.id} className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white/50 p-4 shadow-sm">
                                    <div className={`h-2 w-2 rounded-full ${log.type === 'SALE' ? 'bg-primary-500' :
                                        log.type === 'PREP' ? 'bg-warning' : 'bg-cyan-500'
                                        }`} />
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">{log.description}</p>
                                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(log.time).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
