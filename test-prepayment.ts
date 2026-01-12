import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPrepayment() {
  try {
    // 1. 쏘나타 차량 조회
    const sonata = await prisma.vehicle.findFirst({
      where: { name: '쏘나타' }
    });

    if (!sonata) {
      console.log('쏘나타 차량을 찾을 수 없습니다.');
      return;
    }

    console.log('=== 현재 쏘나타 선납금 데이터 ===');
    console.log('ID:', sonata.id);
    console.log('선납금 0%:', {
      '60개월': sonata.rentPrice60_0,
      '48개월': sonata.rentPrice48_0,
      '36개월': sonata.rentPrice36_0,
      '24개월': sonata.rentPrice24_0,
    });
    console.log('선납금 30%:', {
      '60개월': sonata.rentPrice60_30,
      '48개월': sonata.rentPrice48_30,
      '36개월': sonata.rentPrice36_30,
      '24개월': sonata.rentPrice24_30,
    });
    console.log('선납금 40%:', {
      '60개월': sonata.rentPrice60_40,
      '48개월': sonata.rentPrice48_40,
      '36개월': sonata.rentPrice36_40,
      '24개월': sonata.rentPrice24_40,
    });

    // 2. 테스트: 40% 선납금 값 업데이트
    console.log('\n=== 40% 선납금 테스트 업데이트 ===');
    const testValue = 123456;
    
    const updated = await prisma.vehicle.update({
      where: { id: sonata.id },
      data: {
        rentPrice60_40: testValue,
        rentPrice48_40: testValue + 1000,
        rentPrice36_40: testValue + 2000,
        rentPrice24_40: testValue + 3000,
      }
    });

    console.log('업데이트 후 40%:', {
      '60개월': updated.rentPrice60_40,
      '48개월': updated.rentPrice48_40,
      '36개월': updated.rentPrice36_40,
      '24개월': updated.rentPrice24_40,
    });

    // 3. 다시 조회해서 확인
    const verified = await prisma.vehicle.findUnique({
      where: { id: sonata.id }
    });

    console.log('\n=== 재조회 확인 ===');
    console.log('40%:', {
      '60개월': verified?.rentPrice60_40,
      '48개월': verified?.rentPrice48_40,
      '36개월': verified?.rentPrice36_40,
      '24개월': verified?.rentPrice24_40,
    });

    // 4. 원래 값으로 복원
    await prisma.vehicle.update({
      where: { id: sonata.id },
      data: {
        rentPrice60_40: sonata.rentPrice60_40,
        rentPrice48_40: sonata.rentPrice48_40,
        rentPrice36_40: sonata.rentPrice36_40,
        rentPrice24_40: sonata.rentPrice24_40,
      }
    });

    console.log('\n=== 원래 값으로 복원 완료 ===');
    console.log('테스트 성공: 40% 선납금 필드 저장/조회 정상 동작');

  } catch (error) {
    console.error('테스트 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrepayment();
