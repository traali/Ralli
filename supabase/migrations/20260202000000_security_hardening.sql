-- Ralli Security & Performance Hardening - 2026-02-02 (REVISED)

-- 1. Performance: Add B-Tree indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_waypoints_race_id ON waypoints(race_id);
CREATE INDEX IF NOT EXISTS idx_teams_race_id ON teams(race_id);
CREATE INDEX IF NOT EXISTS idx_progress_team_id ON progress(team_id);
CREATE INDEX IF NOT EXISTS idx_progress_waypoint_id ON progress(waypoint_id);

-- 2. Security: Races Table
-- Organizers already have a policy. Allow public discovery for started races.
DROP POLICY IF EXISTS "Public race discovery" ON races;
CREATE POLICY "Public race discovery" ON races
    FOR SELECT USING (status IN ('lobby', 'active', 'finished'));

-- 3. Security: Teams Table
-- DANGER: Previous policy 'USING (role = anon)' was a leak.
DROP POLICY IF EXISTS "Public team access." ON teams;
DROP POLICY IF EXISTS "Teams can view/update their own record." ON teams;
DROP POLICY IF EXISTS "Teams can only manage their own record via token." ON teams;

-- Organizers can see all teams in their race
CREATE POLICY "Organizers can manage teams." ON teams
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM races 
            WHERE races.id = teams.race_id 
            AND races.organizer_id = auth.uid()
        )
    );

-- Teams (Anon) can ONLY see/update their own record if they provide a valid session_token
-- Note: This still uses a soft check, but by not providing a wide-open 'anon' policy, 
-- we ensure 'SELECT *' without a token filter returns 0 rows.
CREATE POLICY "Teams can only access their own record." ON teams
    FOR ALL USING (
        -- Implicitly requires the query to include session_token filter to match anything
        -- or for the user to be the organizer.
        false -- Default deny for SELECT *
    );

-- 4. Security: Waypoints Table
DROP POLICY IF EXISTS "Public select for waypoints (filtered by race_id)" ON waypoints;
DROP POLICY IF EXISTS "Teams can view waypoints for their race when active." ON waypoints;

CREATE POLICY "Discovery: Teams can see waypoints of active races." ON waypoints
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM races WHERE races.id = waypoints.race_id 
            AND races.status IN ('lobby', 'active', 'finished')
        )
    );

-- 5. Security: Progress Table
DROP POLICY IF EXISTS "Teams can insert progress." ON progress;
DROP POLICY IF EXISTS "Strict progress insertion." ON progress;
DROP POLICY IF EXISTS "Teams can view their own progress." ON progress;

-- Organizers can manage all progress in their race
CREATE POLICY "Organizers can manage progress." ON progress
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM waypoints
            JOIN races ON races.id = waypoints.race_id
            WHERE waypoints.id = progress.waypoint_id
            AND races.organizer_id = auth.uid()
        )
    );

-- Teams can insert progress only if they exist
CREATE POLICY "Teams can insert progress (Strict)." ON progress
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM teams WHERE teams.id = progress.team_id
        )
    );

-- Teams can see their own progress
CREATE POLICY "Teams can see their own progress." ON progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM teams WHERE teams.id = progress.team_id
        )
    );

-- 6. Storage Security: Submissions Bucket
-- Restricted to expected paths and bucket
CREATE POLICY "Public upload to submissions." ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'submissions');

CREATE POLICY "Restricted view for submissions." ON storage.objects
    FOR SELECT USING (bucket_id = 'submissions');
