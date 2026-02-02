import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Trophy, Hash } from 'lucide-react';
import type { Database } from '../../types/supabase';

type Team = Database['public']['Tables']['teams']['Row'];

export const RealtimeLeaderboard: React.FC = () => {
    const { id: raceId } = useParams<{ id: string }>();
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!raceId) return;

        const fetchLeaderboard = async () => {
            const { data, error } = await supabase
                .from('teams')
                .select('*')
                .eq('race_id', raceId)
                .order('score', { ascending: false })
                .order('current_step_index', { ascending: false })
                .order('updated_at', { ascending: true });

            if (error) console.error(error);
            else setTeams(data || []);
            setLoading(false);
        };

        fetchLeaderboard();

        const channel = supabase
            .channel(`leaderboard-${raceId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'teams', filter: `race_id=eq.${raceId}` },
                () => fetchLeaderboard()
            )
            .subscribe((status) => {
                if (status === 'CHANNEL_ERROR') {
                    console.error('Leaderboard: Realtime connection failed');
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [raceId]);

    if (loading) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Trophy className="text-amber-500" /> Leaderboard
                </h2>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            <th className="px-6 py-4 w-16">Rank</th>
                            <th className="px-6 py-4">Team</th>
                            <th className="px-6 py-4 text-center">Step</th>
                            <th className="px-6 py-4 text-right">Points</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {teams.map((team, index) => (
                            <tr key={team.id} className="transition-colors hover:bg-slate-50/80">
                                <td className="px-6 py-4">
                                    {index === 0 ? (
                                        <Trophy className="h-5 w-5 text-amber-500" />
                                    ) : (
                                        <span className="font-bold text-slate-400">#{index + 1}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-xs">
                                            {team.name[0].toUpperCase()}
                                        </div>
                                        <span className="font-bold text-slate-900">{team.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">
                                        <Hash className="h-3 w-3" /> {team.current_step_index}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-black text-slate-900">
                                    {team.score.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={async () => {
                                            if (confirm(`Force unlock next step for ${team.name}?`)) {
                                                const newIndex = team.current_step_index + 1;
                                                const { error } = await supabase
                                                    .from('teams')
                                                    .update({ current_step_index: newIndex })
                                                    .eq('id', team.id);

                                                if (!error) {
                                                    // Also resolve any pending submissions for the skipped waypoint
                                                    await supabase
                                                        .from('progress')
                                                        .update({ status: 'rejected', rejection_reason: 'Skipped by organizer' })
                                                        .eq('team_id', team.id)
                                                        .eq('status', 'pending');
                                                }
                                            }
                                        }}
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 transition-all hover:border-indigo-600 hover:text-indigo-600"
                                    >
                                        Skip Step
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {teams.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                                    No teams active yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
