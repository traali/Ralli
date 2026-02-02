import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Plus, LayoutDashboard, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import type { Database } from '../types/supabase';

type Race = Database['public']['Tables']['races']['Row'];

export const OrganizerListPage: React.FC = () => {
    const [races, setRaces] = useState<Race[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRaces = async () => {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) {
                window.location.href = '/login';
                return;
            }

            const { data } = await supabase
                .from('races')
                .select('*')
                .eq('organizer_id', userData.user.id)
                .order('created_at', { ascending: false });

            if (data) setRaces(data);
            setLoading(false);
        };

        fetchRaces();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">My Races</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your active and upcoming scavenger hunts.</p>
                </div>
                <Link
                    to="/organizer/new"
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95"
                >
                    <Plus className="h-4 w-4" /> Create New
                </Link>
            </div>

            {races.length === 0 ? (
                <div className="rounded-[2rem] border-2 border-dashed border-slate-200 bg-white py-20 text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
                        <LayoutDashboard className="h-10 w-10" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">No races found</h2>
                    <p className="mt-2 text-slate-500">Create your first race to get started!</p>
                    <Link
                        to="/organizer/new"
                        className="mt-6 inline-block rounded-xl bg-slate-900 px-8 py-3 text-sm font-bold text-white transition-all hover:bg-black"
                    >
                        Create Race
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {races.map((race) => (
                        <div key={race.id} className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-indigo-100">
                            <div className="p-6 flex-1">
                                <div className="mb-4 flex items-center justify-between">
                                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${race.status === 'active' ? 'bg-emerald-100 text-emerald-600' :
                                        race.status === 'lobby' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {race.status}
                                    </span>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(race.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{race.name}</h3>
                                <p className="mt-2 text-sm text-slate-500 line-clamp-2">{race.description || 'No description provided.'}</p>
                            </div>

                            <div className="border-t border-slate-50 bg-slate-50/50 p-4">
                                <Link
                                    to={race.status === 'active' ? `/organizer/dashboard/${race.id}` : `/organizer/lobby/${race.id}`}
                                    className="flex w-full items-center justify-between rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition-all hover:border-indigo-600 hover:text-indigo-600"
                                >
                                    Manage Race
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
