# 신차앤렌트

신차 장기렌트 견적/상담 플랫폼

---

## 기능 요구사항 (Functional Requirements)

### 1. 사용자 페이지

| 페이지 | 주요 기능 |
|--------|----------|
| **홈** (`/`) | 배너 슬라이드, 인기 차량, 브랜드 바로가기, 서비스 안내 |
| **차량 목록** (`/vehicles`) | 브랜드/카테고리/연료/구동방식 필터, 검색, 정렬 |
| **차량 상세** (`/vehicle/[id]`) | 트림/색상/옵션 선택, 기간/선납금 선택, 가격 계산, 견적 복사 |
| **차량 비교** (`/vehicles/compare`) | 최대 3대 비교 |
| **FAQ** (`/faq`) | 자주 묻는 질문 |
| **회사 소개** (`/about`) | 회사 정보, 파트너 |
| **상담 안내** (`/contact`) | 연락처, 상담 절차 |

### 2. 관리자 페이지

| 페이지 | 주요 기능 |
|--------|----------|
| **대시보드** (`/admin`) | 통계 요약, 빠른 메뉴 |
| **차량 관리** (`/admin/vehicles`) | 차량 CRUD, 트림/색상/옵션 관리, 12가지 렌트료 설정 |
| **브랜드 관리** (`/admin/brands`) | 브랜드 CRUD, 마스터 색상/옵션 관리, 브랜드 병합 |
| **배너 관리** (`/admin/banners`) | 배너 CRUD, PC/모바일 이미지, 기간 설정 |
| **인기 차량** (`/admin/popular`) | 인기 차량 선택/순서 변경 |
| **FAQ 관리** (`/admin/faq`) | FAQ CRUD |
| **파트너 관리** (`/admin/partners`) | 파트너 CRUD |
| **회사 정보** (`/admin/company`) | 회사 정보 수정 |
| **설정** (`/admin/settings`) | 사이트 설정, 백업/복원 |

### 3. 차량 상세 편집 기능

| 구분 | 기능 |
|------|------|
| **기본 정보** | 브랜드, 차량명, 카테고리, 연료타입, 구동방식, 승차인원 |
| **가격** | 기본 차량가, 렌트료 12가지 (기간4 x 선납금3) |
| **이미지** | 대표/갤러리 이미지, 크기 프리셋, 패딩 |
| **트림** | 추가/삭제, 순서변경(드래그), 트림별 색상/옵션 지정 |
| **색상** | 외장/내장색 추가/삭제, HEX코드, 가격, 순서변경(드래그) |
| **옵션** | 추가/삭제, 카테고리, 가격, 순서변경(드래그), 트림별 개별가격 |
| **가져오기** | 다른 차량/브랜드 마스터에서 데이터 복사 |

---

## DB 스키마

```
핵심 테이블:
├── Brand            # 브랜드
├── Vehicle          # 차량 (렌트료 12개 필드 포함)
├── Trim             # 트림
├── MasterColor      # 브랜드별 마스터 색상
├── VehicleColor     # 차량별 색상
├── TrimColor        # 트림별 색상 연결
├── MasterOption     # 브랜드별 마스터 옵션
├── VehicleOption    # 차량별 옵션
├── TrimOption       # 트림별 옵션 (포함/선택/가격)

콘텐츠:
├── Banner, FAQ, Partner

설정:
├── Setting, CompanyInfo, Admin, Backup

레거시 (마이그레이션 대기):
├── Color, Option
```

**렌트료 필드 (Vehicle):**
- `rentPrice{기간}_{선납금}` 형식
- 기간: 24, 36, 48, 60 (개월)
- 선납금: 0, 30, 40 (%)

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| ORM | Prisma |
| DB | PostgreSQL |
| Auth | NextAuth.js |
| Deploy | Docker / Cloudtype |

---

## 실행 방법

```bash
# 설치
npm install

# DB 설정
npx prisma generate
npx prisma db push

# 개발 서버
npm run dev
```

**환경변수 (.env):**
```
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
```

---

## API 엔드포인트

**공개 API:**
- `GET /api/brands` - 브랜드 목록
- `GET /api/vehicles` - 차량 목록
- `GET /api/vehicles/[id]` - 차량 상세
- `GET /api/vehicles/popular` - 인기 차량
- `GET /api/faq` - FAQ
- `GET /api/banners` - 배너
- `GET /api/partners` - 파트너
- `GET /api/company-info` - 회사정보

**관리자 API:** `/api/admin/...`
- vehicles, brands, banners, faq, partners, company-info, settings, backup, upload
