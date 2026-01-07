import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 60;

// GET - 전체 DB 백업 다운로드
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 모든 테이블 데이터 조회
    const [
      brands,
      masterColors,
      masterOptions,
      vehicles,
      trims,
      vehicleColors,
      vehicleOptions,
      trimColors,
      trimOptions,
      colors,
      options,
      faqs,
      banners,
      partners,
      companyInfo,
      settings,
    ] = await Promise.all([
      prisma.brand.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.masterColor.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.masterOption.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.vehicle.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.trim.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.vehicleColor.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.vehicleOption.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.trimColor.findMany(),
      prisma.trimOption.findMany(),
      prisma.color.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.option.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.fAQ.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.partner.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.companyInfo.findMany(),
      prisma.setting.findMany(),
    ]);

    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: {
        brands,
        masterColors,
        masterOptions,
        vehicles,
        trims,
        vehicleColors,
        vehicleOptions,
        trimColors,
        trimOptions,
        colors,
        options,
        faqs,
        banners,
        partners,
        companyInfo,
        settings,
      },
      summary: {
        brands: brands.length,
        masterColors: masterColors.length,
        masterOptions: masterOptions.length,
        vehicles: vehicles.length,
        trims: trims.length,
        vehicleColors: vehicleColors.length,
        vehicleOptions: vehicleOptions.length,
        trimColors: trimColors.length,
        trimOptions: trimOptions.length,
        colors: colors.length,
        options: options.length,
        faqs: faqs.length,
        banners: banners.length,
        partners: partners.length,
        companyInfo: companyInfo.length,
        settings: settings.length,
      },
    };

    // JSON 파일로 응답
    const jsonString = JSON.stringify(backupData, null, 2);
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    const filename = `sincharent-backup-${date}_${time}.json`;

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Backup failed:', error);
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
  }
}
