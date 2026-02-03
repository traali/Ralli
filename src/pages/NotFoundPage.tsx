import { Home as HomeIcon } from 'lucide-react';
import type React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
			<div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
				<HomeIcon className="h-10 w-10" />
			</div>
			<h1 className="mb-2 text-4xl font-extrabold text-slate-900">404</h1>
			<p className="mb-8 text-lg text-slate-600">This waypoint doesn't exist.</p>
			<Link
				to="/"
				className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300 active:scale-95"
			>
				Go Home
			</Link>
		</div>
	);
};
