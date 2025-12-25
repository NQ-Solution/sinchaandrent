import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { DB_MODE } from '@/lib/db';
import fs from 'fs';
import path from 'path';

function getCompanyInfoFilePath() {
  return path.join(process.cwd(), 'data', 'company-info.json');
}

function readCompanyInfoJson(): Record<string, string> {
  try {
    const data = fs.readFileSync(getCompanyInfoFilePath(), 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function writeCompanyInfoJson(info: Record<string, string>) {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(getCompanyInfoFilePath(), JSON.stringify(info, null, 2));
}

// GET - 모든 사이트 설정 조회 (관리자용)
export async function GET() {
  try {
    if (DB_MODE === 'local') {
      const info = readCompanyInfoJson();
      return NextResponse.json(info);
    }

    const companyInfo = await prisma.companyInfo.findMany();

    // key-value 객체로 변환
    const infoMap: Record<string, string> = {};
    companyInfo.forEach((info) => {
      infoMap[info.key] = info.value;
    });

    return NextResponse.json(infoMap);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT - 사이트 설정 저장/업데이트 (upsert)
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();

    if (DB_MODE === 'local') {
      const existingInfo = readCompanyInfoJson();
      const updatedInfo = { ...existingInfo, ...data };
      writeCompanyInfoJson(updatedInfo);
      return NextResponse.json({ success: true });
    }

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
    console.error('Failed to update settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
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
    loanBrokerPdf: '대출모집법인 등록증 PDF (base64)',
    loanBrokerImage: '대출모집법인 등록증 이미지 (base64)',
    privacyOfficer: '개인정보보호책임자',
    faxNumber: '팩스번호',
    kakaoChannelUrl: '카카오톡 채널 URL',
    youtubeUrl: '유튜브 채널 URL',
  };
  return descriptions[key] || key;
}
