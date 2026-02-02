import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ReviewQueue } from '../components/organizer/ReviewQueue';
import { RealtimeLeaderboard } from '../components/organizer/RealtimeLeaderboard';
import { LiveRaceMap } from '../components/organizer/LiveRaceMap';
import { ActivityFeed } from '../components/organizer/ActivityFeed';
import { LayoutDashboard, Users, ClipboardCheck, Trophy, Map } from 'lucide-react';

export const OrganizerDashboardPage: React.FC = () => {
    const { id: raceId } = useParams<{ id: string }>();
    const [race, setRace] = React.useState<any>(null);
    const [activeTab, setActiveTab] = useState<'review' | 'leaderboard' | 'map'>('review');

    React.useEffect(() => {
        if (raceId) {
            supabase.from('races').select('*').eq('id', raceId).single().then(({ data }) => setRace(data));
        }
    }, [raceId]);

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
                        <LayoutDashboard className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Race Control</h1>
                        <p className="text-slate-500">Live Management Dashboard</p>
                    </div>
                </div>

                <div className="flex rounded-2xl bg-slate-100 p-1">
                    <button
                        onClick={() => setActiveTab('review')}
                        className={`flex items-center gap-2 rounded-xl px-6 py-2 text-sm font-bold transition-all ${activeTab === 'review' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <ClipboardCheck className="h-4 w-4" /> Review
                    </button>
                    <button
                        onClick={() => setActiveTab('leaderboard')}
                        className={`flex items-center gap-2 rounded-xl px-6 py-2 text-sm font-bold transition-all ${activeTab === 'leaderboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Trophy className="h-4 w-4" /> Leaderboard
                    </button>
                    <button
                        onClick={() => setActiveTab('map')}
                        className={`flex items-center gap-2 rounded-xl px-6 py-2 text-sm font-bold transition-all ${activeTab === 'map' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Map className="h-4 w-4" /> Live Map
                    </button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-4">
                {/* Left Column: Stats & Actions */}
                <div className="space-y-6 lg:col-span-1">
                    <div className="rounded-3xl bg-indigo-600 p-6 text-white shadow-xl shadow-indigo-200">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Status</p>
                        <p className="text-2xl font-black mb-4">RACE {race?.status?.toUpperCase() || '...'}</p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="opacity-70">Race Code</span>
                                <span className="font-mono font-bold">{raceId?.split('-')[0].toUpperCase()}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="opacity-70">Active Teams</span>
                                <span className="font-bold">LIVE</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h4 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">Quick Actions</h4>
                        <div className="space-y-2">
                            <button
                                onClick={() => setActiveTab('map')}
                                className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600 transition-hover hover:border-indigo-100 hover:bg-white hover:text-indigo-600"
                            >
                                <Map className="h-4 w-4" /> View Map
                            </button>
                            <button className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600 transition-hover hover:border-indigo-100 hover:bg-white hover:text-indigo-600">
                                <Users className="h-4 w-4" /> Team List
                            </button>
                        </div>
                    </div>

                    <div className="h-[400px]">
                        <ActivityFeed raceId={raceId || ''} />
                    </div>
                </div>

                {/* Main Content: Review Queue or Leaderboard */}
                <div className="lg:col-span-3">
                    {activeTab === 'review' && <ReviewQueue />}
                    {activeTab === 'leaderboard' && <RealtimeLeaderboard />}
                    {activeTab === 'map' && <LiveRaceMap raceId={raceId || ''} />}
                </div>
            </div>
        </div>
    );
};
