import { CheckCircle2, Flag, Loader2, Users } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Team = Database['public']['Tables']['teams']['Row'];
type Race = Database['public']['Tables']['races']['Row'];

export const LobbyPage: React.FC = () => {
	const { id: raceId } = useParams<{ id: string }>();
	const [race, setRace] = useState<Race | null>(null);
	const [teams, setTeams] = useState<Team[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!raceId) return;

		// 1. Fetch initial data
		const fetchData = async () => {
			const { data: raceData } = await supabase.from('races').select('*').eq('id', raceId).single();
			const { data: teamsData } = await supabase.from('teams').select('*').eq('race_id', raceId);

			if (raceData) setRace(raceData);
			if (teamsData) setTeams(teamsData);
			setLoading(false);

			// If race already started, redirect
			if (raceData?.status === 'active') {
				window.location.href = `/race/${raceId}`;
			}
		};

		fetchData();

		// 2. Subscribe to REALTIME updates
		const teamsChannel = supabase
			.channel(`lobby-${raceId}`)
			.on(
				'postgres_changes',
				{ event: '*', schema: 'public', table: 'teams', filter: `race_id=eq.${raceId}` },
				(payload) => {
					if (payload.eventType === 'INSERT') {
						setTeams((prev) => [...prev, payload.new as Team]);
					}
				},
			)
			.on(
				'postgres_changes',
				{ event: 'UPDATE', schema: 'public', table: 'races', filter: `id=eq.${raceId}` },
				(payload) => {
					const newStatus = (payload.new as Race).status;
					if (newStatus === 'active') {
						window.location.href = `/race/${raceId}`;
					}
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(teamsChannel);
		};
	}, [raceId]);

	if (loading) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center">
				<Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
				<p className="mt-4 text-slate-600 font-medium">Entering Lobby...</p>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
			<div className="mb-12 text-center">
				<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-200">
					<Flag className="h-10 w-10" />
				</div>
				<h1 className="text-4xl font-extrabold text-slate-900">{race?.name}</h1>
				<p className="mt-3 text-lg text-slate-600">The race will start soon. Stay tuned!</p>
			</div>

			<div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
				<div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
					<h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
						<Users className="h-6 w-6 text-indigo-500" />
						Connected Teams
					</h2>
					<span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
						{teams.length} Joined
					</span>
				</div>

				<div className="space-y-3">
					{teams.length === 0 ? (
						<div className="py-8 text-center text-slate-400 italic">
							Waiting for first teams to join...
						</div>
					) : (
						teams.map((team) => (
							<div
								key={team.id}
								className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 transition-colors hover:bg-slate-100"
							>
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm font-bold text-indigo-600">
										{team.name.charAt(0).toUpperCase()}
									</div>
									<span className="font-bold text-slate-900">{team.name}</span>
								</div>
								<CheckCircle2 className="h-5 w-5 text-emerald-500" />
							</div>
						))
					)}
				</div>

				<div className="mt-8 border-t border-slate-100 pt-8">
					<div className="flex items-center gap-4 rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-700">
						<div className="flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-indigo-500 text-[10px] text-white font-bold">
							!
						</div>
						<p>
							When the Game Master starts the race, you will be automatically redirected to your
							first clue.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};
