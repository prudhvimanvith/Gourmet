import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    color: 'emerald' | 'cyan' | 'rose' | 'amber';
}

const colorMap = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const StatCard = ({ title, value, icon: Icon, trend, trendUp, color }: StatCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-2xl border ${colorMap[color]} p-6 backdrop-blur-sm`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-400">{title}</p>
                    <h3 className="mt-2 text-3xl font-bold font-mono text-slate-100">{value}</h3>
                </div>
                <div className={`rounded-xl p-3 ${colorMap[color].split(' ')[0]}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>

            {trend && (
                <div className="mt-4 flex items-center gap-2">
                    <span className={`text-xs font-bold ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {trendUp ? '↑' : '↓'} {trend}
                    </span>
                    <span className="text-xs text-slate-500">vs last shift</span>
                </div>
            )}
        </motion.div>
    );
};

export default StatCard;
