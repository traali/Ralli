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
