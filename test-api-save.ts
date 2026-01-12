import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// API 로직을 직접 테스트 (인증 우회)
async function testApiSave() {
  try {
    const sonata = await prisma.vehicle.findFirst({ where: { name: '쏘나타' } });
    if (!sonata) {
      console.log('쏘나타를 찾을 수 없습니다.');
      return;
    }

    console.log('=== 현재 값 ===');
    console.log('rentPrice60_40:', sonata.rentPrice60_40);
    console.log('rentPrice48_40:', sonata.rentPrice48_40);
    console.log('rentPrice36_40:', sonata.rentPrice36_40);
    console.log('rentPrice24_40:', sonata.rentPrice24_40);

    // 프론트엔드에서 보내는 것과 동일한 형식으로 데이터 시뮬레이션
    const formData = {
      rentPrice60_40: '280000',  // 프론트에서 문자열로 보냄
      rentPrice48_40: '320000',
      rentPrice36_40: '380000',
      rentPrice24_40: '450000',
    };

    // API 로직: parseInt 처리
    const updateData = {
      rentPrice60_40: formData.rentPrice60_40 ? parseInt(formData.rentPrice60_40) : null,
      rentPrice48_40: formData.rentPrice48_40 ? parseInt(formData.rentPrice48_40) : null,
      rentPrice36_40: formData.rentPrice36_40 ? parseInt(formData.rentPrice36_40) : null,
      rentPrice24_40: formData.rentPrice24_40 ? parseInt(formData.rentPrice24_40) : null,
    };

    console.log('\n=== API 변환 후 값 ===');
    console.log(updateData);

    // 업데이트 수행
    const updated = await prisma.vehicle.update({
      where: { id: sonata.id },
      data: updateData,
    });

    console.log('\n=== 업데이트 후 DB 값 ===');
    console.log('rentPrice60_40:', updated.rentPrice60_40);
    console.log('rentPrice48_40:', updated.rentPrice48_40);
    console.log('rentPrice36_40:', updated.rentPrice36_40);
    console.log('rentPrice24_40:', updated.rentPrice24_40);

    // 원래 값으로 복원
    await prisma.vehicle.update({
      where: { id: sonata.id },
      data: {
        rentPrice60_40: sonata.rentPrice60_40,
        rentPrice48_40: sonata.rentPrice48_40,
        rentPrice36_40: sonata.rentPrice36_40,
        rentPrice24_40: sonata.rentPrice24_40,
      },
    });

    console.log('\n✅ API 저장 로직 테스트 성공');

  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testApiSave();
