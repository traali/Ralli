import { Loader2 } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export const ProtectedRoute: React.FC = () => {
	const [loading, setLoading] = useState(true);
	const [authenticated, setAuthenticated] = useState(false);

	useEffect(() => {
		const checkAuth = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			setAuthenticated(!!session);
			setLoading(false);
		};
		checkAuth();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setAuthenticated(!!session);
		});

		return () => subscription.unsubscribe();
	}, []);

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
			</div>
		);
	}

	if (!authenticated) {
		return <Navigate to="/login" replace />;
	}

	return <Outlet />;
};
