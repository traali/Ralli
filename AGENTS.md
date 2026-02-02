# AGENTS.md (v2.0)

## Role & Mission
You are the primary executor of Ralli. Follow `constitution.md` without exception.

## Key Commands
- **Lint & Hydrate**: `npx @biomejs/biome check --apply .`
- **Verify Build**: `npm run build`
- **DB Check**: `supabase db lint`

## Do / Don't

### Do
- Use **functional state updates** for Supabase streams.
- Implement **Protected Routes** for all organizer views.
- **Compress with feedback**: Show users a progress indicator during photo upload.
- **RLS Hardening**: Verify policies with `anon` and `authenticated` roles before commit.

### Don't
- Use `any` or `window.location.reload()`.
- Leak session tokens in logs.
- Bypass Biome errors with `ignore`.

## Code Patterns

### Supabase Realtime (Correct)
```typescript
useEffect(() => {
  const channel = supabase.channel('room').on(...).subscribe();
  return () => { supabase.removeChannel(channel); };
}, []);
```

### GPS Snapshot (Correct)
```typescript
navigator.geolocation.getCurrentPosition(pos => {
  if (pos.coords.accuracy > 50) return setError('Weak signal');
  process(pos);
}, err => handle(err), { enableHighAccuracy: true });
```

## Verification Habits
1. **Edge Case Smoke**: Test "I'm Here" with GPS access denied.
2. **Network Throttling**: Verify 3G upload success in Chrome DevTools.
3. **Log Review**: Ensure zero "console.log" in production builds.
