# Production image for the ESG Horizon demo frontend.
#
# next.config.ts sets output: "standalone", so the runtime stage only needs the
# generated server bundle plus static assets — not the full node_modules tree.
#
# NEXT_PUBLIC_* values are inlined into the client bundle at BUILD time, which
# is why the API base URL arrives as a build arg rather than a runtime env var.

FROM node:22-slim AS builder
WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable --network-timeout 600000

COPY . .

ARG NEXT_PUBLIC_API_BASE_URL

# lib/supabase.ts throws at import time when these are absent, which breaks
# prerendering for the whole build. Supabase is only used by the social-login
# callback, which the demo does not exercise (demo users sign in with email and
# password), so harmless placeholders are enough to get a working build.
# Override them with real values if you need social login.
ARG NEXT_PUBLIC_SUPABASE_URL=https://demo-placeholder.supabase.co
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=demo-placeholder-anon-key
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_TELEMETRY_DISABLED=1

# Render's fromService injects a bare hostname (no scheme), but the value is
# used directly as an axios baseURL, so it has to be a full URL. Prefix https://
# when the scheme is missing and leave an explicit URL untouched.
RUN case "$NEXT_PUBLIC_API_BASE_URL" in \
      http://*|https://*) NORMALISED="$NEXT_PUBLIC_API_BASE_URL" ;; \
      "")                 NORMALISED="" ;; \
      *)                  NORMALISED="https://$NEXT_PUBLIC_API_BASE_URL" ;; \
    esac; \
    echo "Building against API: ${NORMALISED:-<unset>}"; \
    NEXT_PUBLIC_API_BASE_URL="$NORMALISED" yarn build

FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs -m nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
