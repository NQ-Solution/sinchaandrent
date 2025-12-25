FROM node:20-alpine AS base

# 의존성 설치를 위한 필수 패키지 (sharp, bcrypt 등 네이티브 모듈용)
RUN apk add --no-cache libc6-compat

# 의존성 설치
FROM base AS deps
WORKDIR /app

# sharp 패키지를 위한 추가 의존성
RUN apk add --no-cache python3 make g++ vips-dev

COPY package*.json ./

# npm ci 대신 npm install 사용 (더 유연함)
RUN npm install --frozen-lockfile || npm install

# 빌드
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 환경 변수 설정
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Prisma 클라이언트 생성
RUN npx prisma generate

# Next.js 빌드
RUN npm run build

# 실행
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# public 폴더 복사
COPY --from=builder /app/public ./public

# 빌드된 standalone 앱 복사
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Prisma 스키마 복사 (DB 마이그레이션용)
COPY --from=builder /app/prisma ./prisma

# 로컬 DB 데이터 파일 복사 (DB_MODE=local 용)
COPY --from=builder /app/data ./data

# 권한 설정
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
