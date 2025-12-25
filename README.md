# 신차앤렌트 (SincharentCar)

신차 장기렌트 전문 웹사이트

## 📋 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 서비스 | 신차 장기렌트 견적/상담 플랫폼 |
| 초기 범위 | 국산차 장기렌트 |
| 가격 방식 | 관리자 직접 입력 (자동 계산 없음) |
| 상담 방식 | 전화/카카오톡 (상담 폼 없음) |

## 🔑 핵심 특징

```
✅ 관리자가 직접 월 납입금 입력 (60개월 필수, 나머지 선택)
✅ 가격 미입력 기간 → "상담 문의하기" 버튼으로 안내
✅ 이미지 DB 통합 저장 (추후 외부 스토리지 분리 가능)
✅ 상담 신청 폼 없음 → 전화/카카오톡으로 안내
```

---

## 🛠 기술 스택

### 인프라 (가비아 올인원)

| 영역 | 서비스 | 스펙 |
|------|--------|------|
| 호스팅 | 가비아 컨테이너 | 2vCPU, 2GB RAM |
| DB | 가비아 PostgreSQL | 1vCPU, 1GB |
| 스토리지 | 가비아 스토리지 | 100GB |
| CDN/보안 | Cloudflare | 무료 플랜 |

### 개발 스택

```
Runtime:   Node.js 20
Framework: Next.js 14 (App Router)
Language:  TypeScript
Styling:   Tailwind CSS
State:     Zustand (클라이언트) + React Query (서버)
ORM:       Prisma
DB:        PostgreSQL
Auth:      NextAuth.js (관리자 인증)
Deploy:    Docker (컨테이너)
```

### 예상 월 비용

| 서비스 | 비용 |
|--------|------|
| 가비아 컨테이너 | ₩22,000 |
| 가비아 PostgreSQL | ₩16,500 |
| 가비아 스토리지 | ₩11,000 |
| Cloudflare | ₩0 |
| **합계** | **약 ₩50,000/월** |

---

## 📁 프로젝트 구조

```
sincharent/
├── app/
│   ├── (main)/                    # 사용자 페이지 그룹
│   │   ├── page.tsx               # 홈페이지
│   │   ├── vehicles/
│   │   │   └── page.tsx           # 차량 목록
│   │   ├── vehicle/
│   │   │   └── [id]/
│   │   │       └── page.tsx       # 차량 상세
│   │   ├── about/
│   │   │   └── page.tsx           # 회사소개
│   │   └── contact/
│   │       └── page.tsx           # 상담 안내
│   ├── admin/                     # 관리자 페이지
│   │   ├── layout.tsx
│   │   ├── page.tsx               # 대시보드
│   │   ├── vehicles/              # 차량 관리
│   │   │   ├── page.tsx           # 목록
│   │   │   ├── new/
│   │   │   │   └── page.tsx       # 등록
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx   # 수정
│   │   ├── brands/                # 브랜드 관리
│   │   ├── popular/               # 인기차량 관리
│   │   ├── faq/                   # FAQ 관리
│   │   └── settings/              # 설정
│   ├── api/                       # API 라우트
│   │   ├── brands/
│   │   ├── vehicles/
│   │   ├── faq/
│   │   ├── upload/                # 이미지 업로드
│   │   └── admin/
│   └── layout.tsx
├── components/
│   ├── layout/                    # Header, Footer, FloatingCTA
│   ├── ui/                        # 공통 UI (Button, Card, Modal 등)
│   ├── vehicle/                   # VehicleCard, PriceDisplay 등
│   └── admin/                     # 관리자 전용 컴포넌트
├── lib/
│   ├── prisma.ts                  # Prisma 클라이언트
│   ├── utils.ts                   # 유틸리티 함수
│   └── storage.ts                 # 이미지 저장 (추상화)
├── hooks/                         # 커스텀 훅
├── stores/                        # Zustand 스토어
├── types/                         # TypeScript 타입
├── prisma/
│   ├── schema.prisma              # DB 스키마
│   └── seed.ts                    # 초기 데이터
├── public/
├── Dockerfile
├── docker-compose.yml
└── .env.local
```

