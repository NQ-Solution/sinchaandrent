import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import pako from 'pako';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 60;

// 백업 데이터 수집 함수
async function collectBackupData() {
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

  return {
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
}

// GET - 백업 목록 조회
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const download = searchParams.get('download');
    const backupId = searchParams.get('id');

    // 특정 백업 다운로드
    if (download === 'true' && backupId) {
      const backup = await prisma.backup.findUnique({
        where: { id: backupId },
      });

      if (!backup) {
        return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
      }

      // 압축 해제
      const compressedData = Buffer.from(backup.data, 'base64');
      const decompressed = pako.inflate(compressedData, { to: 'string' });

      const filename = `sincharent-backup-${backup.createdAt.toISOString().split('T')[0]}.json`;

      return new NextResponse(decompressed, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    // 즉시 다운로드 (DB 저장 없이)
    if (download === 'now') {
      const backupData = await collectBackupData();
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
    }

    // 백업 목록 조회 (data 필드 제외)
    const backups = await prisma.backup.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        size: true,
        createdAt: true,
        createdBy: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20, // 최근 20개만
    });

    return NextResponse.json(backups);
  } catch (error) {
    console.error('Backup list failed:', error);
    return NextResponse.json({ error: 'Failed to get backups' }, { status: 500 });
  }
}

// POST - 새 백업 생성 (DB에 저장)
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { name, description } = body;

    // 백업 데이터 수집
    const backupData = await collectBackupData();
    const jsonString = JSON.stringify(backupData);

    // 압축
    const compressed = pako.deflate(jsonString);
    const base64Data = Buffer.from(compressed).toString('base64');

    // 백업 이름 생성
    const date = new Date();
    const defaultName = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} 백업`;

    // DB에 저장
    const backup = await prisma.backup.create({
      data: {
        name: name || defaultName,
        description: description || null,
        data: base64Data,
        size: jsonString.length,
        createdBy: session.user?.email || null,
      },
    });

    // 오래된 백업 자동 삭제 (3개 초과 시)
    const allBackups = await prisma.backup.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });

    if (allBackups.length > 3) {
      const toDelete = allBackups.slice(3).map((b) => b.id);
      await prisma.backup.deleteMany({
        where: { id: { in: toDelete } },
      });
    }

    return NextResponse.json({
      success: true,
      message: '백업이 생성되었습니다.',
      backup: {
        id: backup.id,
        name: backup.name,
        size: backup.size,
        createdAt: backup.createdAt,
      },
    });
  } catch (error) {
    console.error('Backup creation failed:', error);
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
  }
}

// DELETE - 백업 삭제
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Backup ID is required' }, { status: 400 });
    }

    await prisma.backup.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: '백업이 삭제되었습니다.' });
  } catch (error) {
    console.error('Backup deletion failed:', error);
    return NextResponse.json({ error: 'Failed to delete backup' }, { status: 500 });
  }
}
