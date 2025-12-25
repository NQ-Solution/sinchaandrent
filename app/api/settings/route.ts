import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { localDb } from '@/lib/db';

// 캐싱 방지 - 관리자에서 변경한 내용 즉시 반영
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  // 외부 DB 우선 시도, 실패시 로컬 fallback
  try {
    const settings = await prisma.setting.findMany();

    // Convert array to object
    const settingsObj: Record<string, string> = {};
    settings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });

    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error('Error fetching settings from DB, falling back to local:', error);
    // 외부 DB 실패시 로컬 데이터 반환
    try {
      const settings = localDb.settings.findMany();
      const settingsObj: Record<string, string> = {};
      settings.forEach((s: { key: string; value: string }) => {
        settingsObj[s.key] = s.value;
      });
      return NextResponse.json(settingsObj);
    } catch (localError) {
      console.error('Error fetching from local:', localError);
      // Return default values if error
      return NextResponse.json({
        heroTitle: '신차 장기렌트 전문',
        heroSubtitle: '최저가 월 렌트료로 새 차를 경험하세요',
      });
    }
  }
}
