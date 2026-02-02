# Architecture Plan & Stack Decisions
**Date**: 2026-02-01
**Status**: APPROVED

## 1. Executive Summary
Ralli is a real-time, location-based scavenger hunt PWA.
**Core Constraints**:
*   **Battery**: Must last 3+ hours on a phone.
*   **Network**: Must handle spotty outdoor 4G/5G.
*   **Realtime**: Race events must push to clients instantly.

## 2. Technology Stack Options & Recommendation

### A. Frontend Framework
**Recommendation**: **React ^19.2.0 + Vite**.
*Reason*: We need a "Link -> Play" experience with zero friction. SPA architecture is best for battery life (no page reloads).

### B. Backend & Realtime
**Recommendation**: **Supabase**.
*Reason*: Ralli is a relational app (Race -> Teams -> Progress). Postgres is superior to NoSQL here. The "Realtime" feature is a drop-in replacement for WebSockets.

### C. Maps Provider
**Recommendation**: **React-Leaflet** using **Carto Voyager** tiles.
*Reason*: Free, no API key required for standard usage, and distinct "clean" look optimized for mobile navigation.

### D. Deployment
| Option | Verdict | Reason |
| :--- | :--- | :--- |
| **Cloudflare Pages** | **SELECTED** | Fastest global edge, unlimited bandwidth, instant git-integration deploy. |

## 3. Key Architectural Decisions (ADRs)

### ADR-001: Denormalized Leaderboard
*   **Context**: Calculating scores on the fly from a `progress` log table is slow (O(n*m)).
*   **Decision**: Store `current_step` and `score` directly on the `teams` table.

### ADR-002: Snapshot Geolocation
*   **Context**: `watchPosition` keeps the GPS radio active, draining ~1% battery per minute.
*   **Decision**: Use `getCurrentPosition` only when the user explicitly clicks "Check In".

### ADR-003: Client-Side Compression
*   **Context**: 4G upload speeds are unreliable. 5MB photos fail often.
*   **Decision**: Compress all images to <500KB JPEG in the browser before upload.
