# Project Constitution (v2.0 - Feb 2026)

## 1. Preamble & Core Principles
This document is the supreme law of Ralli development.

### Core Principles
1. **Security-First**: RLS is not optional. `USING (true)` is a blocker.
2. **Resilience over Richness**: A photo upload that fails on 3G is a failure.
3. **Determinism**: No `window.location.reload()`. State must be predictable and manageable.
4. **Clarification-first**: 3-8 questions before any major architectural change.

## 2. Technical Invariants
- **Realtime Lifecycle**: Every `subscribe()` MUST return an `unsubscribe` function and be called in high-level cleanup (`useEffect`).
- **GPS Thresholds**: Snapshots ONLY. Must filter by `accuracy < 50m`.
- **Photo Size Limit**: Hard limit of 1MB after compression. Reject otherwise.
- **State Persistence**: Use local state management (Zustand/Context); `localStorage` only for session hydration.

## 3. Code Quality & Rules
- **No Automated Tests**: Focus on static analysis (Biome) and record & replay.
- **Zero-Warning Policy**: Strict Biome configuration.
- **Supabase Discipline**: Denormalization is allowed for realtime performance, but must be documented in `migrations`.

## 4. Governance
- **Amendments**: Require audit against these invariants.
- **Deployment**: Must pass `npm run build` and `biome check` before Cloudflare push.

## 5. Security Governance & Data Isolation (2026 Audit)

Any agent or developer modifying the Ralli platform MUST adhere to these confirmed security invariants:

### 🛡️ Final Security Verdict
- **Keys/Secrets**: Correctly use environment variables (`.env`). NEVER track `.env` file or hardcode keys.
- **Overall Posture**: Database security must be **Server-Side**. Client-side filtering is only for UI; RLS is for security.
- **Production Anchor**: An application is only production-ready if its RLS policies are **restrictive by default**.

### ✅ Security Action Plan (Enforced)
1. **RLS Mandatory**: All tables MUST have RLS enabled with explicit `SELECT/INSERT/UPDATE` policies.
2. **"0 Rows" Benchmark**: A generic `SELECT *` by an anonymous user MUST return 0 rows. Access must require a relationship key (e.g., `race_id`, `team_id`) or an organizer's `auth.uid()`.
3. **Storage RLS**: All storage buckets (e.g., `submissions`) MUST have RLS policies restricting viewing and listing to authorized participants.
4. **Subscription Hygiene**: All realtime subscriptions MUST implement an explicit cleanup (`removeChannel` or equivalent) on component unmount to prevent zombie connections.
