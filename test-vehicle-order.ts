import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testVehicleOrder() {
  try {
    // 상위 10개 차량 조회
    const vehicles = await prisma.vehicle.findMany({
      take: 10,
      orderBy: [{ isActive: 'desc' }, { sortOrder: 'asc' }],
      select: { id: true, name: true, sortOrder: true, isActive: true }
    });

    console.log('=== 차량 목록 (상위 10개) ===');
    vehicles.forEach((v, idx) => {
      console.log((idx + 1) + '. ' + v.name + ' (sortOrder: ' + v.sortOrder + ', active: ' + v.isActive + ')');
    });

    // sortOrder 분포 확인
    const allVehicles = await prisma.vehicle.findMany({
      select: { sortOrder: true }
    });

    const sortOrderCounts: Record<number, number> = {};
    allVehicles.forEach(v => {
      const so = v.sortOrder ?? 999;
      sortOrderCounts[so] = (sortOrderCounts[so] || 0) + 1;
    });

    console.log('\n=== sortOrder 분포 ===');
    Object.entries(sortOrderCounts)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .forEach(([order, count]) => {
        console.log('sortOrder ' + order + ': ' + count + '개');
      });

    // 순서 변경 테스트
    if (vehicles.length >= 2) {
      const first = vehicles[0];
      const second = vehicles[1];

      console.log('\n=== sortOrder 변경 테스트 ===');
      console.log('변경 전:');
      console.log('  ' + first.name + ': sortOrder = ' + first.sortOrder);
      console.log('  ' + second.name + ': sortOrder = ' + second.sortOrder);

      // 순서 바꾸기
      await prisma.vehicle.update({
        where: { id: first.id },
        data: { sortOrder: 1000 }
      });
      await prisma.vehicle.update({
        where: { id: second.id },
        data: { sortOrder: 0 }
      });

      // 확인
      const updated = await prisma.vehicle.findMany({
        take: 2,
        orderBy: [{ isActive: 'desc' }, { sortOrder: 'asc' }],
        select: { name: true, sortOrder: true }
      });

      console.log('\n변경 후 (sortOrder 오름차순):');
      updated.forEach((v, idx) => {
        console.log('  ' + (idx + 1) + '. ' + v.name + ': sortOrder = ' + v.sortOrder);
      });

      // 복원
      await prisma.vehicle.update({
        where: { id: first.id },
        data: { sortOrder: first.sortOrder }
      });
      await prisma.vehicle.update({
        where: { id: second.id },
        data: { sortOrder: second.sortOrder }
      });

      console.log('\n✅ 차량 sortOrder 저장/조회 테스트 성공');
    }

  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testVehicleOrder();
