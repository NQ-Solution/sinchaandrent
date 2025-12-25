import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// 캐싱 방지 - 관리자에서 변경한 내용 즉시 반영
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
  // 외부 DB 우선 시도, 실패시 로컬 fallback
  try {
    const companyInfo = await prisma.companyInfo.findMany();

    // key-value 객체로 변환
    const infoMap: Record<string, string> = {};
    companyInfo.forEach((info) => {
      infoMap[info.key] = info.value;
    });

    return NextResponse.json(infoMap);
  } catch (error) {
    console.error('Failed to fetch company info from DB, falling back to local:', error);
    // 외부 DB 실패시 로컬 데이터 반환
    try {
      const info = readCompanyInfoJson();
      return NextResponse.json(info);
    } catch (localError) {
      console.error('Error fetching from local:', localError);
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
}