---

## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone [repository-url]
cd sincharent
npm install
```

### 2. 환경변수 설정

```bash
cp .env.example .env.local
```

```env
# .env.local

# Database (가비아 PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/sincharent"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# 이미지 저장 방식 (db | storage)
# db: DB에 base64 저장 (초기)
# storage: 외부 스토리지 URL 저장 (확장 시)
IMAGE_STORAGE_TYPE="db"

# 외부 스토리지 설정 (IMAGE_STORAGE_TYPE=storage 일 때)
# STORAGE_ENDPOINT="https://your-storage.gabia.com"
# STORAGE_ACCESS_KEY="your-access-key"
# STORAGE_SECRET_KEY="your-secret-key"
# STORAGE_BUCKET="sincharent"

# 외부 서비스
NEXT_PUBLIC_KAKAO_CHANNEL_URL="http://pf.kakao.com/xxx"
NEXT_PUBLIC_YOUTUBE_URL="https://youtube.com/@xxx"
NEXT_PUBLIC_PHONE_NUMBER="1588-0000"

# Google Analytics (선택)
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

### 3. 데이터베이스 설정

```bash
# Prisma 마이그레이션
npx prisma migrate dev --name init

# 초기 데이터 (브랜드, 관리자 계정)
npx prisma db seed

# DB 확인 (GUI)
npx prisma studio
```

### 4. 개발 서버 실행

```bash
npm run dev
```

- 사용자: http://localhost:3000
- 관리자: http://localhost:3000/admin

---

## 🐳 Docker 설정

### Dockerfile

```dockerfile
FROM node:20-alpine AS base

# 의존성 설치
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# 빌드
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# 실행
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

### docker-compose.yml (로컬 개발용)

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/sincharent
      - NEXTAUTH_SECRET=dev-secret
      - NEXTAUTH_URL=http://localhost:3000
      - IMAGE_STORAGE_TYPE=db
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=sincharent
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### 로컬 Docker 실행

```bash
# 컨테이너 빌드 및 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 중지
docker-compose down
```

---

## 🚀 컨테이너 배포 (가비아)

### 1. Docker 이미지 빌드

```bash
# 프로덕션 빌드
docker build -t sincharent:latest .

# 빌드 확인
docker images | grep sincharent
```

### 2. 로컬 테스트

```bash
# 프로덕션 환경으로 테스트
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="your-secret" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -e IMAGE_STORAGE_TYPE="db" \
  sincharent:latest
```

### 3. 가비아 컨테이너 레지스트리 푸시

```bash
# 가비아 레지스트리 로그인
docker login [가비아-레지스트리-URL]

# 태그 지정
docker tag sincharent:latest [가비아-레지스트리-URL]/sincharent:latest

# 푸시
docker push [가비아-레지스트리-URL]/sincharent:latest
```

### 4. 가비아 컨테이너 서비스 설정

```
1. 가비아 클라우드 콘솔 접속
2. 컨테이너 서비스 → 새 컨테이너 생성
3. 이미지: [레지스트리-URL]/sincharent:latest
4. 포트: 3000
5. 환경변수 설정:
   - DATABASE_URL
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL
   - IMAGE_STORAGE_TYPE
   - NEXT_PUBLIC_KAKAO_CHANNEL_URL
   - NEXT_PUBLIC_PHONE_NUMBER
6. 배포
```

### 5. 업데이트 배포

```bash
# 코드 수정 후
docker build -t sincharent:latest .
docker tag sincharent:latest [가비아-레지스트리-URL]/sincharent:latest
docker push [가비아-레지스트리-URL]/sincharent:latest

