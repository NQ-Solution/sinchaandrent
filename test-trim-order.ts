import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testTrimOrder() {
  try {
    // 쏘나타 차량의 트림 조회
    const sonata = await prisma.vehicle.findFirst({
      where: { name: '쏘나타' },
      include: { trims: { orderBy: { sortOrder: 'asc' } } }
    });

    if (!sonata) {
      console.log('쏘나타를 찾을 수 없습니다.');
      return;
    }

    console.log('=== 쏘나타 트림 목록 (sortOrder 순) ===');
    sonata.trims.forEach((t, idx) => {
      console.log((idx + 1) + '. ' + t.name + ' (sortOrder: ' + t.sortOrder + ', id: ' + t.id + ')');
    });

    if (sonata.trims.length < 2) {
      console.log('\n트림이 2개 미만이어서 순서 변경 테스트 불가');
      return;
    }

    // 첫 번째와 두 번째 트림 순서 바꾸기 테스트
    const firstTrim = sonata.trims[0];
    const secondTrim = sonata.trims[1];

    console.log('\n=== sortOrder 변경 테스트 ===');
    console.log(firstTrim.name + ': ' + firstTrim.sortOrder + ' -> ' + secondTrim.sortOrder);
    console.log(secondTrim.name + ': ' + secondTrim.sortOrder + ' -> ' + firstTrim.sortOrder);

    // 순서 바꾸기
    await prisma.trim.update({
      where: { id: firstTrim.id },
      data: { sortOrder: secondTrim.sortOrder }
    });
    await prisma.trim.update({
      where: { id: secondTrim.id },
      data: { sortOrder: firstTrim.sortOrder }
    });

    // 변경 후 확인
    const updated = await prisma.trim.findMany({
      where: { vehicleId: sonata.id },
      orderBy: { sortOrder: 'asc' }
    });

    console.log('\n=== 변경 후 트림 목록 ===');
    updated.forEach((t, idx) => {
      console.log((idx + 1) + '. ' + t.name + ' (sortOrder: ' + t.sortOrder + ')');
    });

    // 원래대로 복원
    await prisma.trim.update({
      where: { id: firstTrim.id },
      data: { sortOrder: firstTrim.sortOrder }
    });
    await prisma.trim.update({
      where: { id: secondTrim.id },
      data: { sortOrder: secondTrim.sortOrder }
    });

    console.log('\n✅ 트림 sortOrder 저장/조회 테스트 성공');

  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTrimOrder();
