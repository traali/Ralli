import {
	CheckCircle2,
	Copy,
	Flag,
	Hash,
	LayoutDashboard,
	Loader2,
	Play,
	Users,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Team = Database['public']['Tables']['teams']['Row'];
type Race = Database['public']['Tables']['races']['Row'];

export const OrganizerLobbyPage: React.FC = () => {
	const { id: raceId } = useParams<{ id: string }>();
	const [race, setRace] = useState<Race | null>(null);
	const [teams, setTeams] = useState<Team[]>([]);
	const [loading, setLoading] = useState(true);
	const [starting, setStarting] = useState(false);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!raceId) return;

		const fetchData = async () => {
			const { data: raceData } = await supabase.from('races').select('*').eq('id', raceId).single();
			const { data: teamsData } = await supabase.from('teams').select('*').eq('race_id', raceId);

			if (raceData) setRace(raceData);
			if (teamsData) setTeams(teamsData);
			setLoading(false);
		};

		fetchData();

		const teamsChannel = supabase
			.channel(`admin-lobby-${raceId}`)
			.on(
				'postgres_changes',
				{ event: 'INSERT', schema: 'public', table: 'teams', filter: `race_id=eq.${raceId}` },
				(payload) => {
					setTeams((prev) => [...prev, payload.new as Team]);
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(teamsChannel);
		};
	}, [raceId]);

	const handleStartRace = async () => {
		if (!raceId || teams.length === 0) return;

		setStarting(true);
		const { error } = await supabase.from('races').update({ status: 'active' }).eq('id', raceId);

		if (error) {
			alert(`Failed to start race: ${error.message}`);
			setStarting(false);
		} else {
			window.location.href = `/organizer/dashboard/${raceId}`;
		}
	};

	const handleCopy = () => {
		navigator.clipboard.writeText(joinLink);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	if (loading) {
		return (
			<div className="flex h-[60vh] flex-col items-center justify-center">
				<Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
			</div>
		);
	}

	const joinLink = `${window.location.origin}/join/${raceId}`;

	return (
		<div className="mx-auto max-w-5xl px-4 py-8">
			<div className="mb-8 flex flex-wrap items-center justify-between gap-4">
				<div className="flex items-center gap-4">
					<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
						<LayoutDashboard className="h-6 w-6" />
					</div>
					<div>
						<h1 className="text-3xl font-bold text-slate-900">{race?.name}</h1>
						<p className="text-slate-500">Event Lobby & Team Management</p>
					</div>
				</div>

				<button
					onClick={handleStartRace}
					disabled={starting || teams.length === 0}
					className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
				>
					{starting ? (
						<Loader2 className="h-5 w-5 animate-spin" />
					) : (
						<>
							<Play className="h-5 w-5 fill-current" /> START RACE
						</>
					)}
				</button>
			</div>

			<div className="grid gap-8 lg:grid-cols-3">
				{/* Left: Info & Code */}
				<div className="space-y-6 lg:col-span-1">
					<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
						<h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
							<Hash className="h-4 w-4 text-indigo-500" />
							Race Access
						</h3>
						<div className="space-y-4">
							<div>
								<label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
									Join URL
								</label>
								<div className="mt-1 flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm font-medium text-slate-600 border border-slate-100">
									<span className="truncate mr-2">{joinLink}</span>
									<button
										onClick={handleCopy}
										className="h-8 w-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-colors active:scale-90"
									>
										{copied ? (
											<CheckCircle2 className="h-4 w-4 text-emerald-500" />
										) : (
											<Copy className="h-4 w-4" />
										)}
									</button>
								</div>
							</div>
							<div>
								<label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
									Race Code
								</label>
								<div className="mt-1 rounded-xl bg-indigo-50 p-4 text-center text-2xl font-black tracking-tighter text-indigo-700 border border-indigo-100 uppercase">
									{raceId?.split('-')[0]}
								</div>
								<p className="mt-2 text-xs text-slate-400 text-center">
									Share this code with your participants
								</p>
							</div>
						</div>
					</div>

					<div className="rounded-3xl border border-slate-200 border-dashed p-6 text-center">
						<Flag className="mx-auto mb-2 h-8 w-8 text-slate-300" />
						<p className="text-sm font-medium text-slate-400 italic font-sans">
							"Great races are organized with clarity."
						</p>
					</div>
				</div>

				{/* Right: Team List */}
				<div className="lg:col-span-2">
					<div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
						<div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
							<h3 className="flex items-center gap-2 font-bold text-slate-900">
								<Users className="h-5 w-5 text-indigo-500" />
								Teams in Lobby ({teams.length})
							</h3>
						</div>

						<div className="divide-y divide-slate-100">
							{teams.length === 0 ? (
								<div className="py-20 text-center">
									<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
										<Users className="h-8 w-8" />
									</div>
									<p className="text-slate-500 font-medium">No teams joined yet.</p>
									<p className="text-xs text-slate-400 mt-1">Waiting for players to connect...</p>
								</div>
							) : (
								teams.map((team, index) => (
									<div
										key={team.id}
										className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50"
									>
										<div className="flex items-center gap-4">
											<span className="text-sm font-bold text-slate-400 w-4">#{index + 1}</span>
											<div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-indigo-600">
												{team.name[0].toUpperCase()}
											</div>
											<span className="font-bold text-slate-900">{team.name}</span>
										</div>
										<div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
											<span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
											READY
										</div>
									</div>
								))
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
