import L from 'leaflet';
import React, { useEffect, useState } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { supabase } from '../../lib/supabase';
import 'leaflet/dist/leaflet.css';

interface Waypoint {
	id: string;
	name: string;
	lat: number;
	lng: number;
	radius_meters: number;
	order_index: number;
}

interface Team {
	id: string;
	name: string;
	current_step_index: number;
}

export const LiveRaceMap: React.FC<{ raceId: string }> = ({ raceId }) => {
	const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
	const [teams, setTeams] = useState<Team[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			const { data: wpData } = await supabase
				.from('waypoints')
				.select('*')
				.eq('race_id', raceId)
				.order('order_index');
			const { data: teamData } = await supabase.from('teams').select('*').eq('race_id', raceId);
			if (wpData) setWaypoints(wpData);
			if (teamData) setTeams(teamData);
			setLoading(false);
		};

		fetchData();

		const channel = supabase
			.channel(`live-map-${raceId}`)
			.on(
				'postgres_changes',
				{ event: '*', schema: 'public', table: 'teams', filter: `race_id=eq.${raceId}` },
				() => {
					fetchData();
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [raceId]);

	if (loading || waypoints.length === 0) return null;

	// Custom Icon for Teams
	const teamIcon = L.divIcon({
		className: 'custom-div-icon',
		html: `<div class="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 border-2 border-white shadow-lg text-[10px] font-black text-white">T</div>`,
		iconSize: [24, 24],
		iconAnchor: [12, 12],
	});

	return (
		<div className="h-[600px] w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
			<MapContainer
				center={[waypoints[0].lat, waypoints[0].lng]}
				zoom={14}
				style={{ height: '100%', width: '100%' }}
				className="z-0"
			>
				<TileLayer
					url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
				/>

				{/* Render Waypoints */}
				{waypoints.map((wp) => (
					<React.Fragment key={wp.id}>
						<Marker position={[wp.lat, wp.lng]}>
							<Popup>
								<div className="font-sans">
									<p className="font-bold">{wp.name}</p>
									<p className="text-xs text-slate-500">Order: {wp.order_index + 1}</p>
								</div>
							</Popup>
						</Marker>
						<Circle
							center={[wp.lat, wp.lng]}
							radius={wp.radius_meters}
							pathOptions={{ color: 'indigo', fillColor: 'indigo', fillOpacity: 0.1 }}
						/>
					</React.Fragment>
				))}

				{/* Render Teams at their current waypoint */}
				{teams.map((team) => {
					const currentWp = waypoints.find((wp) => wp.order_index === team.current_step_index);
					if (!currentWp) return null;

					// Add a small jitter so markers don't overlap perfectly
					const jitterLat = (Math.random() - 0.5) * 0.0002;
					const jitterLng = (Math.random() - 0.5) * 0.0002;

					return (
						<Marker
							key={team.id}
							position={[currentWp.lat + jitterLat, currentWp.lng + jitterLng]}
							icon={teamIcon}
						>
							<Popup>
								<div className="font-sans">
									<p className="font-black text-indigo-600">{team.name}</p>
									<p className="text-xs text-slate-500">Targeting: {currentWp.name}</p>
									<button
										onClick={async (e) => {
											e.stopPropagation();
											if (confirm(`Force unlock next step for ${team.name}?`)) {
												await supabase
													.from('teams')
													.update({ current_step_index: team.current_step_index + 1 })
													.eq('id', team.id);
											}
										}}
										className="mt-2 block w-full rounded-lg border border-slate-200 bg-white py-1 text-[8px] font-bold uppercase tracking-wider text-slate-600 transition-all hover:border-indigo-600 hover:text-indigo-600 shadow-sm"
									>
										Skip Step
									</button>
								</div>
							</Popup>
						</Marker>
					);
				})}
			</MapContainer>
		</div>
	);
};
