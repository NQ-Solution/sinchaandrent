import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. 먼저 새 컬럼을 추가 (기존 컬럼 유지)
  await prisma.$executeRaw`
    ALTER TABLE "Vehicle"
    ADD COLUMN IF NOT EXISTS "fuelTypes" TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS "seatingCapacityMin" INTEGER,
    ADD COLUMN IF NOT EXISTS "seatingCapacityMax" INTEGER
  `;

  // 2. 기존 데이터를 새 컬럼으로 복사
  await prisma.$executeRaw`
    UPDATE "Vehicle"
    SET
      "fuelTypes" = ARRAY["fuelType"::text],
      "seatingCapacityMin" = "seatingCapacity",
      "seatingCapacityMax" = "seatingCapacity"
    WHERE "fuelType" IS NOT NULL
  `;

  console.log('Migration completed: fuelType -> fuelTypes[], seatingCapacity -> seatingCapacityMin/Max');

  // 3. 기존 컬럼 삭제
  await prisma.$executeRaw`
    ALTER TABLE "Vehicle"
    DROP COLUMN IF EXISTS "fuelType",
    DROP COLUMN IF EXISTS "seatingCapacity"
  `;

  console.log('Old columns dropped successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
