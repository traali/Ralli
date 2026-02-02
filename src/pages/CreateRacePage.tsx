import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Save, Trash2, MapPin, Flag, Navigation } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Fix Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Waypoint {
    id?: string;
    name: string;
    riddle: string;
    task_instruction: string;
    lat: number;
    lng: number;
    radius_meters: number;
    points_value?: number;
    hint?: string;
    order_index: number;
}

export const CreateRacePage: React.FC = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
    const [loading, setLoading] = useState(false);

    const MapEvents = () => {
        useMapEvents({
            click(e: L.LeafletMouseEvent) {
                const newWaypoint: Waypoint = {
                    name: `Point ${waypoints.length + 1}`,
                    riddle: '',
                    task_instruction: '',
                    lat: e.latlng.lat,
                    lng: e.latlng.lng,
                    radius_meters: 50,
                    hint: '',
                    order_index: waypoints.length,
                };
                setWaypoints([...waypoints, newWaypoint]);
            },
        });
        return null;
    };

    const handleSave = async () => {
        if (!name || waypoints.length === 0) {
            alert('Please provide a name and at least one waypoint.');
            return;
        }

        setLoading(true);
        try {
            const { data: race, error: raceError } = await supabase
                .from('races')
                .insert({
                    name,
                    description,
                    status: 'lobby',
                    organizer_id: (await supabase.auth.getUser()).data.user?.id || '',
                })
                .select()
                .single();

            if (raceError) throw raceError;

            const waypointsWithRaceId = waypoints.map(wp => ({
                ...wp,
                race_id: race.id,
            }));

            const { error: wpError } = await supabase.from('waypoints').insert(waypointsWithRaceId);
            if (wpError) throw wpError;

            alert('Race created successfully!');
            window.location.href = `/organizer/lobby/${race.id}`;
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const removeWaypoint = (index: number) => {
        setWaypoints(waypoints.filter((_, i) => i !== index));
    };

    const updateWaypoint = (index: number, updates: Partial<Waypoint>) => {
        const newWaypoints = [...waypoints];
        newWaypoints[index] = { ...newWaypoints[index], ...updates };
        setWaypoints(newWaypoints);
    };

    return (
        <div className="grid h-[calc(100vh-12rem)] gap-8 lg:grid-cols-2">
            {/* Editor Panel */}
            <div className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-slate-900">Create New Race</h1>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" /> {loading ? 'Saving...' : 'Save Race'}
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-700">Race Name</label>
                            <input
                                type="text"
                                className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="My Epic Scavenger Hunt"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-700">Description</label>
                            <textarea
                                className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                rows={2}
                                placeholder="A fun race through the city..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900">Waypoints ({waypoints.length})</h2>
                        <p className="text-xs text-slate-500 italic">Click on the map to add a point</p>
                    </div>

                    <div className="space-y-4 text-sm">
                        {waypoints.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                                <MapPin className="mb-2 h-10 w-10 opacity-20" />
                                <p>No points added yet.</p>
                            </div>
                        )}

                        {waypoints.map((wp, index) => (
                            <div key={index} className="group relative rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:bg-white hover:shadow-md">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                                            {index + 1}
                                        </span>
                                        <input
                                            type="text"
                                            className="font-bold text-slate-900 bg-transparent outline-none focus:border-b focus:border-indigo-400"
                                            value={wp.name}
                                            onChange={(e) => updateWaypoint(index, { name: e.target.value })}
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeWaypoint(index)}
                                        className="text-slate-400 hover:text-rose-500"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Riddle/Clue</label>
                                        <textarea
                                            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs focus:border-indigo-400 outline-none"
                                            rows={2}
                                            value={wp.riddle}
                                            onChange={(e) => updateWaypoint(index, { riddle: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Task Instruction</label>
                                        <input
                                            type="text"
                                            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs focus:border-indigo-400 outline-none"
                                            value={wp.task_instruction}
                                            onChange={(e) => updateWaypoint(index, { task_instruction: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Radius (meters)</label>
                                        <input
                                            type="number"
                                            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs focus:border-indigo-400 outline-none"
                                            value={wp.radius_meters}
                                            min={10}
                                            max={500}
                                            onChange={(e) => updateWaypoint(index, { radius_meters: parseInt(e.target.value) || 50 })}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Hint (OPTIONAL, COSTS 10 PTS)</label>
                                        <input
                                            type="text"
                                            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs focus:border-indigo-400 outline-none"
                                            placeholder="A cryptic clue..."
                                            value={wp.hint || ''}
                                            onChange={(e) => updateWaypoint(index, { hint: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Map Panel */}
            <div className="h-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-inner relative">
                <MapContainer
                    center={[60.1699, 24.9384] as L.LatLngExpression}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    className="z-0"
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'}
                    />
                    <MapEvents />
                    {waypoints.map((wp, index) => (
                        <React.Fragment key={index}>
                            <Marker position={[wp.lat, wp.lng]}>
                                <Popup>
                                    <div className="font-sans">
                                        <p className="font-bold">{wp.name}</p>
                                        <p className="text-xs text-slate-500">{wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}</p>
                                    </div>
                                </Popup>
                            </Marker>
                            <Circle
                                center={[wp.lat, wp.lng]}
                                radius={wp.radius_meters}
                                pathOptions={{ color: 'indigo', fillColor: 'indigo', fillOpacity: 0.15 }}
                            />
                        </React.Fragment>
                    ))}
                </MapContainer>

                {/* Map Overlay Stats */}
                <div className="absolute bottom-6 left-6 right-6 z-10 flex justify-between gap-4 pointer-events-none">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-xs font-bold text-slate-700 shadow-lg backdrop-blur-md">
                        <Navigation className="h-4 w-4 text-indigo-500" />
                        Total Points: {waypoints.length * 100}
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-xs font-bold text-slate-700 shadow-lg backdrop-blur-md text-rose-500">
                        <Flag className="h-4 w-4" />
                        Goal: Finish
                    </div>
                </div>
            </div>
        </div>
    );
};
