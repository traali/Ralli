import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Check, X, Loader2, Users, MapPin, Image as ImageIcon } from 'lucide-react';
import type { Database } from '../../types/supabase';

type Progress = Database['public']['Tables']['progress']['Row'];
type Team = Database['public']['Tables']['teams']['Row'];
type Waypoint = Database['public']['Tables']['waypoints']['Row'];

interface Submission extends Progress {
    teams: Team;
    waypoints: Waypoint;
}

export const ReviewQueue: React.FC = () => {
    const { id: raceId } = useParams<{ id: string }>();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!raceId) return;

        const fetchSubmissions = async () => {
            const { data, error } = await supabase
                .from('progress')
                .select(`
          *,
          teams!inner(*),
          waypoints!inner(*)
        `)
                .eq('teams.race_id', raceId)
                .eq('status', 'pending')
                .order('submitted_at', { ascending: true });

            if (error) console.error(error);
            else setSubmissions(data as unknown as Submission[]);
            setLoading(false);
        };

        fetchSubmissions();

        // Realtime subscription for new submissions
        const channel = supabase
            .channel(`review-${raceId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'progress' },
                () => fetchSubmissions() // Refresh on new submission
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [raceId]);

    const handleReview = async (id: string, teamId: string, wpId: string, status: 'approved' | 'rejected') => {
        // 1. Update Progress
        const { error: pError } = await supabase
            .from('progress')
            .update({
                status,
                reviewed_at: new Date().toISOString(),
                rejection_reason: status === 'rejected' ? 'Task requirements not met.' : null
            })
            .eq('id', id);

        if (pError) return;

        // 2. If approved, add points to team
        if (status === 'approved') {
            // Fetch waypoint points
            const { data: wp } = await supabase.from('waypoints').select('points_value').eq('id', wpId).single();
            if (wp) {
                const { data: team } = await supabase.from('teams').select('score, current_step_index').eq('id', teamId).single();
                if (team) {
                    await supabase.from('teams').update({
                        score: team.score + wp.points_value,
                        current_step_index: team.current_step_index + 1
                    }).eq('id', teamId);
                }
            }
        }

        // 3. Update local state
        setSubmissions(prev => prev.filter(s => s.id !== id));
    };

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <ImageIcon className="text-indigo-500" /> Pending Review
                </h2>
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-600">
                    {submissions.length} Items
                </span>
            </div>

            {submissions.length === 0 ? (
                <div className="rounded-3xl border-2 border-dashed border-slate-200 py-20 text-center">
                    <Check className="mx-auto mb-4 h-12 w-12 text-slate-200" />
                    <p className="text-slate-500 font-medium">All caught up! No pending submissions.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {submissions.map((s) => (
                        <div key={s.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                            <div className="aspect-video bg-slate-100 relative">
                                <img
                                    src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/submissions/${s.proof_url}`}
                                    alt="Submission"
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className="rounded-full bg-black/50 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                                        <Users className="h-3 w-3" /> {s.teams.name}
                                    </span>
                                    <span className="rounded-full bg-indigo-600/80 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> {s.waypoints.name}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="mb-4">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Task</p>
                                    <p className="text-sm text-slate-700 font-medium">{s.waypoints.task_instruction}</p>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => handleReview(s.id, s.team_id, s.waypoint_id, 'approved')}
                                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 active:scale-95 transition-all"
                                    >
                                        <Check className="h-4 w-4" /> Approve
                                    </button>
                                    <button
                                        onClick={() => handleReview(s.id, s.team_id, s.waypoint_id, 'rejected')}
                                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-rose-50 py-3 text-sm font-bold text-rose-600 hover:bg-rose-100 active:scale-95 transition-all"
                                    >
                                        <X className="h-4 w-4" /> Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
