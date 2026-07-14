FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV DATA_DIR=/app/data
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/data ./data
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
