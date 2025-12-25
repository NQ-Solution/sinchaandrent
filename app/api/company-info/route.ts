import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

// GET - 사업자 정보 조회 (공개 API)
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
    console.error('Failed to fetch company info:', error);
    // 기본값 반환
    return NextResponse.json({
      companyName: '',
      ceoName: '',
      businessNumber: '',
      loanBrokerNumber: '',
      address: '',
      phone: '',
      email: '',
      faxNumber: '',
      privacyOfficer: '',
      loanBrokerPdf: '',
      loanBrokerImage: '',
      kakaoChannelUrl: '',
      youtubeUrl: '',
    });
  }
}
