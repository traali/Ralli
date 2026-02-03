import { Flag } from 'lucide-react';
import type React from 'react';
import { Link, Outlet } from 'react-router-dom';

export const AppLayout: React.FC = () => {
	return (
		<div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
			<header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
				<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
					<Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
							<Flag className="h-6 w-6" />
						</div>
						<span className="text-xl font-bold tracking-tight text-slate-900">Ralli</span>
					</Link>

					<nav className="flex items-center gap-4">
						<Link
							to="/login"
							className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
						>
							Login
						</Link>
						<Link
							to="/organizer"
							className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95"
						>
							Organizer
						</Link>
					</nav>
				</div>
			</header>

			<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<Outlet />
			</main>

			<footer className="mt-auto border-t border-slate-200 bg-white py-8">
				<div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
					<p className="text-sm text-slate-500">
						&copy; {new Date().getFullYear()} Ralli Scavenger Hunts. Built for robustness.
					</p>
				</div>
			</footer>
		</div>
	);
};
