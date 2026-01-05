
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle } from 'lucide-react';

import { endpoints } from '../config/api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showForgot, setShowForgot] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const loginMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(endpoints.login, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Login failed');
            }
            return res.json();
        },
        onSuccess: (data) => {
            login(data.token, data.user);
            navigate('/');
        },
        onError: (err: any) => {
            setError(err.message);
        }
    });

    return (
        <div className="flex h-screen w-full items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-200 via-slate-50 to-white overflow-hidden relative">

            {/* Background Blobs for specific aesthetic appeal */}
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary-400/30 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-400/30 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute top-[40%] left-[30%] w-96 h-96 bg-purple-400/30 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob animation-delay-4000"></div>

            <div className="w-full max-w-md m-4 relative z-10">
                <div className="rounded-3xl border border-white/50 bg-white/60 p-8 shadow-glass-lg backdrop-blur-xl">
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30 text-white transform rotate-3 hover:rotate-6 transition-transform duration-300">
                            <span className="text-3xl font-bold">G</span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Welcome Back</h1>
                        <p className="text-slate-500 mt-2 font-medium">Sign in to your Gourmet Experience</p>
                    </div>

                    <div className="space-y-6">
                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-sm font-bold text-red-600 animate-shake">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white/80 py-4 pl-12 pr-4 text-slate-800 placeholder-slate-400 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white/80 py-4 pl-12 pr-4 text-slate-800 placeholder-slate-400 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
                                    onKeyDown={(e) => e.key === 'Enter' && loginMutation.mutate()}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <button
                                onClick={() => setShowForgot(true)}
                                className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                            >
                                Forgot Password?
                            </button>
                        </div>

                        <button
                            onClick={() => loginMutation.mutate()}
                            disabled={loginMutation.isPending}
                            className="w-full rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 py-4 font-bold text-white shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loginMutation.isPending ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </div>
                </div>

                <p className="text-center text-slate-400 text-sm mt-8 font-medium">
                    &copy; 2026 Gourmet System
                </p>

                {/* Forgot Password Modal */}
                {showForgot && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rounded-3xl p-6">
                        <div className="bg-white rounded-2xl p-6 shadow-xl w-full space-y-4 animate-in fade-in zoom-in duration-200">
                            <div className="flex items-center gap-3 text-primary-600 mb-2">
                                <AlertCircle className="h-6 w-6" />
                                <h3 className="text-lg font-bold text-slate-800">Password Recovery</h3>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Enter your email address to receive a password reset link.
                            </p>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-primary-500"
                                onKeyDown={async (e) => {
                                    if (e.key === 'Enter') {
                                        const email = (e.target as HTMLInputElement).value;
                                        if (!email) return;
                                        try {
                                            await fetch(endpoints.forgotPassword, {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ email })
                                            });
                                            alert(`If an account exists for ${email}, a reset link has been sent.`);
                                            setShowForgot(false);
                                        } catch (err) {
                                            alert("Failed to send request");
                                        }
                                    }
                                }}
                            />

                            <div className="flex justify-end gap-2">
                                <button onClick={() => setShowForgot(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg">Cancel</button>
                                <button onClick={async () => {
                                    const input = document.querySelector('input[type="email"]') as HTMLInputElement;
                                    const email = input?.value;
                                    if (!email) return;
                                    try {
                                        await fetch(endpoints.forgotPassword, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ email })
                                        });
                                        alert(`If an account exists for ${email}, a reset link has been sent.`);
                                        setShowForgot(false);
                                    } catch (err) {
                                        alert("Failed to send request");
                                    }
                                }} className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-700">Send Link</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
