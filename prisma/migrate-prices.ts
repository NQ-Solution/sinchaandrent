import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 보증금 비율 변경 마이그레이션 시작 (25%/50% → 30%/40%)...');

  // 1. 새 컬럼 추가 (30%, 40%)
  console.log('1️⃣ 새 컬럼 추가 중...');
  await prisma.$executeRaw`
    ALTER TABLE "Vehicle"
    ADD COLUMN IF NOT EXISTS "rentPrice60_30" INTEGER,
    ADD COLUMN IF NOT EXISTS "rentPrice48_30" INTEGER,
    ADD COLUMN IF NOT EXISTS "rentPrice36_30" INTEGER,
    ADD COLUMN IF NOT EXISTS "rentPrice24_30" INTEGER,
    ADD COLUMN IF NOT EXISTS "rentPrice60_40" INTEGER,
    ADD COLUMN IF NOT EXISTS "rentPrice48_40" INTEGER,
    ADD COLUMN IF NOT EXISTS "rentPrice36_40" INTEGER,
    ADD COLUMN IF NOT EXISTS "rentPrice24_40" INTEGER
  `;
  console.log('✅ 새 컬럼 추가 완료');

  // 2. 기존 데이터 복사 (25% → 30%, 50% → 40%)
  console.log('2️⃣ 기존 데이터 복사 중...');
  await prisma.$executeRaw`
    UPDATE "Vehicle"
    SET
      "rentPrice60_30" = "rentPrice60_25",
      "rentPrice48_30" = "rentPrice48_25",
      "rentPrice36_30" = "rentPrice36_25",
      "rentPrice24_30" = "rentPrice24_25",
      "rentPrice60_40" = "rentPrice60_50",
      "rentPrice48_40" = "rentPrice48_50",
      "rentPrice36_40" = "rentPrice36_50",
      "rentPrice24_40" = "rentPrice24_50"
  `;
  console.log('✅ 데이터 복사 완료');

  // 3. 기존 컬럼 삭제 (25%, 50%)
  console.log('3️⃣ 기존 컬럼 삭제 중...');
  await prisma.$executeRaw`
    ALTER TABLE "Vehicle"
    DROP COLUMN IF EXISTS "rentPrice60_25",
    DROP COLUMN IF EXISTS "rentPrice48_25",
    DROP COLUMN IF EXISTS "rentPrice36_25",
    DROP COLUMN IF EXISTS "rentPrice24_25",
    DROP COLUMN IF EXISTS "rentPrice60_50",
    DROP COLUMN IF EXISTS "rentPrice48_50",
    DROP COLUMN IF EXISTS "rentPrice36_50",
    DROP COLUMN IF EXISTS "rentPrice24_50"
  `;
  console.log('✅ 기존 컬럼 삭제 완료');

  console.log('🎉 마이그레이션 완료! 보증금 비율이 25%/50%에서 30%/40%로 변경되었습니다.');
}

main()
  .catch((error) => {
    console.error('❌ 마이그레이션 실패:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