# 가비아 콘솔에서 컨테이너 재시작
```

---

## 🗄 데이터베이스 스키마

### prisma/schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 브랜드
model Brand {
  id        String    @id @default(cuid())
  name      String    // 영문명
  nameKr    String    // 한글명
  logo      String?   // 로고 (base64 또는 URL)
  sortOrder Int       @default(0)
  isActive  Boolean   @default(true)
  vehicles  Vehicle[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

// 차량
model Vehicle {
  id          String   @id @default(cuid())
  brandId     String
  brand       Brand    @relation(fields: [brandId], references: [id])
  name        String
  category    VehicleCategory
  fuelType    FuelType
  driveType   String?
  
  // 가격 (관리자 직접 입력)
  basePrice   Int      // 기본 차량가 (참고용)
  rentPrice60 Int      // 60개월 월 납입금 (필수)
  rentPrice48 Int?     // 48개월 (선택)
  rentPrice36 Int?     // 36개월 (선택)
  rentPrice24 Int?     // 24개월 (선택)
  
  // 이미지 (base64 또는 URL)
  thumbnail   String?  // 대표 이미지
  images      String[] // 갤러리 이미지
  
  // 상태
  isPopular   Boolean  @default(false)
  isNew       Boolean  @default(false)
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)
  
  // 관계
  trims       Trim[]
  colors      Color[]
  options     Option[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([brandId])
  @@index([isActive, isPopular])
}

enum VehicleCategory {
  SEDAN
  SUV
  TRUCK
  VAN
  EV
}

enum FuelType {
  GASOLINE
  DIESEL
  HYBRID
  EV
  LPG
}

// 트림
model Trim {
  id          String  @id @default(cuid())
  vehicleId   String
  vehicle     Vehicle @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
  name        String
  description String?
  sortOrder   Int     @default(0)

  @@index([vehicleId])
}

// 색상
model Color {
  id        String    @id @default(cuid())
  vehicleId String
  vehicle   Vehicle   @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
  type      ColorType
  name      String
  hexCode   String    // #FFFFFF
  sortOrder Int       @default(0)

  @@index([vehicleId])
}

enum ColorType {
  EXTERIOR
  INTERIOR
}

// 옵션
model Option {
  id          String  @id @default(cuid())
  vehicleId   String
  vehicle     Vehicle @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
  name        String
  description String?
  category    String? // 안전, 편의, 외관 등
  sortOrder   Int     @default(0)

  @@index([vehicleId])
}

// FAQ
model FAQ {
  id        String   @id @default(cuid())
  question  String
  answer    String
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// 설정
model Setting {
  id          String @id @default(cuid())
  key         String @unique
  value       String
  description String?
}

// 관리자
model Admin {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // hashed
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 🖼 이미지 저장 구조

### 현재 (Phase 1): DB 통합 저장

```typescript
// lib/storage.ts

const STORAGE_TYPE = process.env.IMAGE_STORAGE_TYPE || 'db';

export async function uploadImage(file: File): Promise<string> {
  if (STORAGE_TYPE === 'db') {
    return uploadToDb(file);
  } else {
    return uploadToStorage(file);
  }
}

export async function deleteImage(url: string): Promise<void> {
  if (STORAGE_TYPE === 'db') {
    return;
  } else {
    return deleteFromStorage(url);
  }
}

// DB 저장 (base64)
async function uploadToDb(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const mimeType = file.type;
  return `data:${mimeType};base64,${base64}`;
}

// 외부 스토리지 저장 (확장 시)
async function uploadToStorage(file: File): Promise<string> {
  // TODO: 가비아 스토리지 연동
  throw new Error('Storage not configured');
}

async function deleteFromStorage(url: string): Promise<void> {
  // TODO: 외부 스토리지에서 삭제
  throw new Error('Storage not configured');
}
```

### 확장 시: 외부 스토리지 분리

```env
# 변경 전
IMAGE_STORAGE_TYPE="db"

# 변경 후
IMAGE_STORAGE_TYPE="storage"
STORAGE_ENDPOINT="https://your-storage.gabia.com"
STORAGE_ACCESS_KEY="xxx"
STORAGE_SECRET_KEY="xxx"
STORAGE_BUCKET="sincharent"
```

### 이미지 최적화 (업로드 시)

```typescript
// lib/image.ts
import sharp from 'sharp';

