import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. 새 컬럼 추가
  await prisma.$executeRaw`
    ALTER TABLE "Vehicle"
    ADD COLUMN IF NOT EXISTS "rentPrice60_0" INTEGER,
    ADD COLUMN IF NOT EXISTS "rentPrice48_0" INTEGER,
    ADD COLUMN IF NOT EXISTS "rentPrice36_0" INTEGER,
    ADD COLUMN IF NOT EXISTS "rentPrice24_0" INTEGER,
    ADD COLUMN IF NOT EXISTS "rentPrice60_25" INTEGER,
    ADD COLUMN IF NOT EXISTS "rentPrice48_25" INTEGER,
    ADD COLUMN IF NOT EXISTS "rentPrice36_25" INTEGER,
    ADD COLUMN IF NOT EXISTS "rentPrice24_25" INTEGER,
    ADD COLUMN IF NOT EXISTS "rentPrice60_50" INTEGER,
    ADD COLUMN IF NOT EXISTS "rentPrice48_50" INTEGER,
    ADD COLUMN IF NOT EXISTS "rentPrice36_50" INTEGER,
    ADD COLUMN IF NOT EXISTS "rentPrice24_50" INTEGER
  `;

  // 2. 기존 데이터를 0% 보증금으로 복사
  await prisma.$executeRaw`
    UPDATE "Vehicle"
    SET
      "rentPrice60_0" = "rentPrice60",
      "rentPrice48_0" = "rentPrice48",
      "rentPrice36_0" = "rentPrice36",
      "rentPrice24_0" = "rentPrice24"
    WHERE "rentPrice60" IS NOT NULL
  `;

  console.log('Migration completed: rentPrice -> rentPrice_0');

  // 3. 기존 컬럼 삭제
  await prisma.$executeRaw`
    ALTER TABLE "Vehicle"
    DROP COLUMN IF EXISTS "rentPrice60",
    DROP COLUMN IF EXISTS "rentPrice48",
    DROP COLUMN IF EXISTS "rentPrice36",
    DROP COLUMN IF EXISTS "rentPrice24"
  `;

  console.log('Old price columns dropped successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
