FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY shared/ shared/
COPY server/ server/
RUN pnpm install --frozen-lockfile

FROM deps AS builder
WORKDIR /app
RUN pnpm --filter @aura/server run build

FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser
COPY --from=builder /app/server/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
USER appuser
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "--enable-source-maps", "dist/index.mjs"]
