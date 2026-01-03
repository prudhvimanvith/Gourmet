import { useState } from 'react';
import { Save, Store, Users, Database, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const Settings = () => {
    const [activeTab, setActiveTab] = useState<'GENERAL' | 'USERS' | 'DATA'>('GENERAL');

    // Mock Data for now
    const [storeName, setStoreName] = useState('Gourmet Burger Kitchen');
    const [taxRate, setTaxRate] = useState(10);
    const [currency, setCurrency] = useState('$');

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] gap-6 overflow-hidden">
            {/* Header */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
                <h1 className="text-2xl font-bold text-slate-100">System Settings</h1>
                <p className="text-slate-400">Configure store details, users, and system preferences</p>
            </div>

            <div className="flex flex-1 gap-8 overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="w-64 flex flex-col gap-2">
                    <button
                        onClick={() => setActiveTab('GENERAL')}
                        className={clsx(
                            "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left",
                            activeTab === 'GENERAL' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                        )}
                    >
                        <Store className="h-5 w-5" /> General
                    </button>
                    <button
                        onClick={() => setActiveTab('USERS')}
                        className={clsx(
                            "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left",
                            activeTab === 'USERS' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                        )}
                    >
                        <Users className="h-5 w-5" /> User Management
                    </button>
                    <button
                        onClick={() => setActiveTab('DATA')}
                        className={clsx(
                            "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left",
                            activeTab === 'DATA' ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                        )}
                    >
                        <Database className="h-5 w-5" /> Data & Reset
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
                    {activeTab === 'GENERAL' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl space-y-6">
                            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                                <Store className="h-5 w-5 text-emerald-500" /> Store Profile
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Store Name</label>
                                    <input
                                        value={storeName} onChange={(e) => setStoreName(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:border-emerald-500 outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Currency Symbol</label>
                                        <input
                                            value={currency} onChange={(e) => setCurrency(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:border-emerald-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Tax Rate (%)</label>
                                        <input
                                            type="number"
                                            value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:border-emerald-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <button className="flex items-center gap-2 bg-emerald-500 text-slate-900 px-6 py-2 rounded-xl font-bold hover:bg-emerald-400 transition-colors">
                                    <Save className="h-4 w-4" /> Save Changes
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'USERS' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-500" /> Users & Roles
                                </h2>
                                <button className="text-sm bg-blue-500/10 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500/20">
                                    + Add User
                                </button>
                            </div>

                            <div className="text-slate-500 bg-slate-800/30 p-8 rounded-2xl border border-dashed border-slate-700 text-center">
                                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                                <p>User Management module is coming in Phase 3.</p>
                                <p className="text-sm mt-2">Will support: Admin, Chef, and Cashier roles.</p>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'DATA' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl space-y-6">
                            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                                <Database className="h-5 w-5 text-rose-500" /> Data Management
                            </h2>

                            <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl">
                                <h3 className="font-bold text-rose-400 mb-2">Danger Zone</h3>
                                <p className="text-slate-400 text-sm mb-4">Resetting the database will permanently delete all sales, recipes, and inventory data. This cannot be undone.</p>
                                <button className="bg-rose-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-rose-600 transition-colors">
                                    Reset Database
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
