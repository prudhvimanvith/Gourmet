import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    color: 'primary' | 'cyan' | 'critical' | 'warning';
}

const colorMap = {
    primary: 'bg-primary-50 text-primary-600 border-primary-200 ring-1 ring-primary-100',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200 ring-1 ring-cyan-100',
    critical: 'bg-red-50 text-red-600 border-red-200 ring-1 ring-red-100',
    warning: 'bg-amber-50 text-amber-600 border-amber-200 ring-1 ring-amber-100',
};

const StatCard = ({ title, value, icon: Icon, trend, trendUp, color }: StatCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-2xl border ${colorMap[color]} p-6 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <h3 className="mt-2 text-3xl font-bold font-mono text-slate-800">{value}</h3>
                </div>
                <div className={`rounded-xl p-3 bg-white/50 backdrop-blur-md`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>

            {trend && (
                <div className="mt-4 flex items-center gap-2">
                    <span className={`text-xs font-bold ${trendUp ? 'text-primary-600' : 'text-red-500'}`}>
                        {trendUp ? '↑' : '↓'} {trend}
                    </span>
                    <span className="text-xs text-slate-400">vs last shift</span>
                </div>
            )}
        </motion.div>
    );
};

export default StatCard;