export async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(1280, 720, { 
      fit: 'inside',
      withoutEnlargement: true 
    })
    .webp({ quality: 80 })
    .toBuffer();
}

export async function optimizeThumbnail(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(400, 300, { fit: 'cover' })
    .webp({ quality: 75 })
    .toBuffer();
}
```

---

## 📝 개발 체크리스트

### Phase 1: 프로젝트 셋업 (1주)

- [ ] Next.js 14 프로젝트 생성
- [ ] TypeScript 설정
- [ ] Tailwind CSS 설정 (디자인 시안 CSS 변수)
- [ ] Prisma 설정 및 스키마 작성
- [ ] 가비아 PostgreSQL 연결
- [ ] NextAuth.js 설정
- [ ] Docker 설정
- [ ] 기본 레이아웃 (Header, Footer)

### Phase 2: 사용자 페이지 퍼블리싱 (2주)

#### 공통
- [ ] Header 컴포넌트 (반응형, 스크롤 효과)
- [ ] Footer 컴포넌트
- [ ] FloatingCTA 컴포넌트 (전화, 카카오톡)
- [ ] 모바일 메뉴

#### 홈페이지 (index)
- [ ] 히어로 섹션
- [ ] 통계 섹션
- [ ] 서비스 특징 카드
- [ ] 인기 차량 섹션 (API 연동)
- [ ] 진행 절차 섹션
- [ ] CTA 섹션

#### 차량 목록 (vehicles)
- [ ] 브랜드 필터 (국산)
- [ ] VehicleCard 컴포넌트
- [ ] 차량 그리드
- [ ] 정렬 버튼
- [ ] 사이드바 필터

#### 차량 상세 (vehicle-detail)
- [ ] 이미지 갤러리
- [ ] 차량 기본 정보
- [ ] TrimSelector
- [ ] ColorSelector (외장/내장)
- [ ] OptionList
- [ ] PeriodSelector (60/48/36/24개월)
- [ ] PriceDisplay (관리자 입력 가격 표시)
- [ ] 가격 미입력 시 "상담 문의하기" 버튼
- [ ] 견적서 복사

#### 회사소개 (about)
- [ ] 비전/미션
- [ ] 강점 카드
- [ ] 제휴 브랜드
- [ ] 오시는 길

#### 상담 안내 (contact)
- [ ] 상담 절차 안내
- [ ] 연락 방법 카드
- [ ] FAQ 아코디언

### Phase 3: 차량 상세 기능 (1주)

- [ ] 계약 기간 선택 UI
- [ ] 가격 표시 로직
- [ ] Zustand 스토어 (선택 상태)
- [ ] 견적서 텍스트 복사
- [ ] 카카오톡 공유 (차량 정보 포함)

### Phase 4: 관리자 페이지 (2주)

#### 인증/레이아웃
- [ ] 관리자 로그인
- [ ] 관리자 레이아웃 (사이드바)
- [ ] 세션 체크

#### 대시보드
- [ ] 빠른 메뉴 (차량 등록, 목록)

#### 차량 관리 ⭐
- [ ] 차량 목록 테이블
- [ ] 차량 검색/필터
- [ ] 차량 등록 폼
  - [ ] 기본 정보
  - [ ] 가격 입력 (60개월 필수, 나머지 선택)
  - [ ] 이미지 업로드 (최적화 후 DB 저장)
  - [ ] 트림 추가/삭제
  - [ ] 색상 추가/삭제
  - [ ] 옵션 추가/삭제
- [ ] 차량 수정
- [ ] 차량 삭제
- [ ] 노출/숨김 토글

#### 인기 차량 관리
- [ ] 인기 차량 선택 (체크박스)
- [ ] 순서 변경 (드래그앤드롭)

### Phase 5: 콘텐츠/설정 (1주)

#### FAQ 관리
- [ ] FAQ 목록
- [ ] 추가/수정/삭제
- [ ] 순서 변경

#### 브랜드 관리
- [ ] 브랜드 목록
- [ ] 등록/수정
- [ ] 순서 설정

#### 설정
- [ ] 계약 기간 옵션 설정
- [ ] 기본 선택 기간 설정

### Phase 6: QA/배포 (1주)

- [ ] 모든 페이지 기능 테스트
- [ ] 반응형 테스트
- [ ] 크로스 브라우저 테스트
- [ ] 관리자 기능 테스트
- [ ] 이미지 업로드 테스트
- [ ] SEO 설정 (메타태그, sitemap)
- [ ] 가비아 컨테이너 배포
- [ ] Cloudflare 설정
- [ ] 도메인 연결

---

## 🔐 관리자 접속

```
URL: /admin
초기 계정: admin@sincharent.com / [seed에서 설정]
```

### 초기 관리자 계정 생성 (prisma/seed.ts)

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 관리자 계정
  const hashedPassword = await bcrypt.hash('초기비밀번호', 12);
  await prisma.admin.upsert({
    where: { email: 'admin@sincharent.com' },
    update: {},
    create: {
      email: 'admin@sincharent.com',
      password: hashedPassword,
      name: '관리자',
    },
  });

  // 국산 브랜드
  const brands = [
    { name: 'hyundai', nameKr: '현대', sortOrder: 1 },
    { name: 'kia', nameKr: '기아', sortOrder: 2 },
    { name: 'genesis', nameKr: '제네시스', sortOrder: 3 },
    { name: 'kg', nameKr: 'KG모빌리티', sortOrder: 4 },
    { name: 'chevrolet', nameKr: '쉐보레', sortOrder: 5 },
    { name: 'renault', nameKr: '르노코리아', sortOrder: 6 },
  ];

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { id: brand.name },
      update: {},
      create: { id: brand.name, ...brand },
    });
  }

  // 기본 설정
  const settings = [
    { key: 'defaultPeriod', value: '60', description: '기본 선택 계약 기간' },
    { key: 'visiblePeriods', value: '[24,36,48,60]', description: '노출할 계약 기간' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## 📊 API 명세

### 공개 API

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | /api/brands | 브랜드 목록 |
| GET | /api/vehicles | 차량 목록 (필터, 정렬) |
| GET | /api/vehicles/[id] | 차량 상세 |
| GET | /api/vehicles/popular | 인기 차량 |
| GET | /api/faq | FAQ 목록 |
| GET | /api/settings/public | 공개 설정값 |

### 관리자 API

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | /api/auth/[...nextauth] | 로그인/로그아웃 |
| GET | /api/admin/vehicles | 차량 목록 (관리용) |
| POST | /api/admin/vehicles | 차량 등록 |
| PUT | /api/admin/vehicles/[id] | 차량 수정 |
| DELETE | /api/admin/vehicles/[id] | 차량 삭제 |
| POST | /api/admin/upload | 이미지 업로드 |
| PUT | /api/admin/vehicles/popular | 인기 차량 설정 |
| CRUD | /api/admin/brands | 브랜드 관리 |
| CRUD | /api/admin/faq | FAQ 관리 |
| PUT | /api/admin/settings | 설정 변경 |

---

## 🔮 향후 확장 (Phase 2)

- [ ] 수입차 브랜드 추가
- [ ] 리스 서비스
- [ ] 이미지 외부 스토리지 분리
- [ ] 자동 견적 계산
- [ ] 리드 수집 (행동 로그)
- [ ] 분석 대시보드

---

## 📝 참고사항

### 제외된 기능 (Phase 1)

| 기능 | 사유 |
|------|------|
| 자동 견적 계산 | 관리자 직접 입력 방식으로 대체 |
| 상담 신청 폼 | 전화/카카오톡으로 안내 |
| 리스 서비스 | Phase 2로 연기 |
| 수입차 | Phase 2로 연기 |

### 이미지 용량 예상

| 구분 | 예상 |
|------|------|
| 차량 1대당 | 4~6장 (대표 + 갤러리) |
| 차량 50대 | 약 250장 |
| WebP 변환 시 | 약 30~50MB |
| DB 저장 가능 | ✅ (100GB 스토리지 내) |

---

## 📞 문의

개발 관련 문의: [담당자 연락처]
