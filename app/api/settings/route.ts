import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { localDb, DB_MODE } from '@/lib/db';

export async function GET() {
  try {
    if (DB_MODE === 'local') {
      const settings = localDb.settings.findMany();
      const settingsObj: Record<string, string> = {};
      settings.forEach((s: { key: string; value: string }) => {
        settingsObj[s.key] = s.value;
      });
      return NextResponse.json(settingsObj);
    }

    const settings = await prisma.setting.findMany();

    // Convert array to object
    const settingsObj: Record<string, string> = {};
    settings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });

    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error('Error fetching settings:', error);
    // Return default values if error
    return NextResponse.json({
      vehicleDetailSubtitle: '대한민국 대표 차량',
      heroTitle: '신차 장기렌트 전문',
      heroSubtitle: '최저가 월 렌트료로 새 차를 경험하세요',
    });
  }
}
