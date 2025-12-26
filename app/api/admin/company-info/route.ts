import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - 모든 사업자 정보 조회 (관리자용)
export async function GET() {
  try {
    const companyInfo = await prisma.companyInfo.findMany();

    // key-value 객체로 변환
    const infoMap: Record<string, string> = {};
    companyInfo.forEach((info) => {
      infoMap[info.key] = info.value;
    });

    return NextResponse.json(infoMap);
  } catch (error) {
    console.error('Failed to fetch company info:', error);
    return NextResponse.json({ error: 'Failed to fetch company info' }, { status: 500 });
  }
}

// POST - 사업자 정보 저장/업데이트 (upsert)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // 각 키-값 쌍을 upsert
    const updates = Object.entries(data).map(([key, value]) =>
      prisma.companyInfo.upsert({
        where: { key },
        update: { value: String(value) },
        create: {
          key,
          value: String(value),
          description: getDescription(key),
        },
      })
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update company info:', error);
    return NextResponse.json({ error: 'Failed to update company info' }, { status: 500 });
  }
}

// 키에 대한 설명 반환
function getDescription(key: string): string {
  const descriptions: Record<string, string> = {
    companyName: '회사명',
    ceoName: '대표자명',
    businessNumber: '사업자등록번호',
    loanBrokerNumber: '대출모집법인 등록번호 (여신협회)',
    address: '사업장 주소',
    phone: '대표 전화번호',
    email: '대표 이메일',
    loanBrokerPdf: '대출모집법인 등록증 PDF URL',
    privacyOfficer: '개인정보보호책임자',
    faxNumber: '팩스번호',
  };
  return descriptions[key] || key;
}
