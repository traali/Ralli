---
name: CodeAudit
description: Comprehensive analysis of the Ralli codebase for security, performance, and pattern consistency.
---

# CodeAudit Skill

Use this skill to perform a deep-dive analysis of the Ralli project. It focuses on several key areas specific to this tech stack.

## 🔐 Security Audit (Supabase RLS)
- **Invariant**: No table should be accessible to `anon` without a specific business reason.
- **Check**: Verify all `CREATE POLICY` statements in `supabase/` or `implementation_plan.md`.
- **Benchmark**: A `select *` from `teams` or `progress` MUST fail/return zero rows if not filtered by a valid session or `auth.uid()`.

## 🛰️ Realtime Hygiene
- **Pattern**: Every `supabase.channel` must have an associated `removeChannel` call in `useEffect` cleanup.
- **Check**: Search for `.subscribe()` and ensure a cleanup function exists.

## 📱 Performance & UX
- **Image Compression**: Verify `browser-image-compression` usage in all photo upload paths.
- **GPS Handling**: Ensure `enableHighAccuracy: true` and accuracy thresholds (> 50m rejection) are implemented.

## 🧹 Linting & Types
- **Biome**: Run `npm run biome` and ensure zero errors.
- **TypeScript**: Run `npm run build` (which includes `tsc`) to ensure strict type safety.

## 🚀 Execution
To run the automated portion of this audit:
```bash
node .agent/skills/code_audit/scripts/analyze.cjs
```
