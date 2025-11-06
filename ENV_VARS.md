# Environment Variables

Create a `.env.local` in `web/` with:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `NEXT_PUBLIC_SITE_URL` — Public site URL (e.g., http://localhost:3000 in dev, Vercel production URL in prod)

On Vercel, add the same variables in Project Settings → Environment Variables.
