import { formatDistanceToNow } from 'date-fns';
import { Activity, AlertCircle, Camera, CheckCircle2, Clock, MapPin } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface LogEntry {
	id: string;
	timestamp: string;
	team_name: string;
	event_type: 'verify' | 'submit' | 'approve' | 'reject';
	message: string;
}

interface ProgressWithDetails {
	id: string;
	submitted_at: string;
	status: string;
	teams: { name: string };
	waypoints: { name: string };
}

export const ActivityFeed: React.FC<{ raceId: string }> = ({ raceId }) => {
	const [logs, setLogs] = useState<LogEntry[]>([]);

	useEffect(() => {
		const fetchActivity = async () => {
			const { data } = await supabase
				.from('progress')
				.select(`
                    id,
                    submitted_at,
                    status,
                    teams!inner(name),
                    waypoints!inner(name)
                `)
				.eq('teams.race_id', raceId)
				.order('submitted_at', { ascending: false })
				.limit(20);

			if (data) {
				const formatted: LogEntry[] = (data as unknown as ProgressWithDetails[]).flatMap((p) => {
					const entries: LogEntry[] = [];
					entries.push({
						id: `${p.id}-sub`,
						timestamp: p.submitted_at,
						team_name: p.teams.name,
						event_type: 'submit',
						message: `submitted photo for ${p.waypoints.name}`,
					});
					return entries;
				});
				setLogs(formatted);
			}
		};

		fetchActivity();

		const channel = supabase
			.channel(`activity-${raceId}`)
			.on('postgres_changes', { event: '*', schema: 'public', table: 'progress' }, () => {
				fetchActivity();
			})
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [raceId]);

	const getIcon = (type: string) => {
		switch (type) {
			case 'verify':
				return <MapPin className="h-3 w-3 text-indigo-500" />;
			case 'submit':
				return <Camera className="h-3 w-3 text-amber-500" />;
			case 'approve':
				return <CheckCircle2 className="h-3 w-3 text-emerald-500" />;
			case 'reject':
				return <AlertCircle className="h-3 w-3 text-rose-500" />;
			default:
				return <Activity className="h-3 w-3 text-slate-400" />;
		}
	};

	return (
		<div className="rounded-3xl border border-slate-200 bg-white h-full overflow-hidden shadow-sm">
			<div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
				<h3 className="flex items-center gap-2 font-bold text-slate-900 text-sm">
					<Activity className="h-4 w-4 text-indigo-500" />
					Live Activity
				</h3>
			</div>

			<div className="divide-y divide-slate-50 overflow-y-auto max-h-[500px]">
				{logs.length === 0 ? (
					<div className="p-12 text-center text-slate-400 text-xs italic">No recent activity.</div>
				) : (
					logs.map((log) => (
						<div key={log.id} className="p-4 hover:bg-slate-50/50 transition-colors">
							<div className="flex gap-3">
								<div className="mt-1">{getIcon(log.event_type)}</div>
								<div>
									<p className="text-xs font-medium text-slate-900">
										<span className="font-bold text-indigo-600">{log.team_name}</span> {log.message}
									</p>
									<div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
										<Clock className="h-2 w-2" />
										{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
									</div>
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
};
