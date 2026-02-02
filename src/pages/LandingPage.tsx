import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Map as MapIcon, Zap } from 'lucide-react';

export const LandingPage: React.FC = () => {
    return (
        <div className="relative">
            {/* Hero Section */}
            <section className="py-12 lg:py-20">
                <div className="text-center">
                    <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
                        Real-world <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Adventure</span>.
                        <br />
                        Real-time <span className="text-indigo-600">Thrills</span>.
                    </h1>
                    <p className="mx-auto mb-10 max-w-2xl text-xl text-slate-600 sm:text-2xl">
                        Organize and run interactive scavenger hunts. No app download required.
                        Just pure excitement and location-based challenges.
                    </p>
                    <div className="flex flex-col flex-wrap justify-center gap-4 sm:flex-row">
                        <Link
                            to="/organizer"
                            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-8 py-4 text-lg font-bold text-white shadow-xl transition-all hover:bg-slate-800 hover:-translate-y-1 active:scale-95"
                        >
                            Organize a Race
                        </Link>
                        <Link
                            to="/join"
                            className="inline-flex items-center justify-center rounded-2xl border-2 border-slate-200 bg-white px-8 py-4 text-lg font-bold text-slate-900 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-1 active:scale-95"
                        >
                            Join a Race
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-16">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                            <Zap className="h-6 w-6" />
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-slate-900">Instant Real-time</h3>
                        <p className="text-slate-600">
                            Push notifications and live updates keep everyone in the loop without page refreshes.
                        </p>
                    </div>
                    <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                            <MapIcon className="h-6 w-6" />
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-slate-900">GPS Verified</h3>
                        <p className="text-slate-600">
                            Advanced geolocation snapshots ensure teams are exactly where they say they are.
                        </p>
                    </div>
                    <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                            <Trophy className="h-6 w-6" />
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-slate-900">Live Leaderboard</h3>
                        <p className="text-slate-600">
                            Watch the rankings shift in real-time as teams complete tasks and earn points.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};
