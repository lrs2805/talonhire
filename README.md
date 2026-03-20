# TalonHire — AI-Powered Recruitment Platform

> Connect LATAM tech talent with European & US companies. Perfect matches in hours, not weeks.

## Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vite + React 18 + TypeScript + Tailwind CSS + Framer Motion |
| **Backend** | Supabase Edge Functions (Deno) |
| **Database** | Supabase PostgreSQL + pgvector (embeddings) |
| **Auth** | Supabase Auth (email/password, role-based) |
| **Storage** | Supabase Storage (CVs, videos, JDs, avatars) |
| **Embeddings** | OpenAI text-embedding-3-large (3072 dims) |
| **Matching** | pgvector cosine similarity + SQL functions |
| **Contracts** | DIY click-to-sign (SHA-256 + IP + timestamp, eIDAS/LGPD) |
| **i18n** | react-i18next (PT, EN, ES, FR, IT, DE) |
| **Design** | Dark tech futuristic — Orbitron/Rajdhani, neon cyan/green |

## Quick Start

```bash
# Frontend
cd frontend
cp .env.example .env    # set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
npm install
npm run dev             # http://localhost:3000
```

## Supabase Setup

1. **Schema**: Execute `supabase/schema.sql` no SQL Editor do Supabase Dashboard
2. **Storage**: Execute `supabase/storage-buckets.sql` no SQL Editor
3. **Edge Functions**: Deploy com:
   ```bash
   supabase functions deploy generate-embedding --project-ref zluwxdsjtvqhguxdhsxm
   supabase functions deploy run-matching --project-ref zluwxdsjtvqhguxdhsxm
   supabase functions deploy reject-match --project-ref zluwxdsjtvqhguxdhsxm --no-verify-jwt
   supabase functions deploy contract-sign --project-ref zluwxdsjtvqhguxdhsxm
   ```
4. **Secrets**: Configure no Dashboard > Edge Functions > Secrets:
   - `OPENAI_API_KEY` — Required for embeddings

## Project Structure

```
talonhire/
├── frontend/src/
│   ├── components/     # 10 TSX components (Header, MatchCard, JobForm, ContractSign, etc.)
│   ├── contexts/       # AuthContext (role-based: candidate/company/admin)
│   ├── hooks/          # useMatches, useJobs, useCandidate, useNotifications, useShareLink
│   ├── i18n/           # 6 locales (PT, EN, ES, FR, IT, DE)
│   ├── lib/            # Supabase client + Edge Function wrappers
│   ├── pages/          # 8 pages (Landing, Login, Signup, 3 Dashboards, Share, JobNew, Contract)
│   ├── types/          # Auto-generated Supabase types + aliases
│   └── App.tsx         # Router with role-based protected routes
├── supabase/
│   ├── schema.sql              # 14 tables, 11 enums, pgvector, RLS, triggers
│   ├── storage-buckets.sql     # 5 buckets with RLS policies
│   └── functions/
│       ├── _shared/            # Rate limiting + CORS helpers
│       ├── generate-embedding/ # OpenAI → pgvector (cv or jd)
│       ├── run-matching/       # pgvector cosine → matchings table
│       ├── reject-match/       # Update match via share token
│       └── contract-sign/      # DIY click-to-sign (SHA-256 + IP + timestamp)
└── MELHORIAS.md                # Roadmap and implementation status
```

## Database (13 tables)

`profiles` → `companies` / `candidates` (pgvector) → `jobs` (pgvector) → `matchings` (multi-score) → `interviews` → `assessments` → `contracts` → `contract_signatures` → `payments` → `notifications` → `translations` → `activity_log` → `user_preferences`

## Key Features

- **AI Matching**: CV embeddings vs JD embeddings (cosine similarity via pgvector)
- **48h Share Links**: Expirable links for companies to review candidates
- **Rejection Feedback**: Companies provide reasons → future matching improvement
- **Role-Based Access**: Candidate, Company, Admin (master/recruiter)
- **LGPD/GDPR**: Consent checkbox + 90-day auto-deletion trigger
- **Electronic Contracts**: DIY click-to-sign (SHA-256 hash + IP + timestamp, eIDAS/LGPD compliant)
- **Neon UI**: Dark tech aesthetic with particle effects and glow animations

## Scripts

```bash
npm run dev          # Dev server
npm run build        # TypeScript check + Vite build
npm run test         # Vitest watch mode
npm run test:run     # Vitest single run
npm run typecheck    # tsc --noEmit
npm run supabase:types  # Regenerate database types
```

## Roadmap

See [MELHORIAS.md](./MELHORIAS.md) for full implementation status and next steps.

## License

Private — All rights reserved.
