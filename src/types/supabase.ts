export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	public: {
		Tables: {
			races: {
				Row: {
					id: string;
					organizer_id: string;
					name: string;
					description: string | null;
					status: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					organizer_id: string;
					name: string;
					description?: string | null;
					status?: string;
					created_at?: string;
				};
				Update: {
					id?: string;
					organizer_id?: string;
					name?: string;
					description?: string | null;
					status?: string;
					created_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'races_organizer_id_fkey';
						columns: ['organizer_id'];
						isOneToOne: false;
						referencedRelation: 'users';
						referencedColumns: ['id'];
					},
				];
			};
			waypoints: {
				Row: {
					id: string;
					race_id: string;
					name: string;
					riddle: string;
					task_instruction: string;
					lat: number;
					lng: number;
					radius_meters: number;
					points_value: number;
					order_index: number;
					hint: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					race_id: string;
					name: string;
					riddle: string;
					task_instruction: string;
					lat: number;
					lng: number;
					radius_meters?: number;
					points_value?: number;
					order_index: number;
					hint?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					race_id?: string;
					name?: string;
					riddle?: string;
					task_instruction?: string;
					lat?: number;
					lng?: number;
					radius_meters?: number;
					points_value?: number;
					order_index?: number;
					hint?: string | null;
					created_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'waypoints_race_id_fkey';
						columns: ['race_id'];
						isOneToOne: false;
						referencedRelation: 'races';
						referencedColumns: ['id'];
					},
				];
			};
			teams: {
				Row: {
					id: string;
					race_id: string;
					name: string;
					score: number;
					current_step_index: number;
					session_token: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					race_id: string;
					name: string;
					score?: number;
					current_step_index?: number;
					session_token: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					race_id?: string;
					name?: string;
					score?: number;
					current_step_index?: number;
					session_token?: string;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'teams_race_id_fkey';
						columns: ['race_id'];
						isOneToOne: false;
						referencedRelation: 'races';
						referencedColumns: ['id'];
					},
				];
			};
			progress: {
				Row: {
					id: string;
					team_id: string;
					waypoint_id: string;
					status: string;
					proof_url: string | null;
					submitted_at: string;
					reviewed_at: string | null;
					rejection_reason: string | null;
				};
				Insert: {
					id?: string;
					team_id: string;
					waypoint_id: string;
					status?: string;
					proof_url?: string | null;
					submitted_at?: string;
					reviewed_at?: string | null;
					rejection_reason?: string | null;
				};
				Update: {
					id?: string;
					team_id?: string;
					waypoint_id?: string;
					status?: string;
					proof_url?: string | null;
					submitted_at?: string;
					reviewed_at?: string | null;
					rejection_reason?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'progress_team_id_fkey';
						columns: ['team_id'];
						isOneToOne: false;
						referencedRelation: 'teams';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'progress_waypoint_id_fkey';
						columns: ['waypoint_id'];
						isOneToOne: false;
						referencedRelation: 'waypoints';
						referencedColumns: ['id'];
					},
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};
