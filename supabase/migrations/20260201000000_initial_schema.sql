-- Ralli Schema Migration - 2026-02-01

-- 1. Races Table
CREATE TABLE IF NOT EXISTS races (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'lobby', 'active', 'finished'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Waypoints Table
CREATE TABLE IF NOT EXISTS waypoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID REFERENCES races(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    riddle TEXT NOT NULL,
    task_instruction TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    radius_meters INTEGER DEFAULT 50 NOT NULL,
    points_value INTEGER DEFAULT 100 NOT NULL,
    order_index INTEGER NOT NULL,
    hint TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Teams Table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID REFERENCES races(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    score INTEGER DEFAULT 0 NOT NULL,
    current_step_index INTEGER DEFAULT 0 NOT NULL, -- Denormalized for realtime performance
    session_token TEXT UNIQUE NOT NULL, -- For anonymous session recovery
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Progress/Submissions Table
CREATE TABLE IF NOT EXISTS progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    waypoint_id UUID REFERENCES waypoints(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    proof_url TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT
);

-- Enable Row Level Security
ALTER TABLE races ENABLE ROW LEVEL SECURITY;
ALTER TABLE waypoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (Simplistic for MVP)
-- Organizer can manage their own races
CREATE POLICY "Organizers can manage their own races." ON races
    FOR ALL USING (auth.uid() = organizer_id);

-- Everyone (Teams) can see waypoints for their race
CREATE POLICY "Teams can view waypoints for their race." ON waypoints
    FOR SELECT USING (true); -- Filtered by race_id in app logic

-- Teams can manage their own team record via session_token
CREATE POLICY "Teams can view/update their own record." ON teams
    FOR ALL USING (true); -- Token-based auth in app logic

-- Teams can insert progress
CREATE POLICY "Teams can insert progress." ON progress
    FOR INSERT WITH CHECK (true);

-- Organizers can see and update progress for their races
CREATE POLICY "Organizers can view/update progress." ON progress
    FOR ALL USING (EXISTS (
        SELECT 1 FROM races WHERE races.id = (SELECT waypoints.race_id FROM waypoints WHERE waypoints.id = progress.waypoint_id)
        AND races.organizer_id = auth.uid()
    ));
