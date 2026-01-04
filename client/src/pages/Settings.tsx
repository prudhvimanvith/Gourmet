import { useState, useEffect } from 'react';
import { Save, Store, Users, Database, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { endpoints } from '../config/api';

const Settings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'GENERAL' | 'USERS' | 'DATA'>('GENERAL');

    // Mock Data for now
    const [storeName, setStoreName] = useState('Gourmet Burger Kitchen');
    const [taxRate, setTaxRate] = useState(10);
    const [currency, setCurrency] = useState('$');

    const [users, setUsers] = useState<any[]>([]);
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', email: '', role: 'CASHIER' });
    const [resetTarget, setResetTarget] = useState<any>(null); // For Admin Reset
    const [adminNewPassword, setAdminNewPassword] = useState('');

    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

    const handleUpdatePassword = async () => {
        if (passwords.new !== passwords.confirm) {
            alert("New passwords don't match");
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(endpoints.resetPasswordSelf, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new })
            });

            if (res.ok) {
                alert('Password updated successfully');
                setPasswords({ current: '', new: '', confirm: '' });
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to update password');
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Fetch users when tab becomes active
    useEffect(() => {
        if (activeTab === 'USERS') {
            fetchUsers();
        }
    }, [activeTab]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(endpoints.users, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setUsers(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAdminResetPassword = async () => {
        if (!resetTarget || !adminNewPassword) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(endpoints.adminResetPassword, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ targetUserId: resetTarget.id, newPassword: adminNewPassword })
            });

            if (res.ok) {
                alert('User password reset successfully');
                setResetTarget(null);
                setAdminNewPassword('');
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to reset password');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateUser = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(endpoints.register, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newUser)
            });
            if (res.ok) {
                setShowAddUser(false);
                setNewUser({ username: '', password: '', full_name: '', email: '', role: 'CASHIER' });
                fetchUsers();
                alert('User created successfully');
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to create user');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] gap-6 overflow-hidden">
            {/* Header */}
            <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 backdrop-blur-xl shadow-glass">
                <h1 className="text-2xl font-bold text-slate-800">System Settings</h1>
                <p className="text-slate-500">Configure store details, users, and system preferences</p>
            </div>

            <div className="flex flex-1 gap-8 overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="w-64 flex flex-col gap-2">
                    <button
                        onClick={() => setActiveTab('GENERAL')}
                        className={clsx(
                            "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left",
                            activeTab === 'GENERAL'
                                ? "bg-primary-50 text-primary-600 border border-primary-100 shadow-sm"
                                : "text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm"
                        )}
                    >
                        <Store className="h-5 w-5" /> General
                    </button>

                    {user?.role === 'ADMIN' && (
                        <>
                            <button
                                onClick={() => setActiveTab('USERS')}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left",
                                    activeTab === 'USERS'
                                        ? "bg-blue-50 text-blue-600 border border-blue-100 shadow-sm"
                                        : "text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm"
                                )}
                            >
                                <Users className="h-5 w-5" /> User Management
                            </button>
                            <button
                                onClick={() => setActiveTab('DATA')}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left",
                                    activeTab === 'DATA'
                                        ? "bg-red-50 text-red-600 border border-red-100 shadow-sm"
                                        : "text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm"
                                )}
                            >
                                <Database className="h-5 w-5" /> Data & Reset
                            </button>
                        </>
                    )}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto rounded-3xl border border-slate-200 bg-white/50 p-8 backdrop-blur-xl shadow-glass-sm make-scrollable">
                    {activeTab === 'GENERAL' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl space-y-6">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Store className="h-5 w-5 text-primary-500" /> Store Profile
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Store Name</label>
                                    <input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all shadow-sm" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Currency Symbol</label>
                                        <input value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Tax Rate (%)</label>
                                        <input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all shadow-sm" />
                                    </div>
                                </div>
                                <button className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all">
                                    <Save className="h-4 w-4" /> Save Changes
                                </button>
                            </div>

                            <hr className="border-slate-200 my-6" />

                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-slate-500" /> Security
                            </h2>
                            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
                                <h3 className="font-bold text-slate-700 mb-4">Change Password</h3>
                                <div className="space-y-3">
                                    <input type="password" placeholder="Current Password" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-slate-400" />
                                    <input type="password" placeholder="New Password" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-slate-400" />
                                    <input type="password" placeholder="Confirm New Password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-slate-400" />
                                    <button onClick={handleUpdatePassword} className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors">Update Password</button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'USERS' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-500" /> Users & Roles
                                </h2>
                                <button onClick={() => setShowAddUser(!showAddUser)} className="text-sm bg-blue-50 text-blue-600 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-100 font-bold transition-colors">
                                    {showAddUser ? 'Cancel' : '+ Add User'}
                                </button>
                            </div>

                            {showAddUser && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl space-y-4">
                                    <h3 className="font-bold text-blue-800">New User Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input placeholder="Username" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} className="bg-white border border-blue-200 rounded-xl px-4 py-2 text-sm" />
                                        <input placeholder="Full Name" value={newUser.full_name} onChange={e => setNewUser({ ...newUser, full_name: e.target.value })} className="bg-white border border-blue-200 rounded-xl px-4 py-2 text-sm" />
                                        <input type="email" placeholder="Email Address" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="bg-white border border-blue-200 rounded-xl px-4 py-2 text-sm col-span-2" />
                                        <input type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="bg-white border border-blue-200 rounded-xl px-4 py-2 text-sm" />
                                        <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="bg-white border border-blue-200 rounded-xl px-4 py-2 text-sm">
                                            <option value="CASHIER">Cashier</option>
                                            <option value="CHEF">Chef</option>
                                            <option value="ADMIN">Admin</option>
                                        </select>
                                    </div>
                                    <button onClick={handleCreateUser} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-700">Create User</button>
                                </motion.div>
                            )}

                            <div className="space-y-3">
                                {users.map((u: any) => (
                                    <div key={u.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-4">
                                            <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center font-bold text-white",
                                                u.role === 'ADMIN' ? 'bg-purple-500' : u.role === 'CHEF' ? 'bg-orange-500' : 'bg-emerald-500'
                                            )}>
                                                {u.username[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{u.full_name || u.username}</p>
                                                <p className="text-xs text-slate-500">{u.email}</p>
                                                <p className="text-xs text-slate-500 uppercase tracking-wider">{u.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-sm text-slate-400">
                                                Joined {new Date(u.created_at).toLocaleDateString()}
                                            </div>
                                            <button onClick={() => setResetTarget(u)} className="text-xs text-primary-600 hover:bg-primary-50 px-2 py-1 rounded border border-primary-200 transition-colors">
                                                Reset Pwd
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Simple Reset Password Modal Overlay */}
                            {resetTarget && (
                                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
                                    <div className="bg-white p-6 rounded-2xl shadow-xl w-96 space-y-4">
                                        <h3 className="text-lg font-bold text-slate-800">Reset Password for {resetTarget.username}</h3>
                                        <input
                                            type="password"
                                            placeholder="Enter new password"
                                            value={adminNewPassword}
                                            onChange={(e) => setAdminNewPassword(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => { setResetTarget(null); setAdminNewPassword(''); }} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg">Cancel</button>
                                            <button onClick={handleAdminResetPassword} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold">Reset Password</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
