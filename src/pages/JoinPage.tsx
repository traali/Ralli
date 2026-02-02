import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Users, Hash, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

export const JoinPage: React.FC = () => {
    const navigate = useNavigate();
    const { id: urlId } = useParams<{ id: string }>();
    const [teamName, setTeamName] = useState('');
    const [raceCode, setRaceCode] = useState(urlId || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (urlId) setRaceCode(urlId);
    }, [urlId]);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const cleanCode = raceCode.toLowerCase().trim();
            // 1. Check if race exists and is in "lobby" or "active" status
            let query = supabase.from('races').select('id, status');

            if (cleanCode.length === 8) {
                // Search by prefix if short code (8 hex chars)
                const nextCode = (parseInt(cleanCode, 16) + 1).toString(16).padStart(8, '0');
                query = query
                    .filter('id', 'gte', `${cleanCode}-0000-0000-0000-000000000000`)
                    .filter('id', 'lt', `${nextCode}-0000-0000-0000-000000000000`);
            } else {
                query = query.eq('id', cleanCode);
            }

            const { data: race, error: raceError } = await query.maybeSingle();

            if (raceError || !race) {
                throw new Error('Race not found. Please check the code.');
            }

            if (race.status === 'draft') {
                throw new Error('This race hasn\'t started yet.');
            }

            // 2. Register Team
            const sessionToken = crypto.randomUUID();
            const { error: teamError } = await supabase
                .from('teams')
                .insert({
                    race_id: race.id,
                    name: teamName,
                    session_token: sessionToken,
                })
                .select()
                .single();

            if (teamError) throw teamError;

            // 3. Store session to recovery
            localStorage.setItem(`ralli_session_${race.id}`, sessionToken);

            // 4. Redirect to Lobby or Game
            if (race.status === 'lobby') {
                navigate(`/lobby/${race.id}`);
            } else {
                navigate(`/race/${race.id}`);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto flex w-full max-w-md flex-col justify-center py-12">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-slate-900">Join the Race</h1>
                <p className="mt-2 text-slate-600">Enter your team name and the race code.</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
                <form onSubmit={handleJoin} className="space-y-6">
                    {error && (
                        <div className="flex items-center gap-3 rounded-xl bg-rose-50 p-4 text-sm text-rose-600">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700" htmlFor="raceCode">
                            Race Code (UUID)
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <Hash className="h-5 w-5" />
                            </div>
                            <input
                                id="raceCode"
                                type="text"
                                required
                                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                                placeholder="00000000-0000-..."
                                value={raceCode}
                                onChange={(e) => setRaceCode(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700" htmlFor="teamName">
                            Team Name
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <Users className="h-5 w-5" />
                            </div>
                            <input
                                id="teamName"
                                type="text"
                                required
                                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Team Alpha"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                Enter Race <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
