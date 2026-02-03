import { AlertCircle, Loader2, Lock, Mail } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const LoginPage: React.FC = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			setError(error.message);
			setLoading(false);
		} else {
			// Redirect handled by Auth listener in future or simple reload
			window.location.href = '/organizer';
		}
	};

	return (
		<div className="mx-auto flex w-full max-w-md flex-col justify-center py-12">
			<div className="mb-8 text-center">
				<h1 className="text-3xl font-bold text-slate-900">Organizer Login</h1>
				<p className="mt-2 text-slate-600">Enter your credentials to manage your races.</p>
			</div>

			<div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
				<form onSubmit={handleLogin} className="space-y-6">
					{error && (
						<div className="flex items-center gap-3 rounded-xl bg-rose-50 p-4 text-sm text-rose-600">
							<AlertCircle className="h-5 w-5 flex-shrink-0" />
							<p>{error}</p>
						</div>
					)}

					<div className="space-y-2">
						<label className="text-sm font-semibold text-slate-700" htmlFor="email">
							Email Address
						</label>
						<div className="relative">
							<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
								<Mail className="h-5 w-5" />
							</div>
							<input
								id="email"
								type="email"
								required
								className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
								placeholder="name@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-semibold text-slate-700" htmlFor="password">
							Password
						</label>
						<div className="relative">
							<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
								<Lock className="h-5 w-5" />
							</div>
							<input
								id="password"
								type="password"
								required
								className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="flex w-full items-center justify-center rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
					</button>
				</form>
			</div>
		</div>
	);
};
