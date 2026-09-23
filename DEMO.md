# Demo mode

Runs the full platform as a **self-contained frontend** — no backend, no
database. Every API response is served from a dataset bundled into the build,
which makes it deployable to Vercel as an ordinary Next.js app.

All data is fabricated. No production data is copied, and no real company,
person or figure appears in it.

## Deploying to Vercel

1. Import `clepbo/ESG-Horizon---Frontend` at [vercel.com/new](https://vercel.com/new).
2. Pick the branch carrying this config.
3. Deploy.

`vercel.json` already sets the build environment, so there is nothing to
configure by hand:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_DEMO_MODE` | `true` |
| `NEXT_PUBLIC_SUPABASE_URL` | placeholder |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | placeholder |

The Supabase values are placeholders because `lib/supabase.ts` throws at import
time without them, which breaks the build. Supabase only backs social login,
which the demo does not use.

## Running it locally

```bash
cp .env.demo.example .env.local
yarn install
yarn build && yarn start
```

## Signing in

Credentials are **prefilled on the login screen** — a viewer just selects
Login. Any `@meridian-demo.com` address with the password `DemoPass123!` works,
so you can present as whichever persona suits the story:

| Login | Role |
| --- | --- |
| `adaeze.okonkwo@meridian-demo.com` | Company ESG admin (default) |
| `tunde.bakare@meridian-demo.com` | ESG sub-admin — reviewer/approver |
| `ibrahim.danjuma@meridian-demo.com` | Data officer |
| `olumide.fashola@meridian-demo.com` | Viewer, read-only |

Note that the persona changes the name on the login, but the bundled dataset is
the same for everyone — this is a fixture, not a permissions system.

## What the demo contains

**Meridian Industries Plc**, a mid-size Nigerian industrial group with four
subsidiaries in deliberately different SASB industries — cement, power,
logistics and agrifoods — so contrasting emission profiles sit side by side.

| | |
| --- | --- |
| ESG score | 75.1 (grade B), with all five SASB pillars scored |
| Emissions | 28,458 tCO₂e across Scope 1, 2 and 3 |
| Trend | FY2023 → FY2025, declining year on year |
| Progress | 33 of 38 disclosure sections complete |
| Targets | Group net-zero pathway to 2030 plus an interim Scope 2 target |
| Assessments | 12 — three reporting years × four subsidiaries |

## How it works

```
lib/demo/index.ts     the NEXT_PUBLIC_DEMO_MODE flag and demo credentials
lib/demo/adapter.ts   an axios adapter that answers from the route table
lib/demo/data/*.json  the dataset (~140 KB)
```

`lib/api/axios.ts` swaps in the adapter when demo mode is on:

```ts
if (isDemoMode) {
  api.defaults.adapter = demoAdapter;
}
```

Every request in the app already goes through that one instance, so this single
line covers the whole surface. The existing interceptors still run — the
adapter only replaces the network layer beneath them.

Requests are matched as `METHOD /path`, with numeric segments normalised to
`:id` so `/report/47` and `/report/51` share an entry. A read with no fixture
returns an empty success rather than an error, so an unvisited screen shows its
empty state instead of throwing a banner over the demo. Writes report success
but persist nothing — a refresh restores the dataset.

### Regenerating the dataset

The fixtures were captured from a real backend running against the seeded demo
database (see the backend repo's `DEMO.md`), so the shapes match what the UI
actually expects. To refresh them, run that backend, sign in, and record the
responses for the routes listed in `adapter.ts`.

## Turning demo mode off

Unset `NEXT_PUBLIC_DEMO_MODE` and set `NEXT_PUBLIC_API_BASE_URL` to a real API.
The adapter is bypassed entirely and the app behaves exactly as before — none
of the demo code runs.
