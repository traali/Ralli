import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MapPin, Camera, Loader2, AlertCircle, HelpCircle, Trophy, ClipboardCheck } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import type { Database } from '../types/supabase';

type Team = Database['public']['Tables']['teams']['Row'];
type Waypoint = Database['public']['Tables']['waypoints']['Row'];

export const TeamGameView: React.FC = () => {
    const { id: raceId } = useParams<{ id: string }>();
    const [team, setTeam] = useState<Team | null>(null);
    const [waypoint, setWaypoint] = useState<Waypoint | null>(null);

    // Consolidated State Machine
    type ViewState = 'loading' | 'active' | 'finished' | 'error';
    const [viewState, setViewState] = useState<ViewState>('loading');

    const [error, setError] = useState<string | null>(null);
    const [isVerified, setIsVerified] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string | null>(null);
    const [submissionStatus, setSubmissionStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
    const [hintRevealed, setHintRevealed] = useState(false);

    // Business Logic Functions
    const advanceTeam = useCallback(async () => {
        if (!team || !raceId) return;
        const nextIndex = team.current_step_index + 1;

        const { error: updateError } = await supabase
            .from('teams')
            .update({ current_step_index: nextIndex })
            .eq('id', team.id);

        if (!updateError) {
            setTeam({ ...team, current_step_index: nextIndex });
            setIsVerified(false);
            setSubmissionStatus('none');
            setHintRevealed(false);
            // Will trigger waypoint reload via index in team state
        } else {
            setError('Failed to advance to next step. Please try again.');
        }
    }, [team, raceId]);

    const loadWaypoint = useCallback(async (rId: string, index: number) => {
        const { data: wpData } = await supabase
            .from('waypoints')
            .select('*')
            .eq('race_id', rId)
            .eq('order_index', index)
            .maybeSingle();

        if (wpData) {
            setWaypoint(wpData);
            const { data: progress } = await supabase
                .from('progress')
                .select('status')
                .eq('team_id', team?.id || '')
                .eq('waypoint_id', wpData.id)
                .maybeSingle();

            if (progress) {
                if (progress.status === 'approved') {
                    advanceTeam();
                } else {
                    setSubmissionStatus(progress.status as any);
                    setIsVerified(true);
                }
            }
            setViewState('active');
        } else {
            setViewState('finished');
            if (raceId) localStorage.removeItem(`ralli_session_${raceId}`);
        }
    }, [raceId, team?.id, advanceTeam]);

    // Initial Load
    useEffect(() => {
        if (!raceId) return;

        const sessionToken = localStorage.getItem(`ralli_session_${raceId}`);
        if (!sessionToken) {
            window.location.href = '/join';
            return;
        }

        const initialLoad = async () => {
            const { data: teamData } = await supabase
                .from('teams')
                .select('*')
                .eq('race_id', raceId)
                .eq('session_token', sessionToken)
                .single();

            if (!teamData) {
                localStorage.removeItem(`ralli_session_${raceId}`);
                window.location.href = '/join';
                return;
            }
            setTeam(teamData);
            loadWaypoint(raceId, teamData.current_step_index);
        };

        initialLoad();
    }, [raceId]); // Only run once on mount

    // Watch team.current_step_index for advancement
    useEffect(() => {
        if (raceId && team) {
            loadWaypoint(raceId, team.current_step_index);
        }
    }, [team?.current_step_index, raceId, loadWaypoint]);

    // Realtime Progress Updates
    useEffect(() => {
        if (team) {
            const channel = supabase
                .channel(`team-updates-${team.id}`)
                .on(
                    'postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'progress', filter: `team_id=eq.${team.id}` },
                    (payload) => {
                        const newStatus = payload.new.status;
                        if (newStatus === 'approved') {
                            advanceTeam();
                        } else {
                            setSubmissionStatus(newStatus);
                        }
                    }
                )
                .subscribe();

            return () => { supabase.removeChannel(channel); };
        }
    }, [team?.id, advanceTeam]);

    const handleRequestHint = async () => {
        if (!team || !waypoint || hintRevealed) return;
        if (!confirm('Reveal hint for -10 points?')) return;

        const { error: updateError } = await supabase
            .from('teams')
            .update({ score: Math.max(0, team.score - 10) })
            .eq('id', team.id);

        if (!updateError) {
            setHintRevealed(true);
            setTeam({ ...team, score: Math.max(0, team.score - 10) });
        }
    };

    const handleVerifyLocation = () => {
        if (!waypoint) return;
        setVerifying(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude, accuracy } = pos.coords;
                if (accuracy > 50) {
                    setError(`Location accuracy too low (${Math.round(accuracy)}m). Try moving to a clearer area.`);
                    setVerifying(false);
                    return;
                }

                const dist = getDistance(latitude, longitude, waypoint.lat, waypoint.lng);
                if (dist <= waypoint.radius_meters) {
                    setIsVerified(true);
                } else {
                    setError(`Too far! Move closer to the target (dist: ${Math.round(dist)}m)`);
                }
                setVerifying(false);
            },
            (err) => {
                setError('Location access failed: ' + err.message);
                setVerifying(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3;
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const COMPRESSION_CONFIG = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !team || !waypoint) return;

        setUploading(true);
        setError(null);
        setUploadProgress('Compressing...');

        try {
            const compressedFile = await imageCompression(file, COMPRESSION_CONFIG);
            setUploadProgress('Uploading...');
            const fileName = `${raceId}/${team.id}/${waypoint.id}_${Date.now()}.jpg`;
            const { data: uploadData, error: uploadError } = await supabase.storage.from('submissions').upload(fileName, compressedFile);
            if (uploadError) throw uploadError;

            setUploadProgress('Registering...');
            const { error: progressError } = await supabase.from('progress').insert({
                team_id: team.id,
                waypoint_id: waypoint.id,
                status: 'pending',
                proof_url: uploadData.path,
            });
            if (progressError) throw progressError;
            setSubmissionStatus('pending');
        } catch (err: any) {
            setError('Upload failed: ' + err.message);
        } finally {
            setUploading(false);
            setUploadProgress(null);
        }
    };

    if (viewState === 'loading') {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (viewState === 'finished') {
        return (
            <div className="mx-auto max-w-md py-12 text-center px-4 animate-in fade-in zoom-in duration-700">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 mx-auto shadow-xl shadow-amber-200 ring-8 ring-amber-50">
                    <Trophy className="h-12 w-12 text-amber-700" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-2 mt-8 uppercase tracking-tight">Race Finished!</h1>
                <p className="text-slate-500 mb-10 text-lg font-medium">You completed all waypoints. Check the leaderboard for your final rank!</p>
                <div className="bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-sm mb-8">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Score</p>
                    <p className="text-5xl font-black text-indigo-600">{team?.score}</p>
                </div>
                <button
                    onClick={() => window.location.href = '/'}
                    className="w-full bg-slate-900 text-white rounded-2xl py-5 text-lg font-bold hover:bg-black transition-all active:scale-95"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-lg px-4 pb-12 pt-6 lg:px-0">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                        {team?.current_step_index! + 1}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900">Current Clue</h2>
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                    Point {team?.current_step_index! + 1}
                </div>
            </div>

            {/* Riddle Card */}
            <div className="mb-8 rounded-[2rem] border-2 border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                    <HelpCircle className="h-6 w-6" />
                </div>
                <p className="text-2xl font-bold leading-tight text-slate-900 font-serif">
                    {waypoint?.riddle}
                </p>

                {waypoint?.hint && (
                    <div className="mt-6 border-t border-slate-50 pt-4">
                        {hintRevealed ? (
                            <div className="rounded-xl bg-amber-50 p-4 text-xs font-medium text-amber-800 border border-amber-100 animate-in zoom-in-95 duration-300">
                                <span className="font-bold text-amber-600 uppercase tracking-widest block mb-1 text-[10px]">The Hint:</span>
                                {waypoint.hint}
                            </div>
                        ) : (
                            <button
                                onClick={handleRequestHint}
                                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors"
                            >
                                <HelpCircle className="h-3 w-3" /> Need a hint? (-10 points)
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Action Area */}
            <div className="space-y-4">
                {error && (
                    <div className="flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <button
                    onClick={handleVerifyLocation}
                    disabled={verifying || uploading}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 py-6 text-xl font-black text-white shadow-xl transition-all hover:bg-black active:scale-[0.98] disabled:opacity-50"
                >
                    {verifying ? <Loader2 className="h-6 w-6 animate-spin" /> : <><MapPin className="h-6 w-6" /> I'M HERE</>}
                </button>

                {isVerified ? (
                    <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {submissionStatus === 'none' || submissionStatus === 'rejected' ? (
                            <>
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white"><Camera className="h-4 w-4" /></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{submissionStatus === 'rejected' ? 'Re-upload Photo' : 'Photo Task'}</p>
                                        <p className="text-xs text-slate-500">{waypoint?.task_instruction}</p>
                                    </div>
                                </div>
                                {submissionStatus === 'rejected' && <div className="mb-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-600 border border-rose-100 italic">Rejected! Please try again.</div>}
                                <label className="block">
                                    <input type="file" accept="image/*" capture="environment" disabled={uploading} onChange={handlePhotoUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:px-6 file:py-3 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-700 disabled:opacity-50" />
                                </label>
                            </>
                        ) : (
                            <div className="py-4 text-center">
                                <div className="mb-3 flex justify-center">
                                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                        <ClipboardCheck className="absolute h-4 w-4" />
                                    </div>
                                </div>
                                <p className="text-lg font-bold text-slate-900">Under Review</p>
                                <p className="text-sm text-slate-500">Waiting for approval...</p>
                            </div>
                        )}
                        {uploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                                    <p className="text-xs font-bold text-indigo-600">{uploadProgress || 'Processing...'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="rounded-2xl border-2 border-dashed border-slate-100 p-8 text-center bg-slate-50/30">
                        <Camera className="mx-auto h-8 w-8 text-slate-200 mb-2" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Task Locked</p>
                        <p className="text-[10px] text-slate-400 mt-1">Verify location to open photo task</p>
                    </div>
                )}
            </div>
        </div>
    );
};
