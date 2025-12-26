import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { DB_MODE } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface HealthStatus {
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: Record<string, string | number | Record<string, string>>;
}

export async function GET() {
  const timestamp = new Date().toISOString();

  // 1. 데이터베이스 체크
  const databaseHealth = await checkDatabase();

  // 2. API 엔드포인트 체크
  const apiHealth = await checkAPIEndpoints();

  // 3. 스토리지 체크
  const storageHealth = checkStorage();

  return NextResponse.json({
    database: databaseHealth,
    api: apiHealth,
    storage: storageHealth,
    timestamp,
  });
}

async function checkDatabase(): Promise<HealthStatus> {
  try {
    if (DB_MODE === 'local') {
      // 로컬 JSON 파일 체크
      const dataDir = path.join(process.cwd(), 'data');
      const files = fs.readdirSync(dataDir);

      return {
        status: 'healthy',
        message: `로컬 DB 모드 (${files.length}개 파일)`,
        details: {
          mode: 'local',
          files: files.length,
          dataDir,
        },
      };
    }

    // Prisma 연결 체크
    await prisma.$queryRaw`SELECT 1`;

    // 주요 테이블 카운트
    const [vehicleCount, brandCount, settingsCount] = await Promise.all([
      prisma.vehicle.count().catch(() => 0),
      prisma.brand.count().catch(() => 0),
      prisma.companyInfo.count().catch(() => 0),
    ]);

    return {
      status: 'healthy',
      message: 'Prisma DB 연결 정상',
      details: {
        mode: 'prisma',
        vehicles: vehicleCount,
        brands: brandCount,
        settings: settingsCount,
      },
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'DB 연결 실패',
      details: {
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      },
    };
  }
}

async function checkAPIEndpoints(): Promise<HealthStatus> {
  // fetch 대신 직접 Prisma로 데이터 조회하여 API 가용성 체크
  const results: Record<string, string> = {};
  let errorCount = 0;

  // /api/vehicles 체크
  try {
    const count = await prisma.vehicle.count();
    results['/api/vehicles'] = `OK (${count}개)`;
  } catch {
    results['/api/vehicles'] = 'Error';
    errorCount++;
  }

  // /api/brands 체크
  try {
    const count = await prisma.brand.count();
    results['/api/brands'] = `OK (${count}개)`;
  } catch {
    results['/api/brands'] = 'Error';
    errorCount++;
  }

  // /api/company-info 체크
  try {
    const count = await prisma.companyInfo.count();
    results['/api/company-info'] = `OK (${count}개)`;
  } catch {
    results['/api/company-info'] = 'Error';
    errorCount++;
  }

  // /api/settings 체크
  try {
    const count = await prisma.setting.count();
    results['/api/settings'] = `OK (${count}개)`;
  } catch {
    results['/api/settings'] = 'Error';
    errorCount++;
  }

  if (errorCount === 0) {
    return {
      status: 'healthy',
      message: '모든 API 데이터 조회 정상',
      details: results,
    };
  } else if (errorCount < 4) {
    return {
      status: 'warning',
      message: `일부 API 데이터 조회 오류 (${errorCount}/4)`,
      details: results,
    };
  } else {
    return {
      status: 'error',
      message: '모든 API 데이터 조회 실패',
      details: results,
    };
  }
}

function checkStorage(): HealthStatus {
  try {
    const dataDir = path.join(process.cwd(), 'data');

    // data 디렉토리 존재 확인
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const files = fs.readdirSync(dataDir);

    // 각 파일 크기 계산
    let totalSize = 0;
    const fileDetails: Record<string, string> = {};

    files.forEach(file => {
      const filePath = path.join(dataDir, file);
      const fileStats = fs.statSync(filePath);
      const sizeInMB = (fileStats.size / 1024 / 1024).toFixed(2);
      fileDetails[file] = `${sizeInMB} MB`;
      totalSize += fileStats.size;
    });

    const totalSizeInMB = (totalSize / 1024 / 1024).toFixed(2);

    return {
      status: 'healthy',
      message: `스토리지 정상 (${files.length}개 파일, ${totalSizeInMB} MB)`,
      details: {
        directory: dataDir,
        totalFiles: files.length,
        totalSize: `${totalSizeInMB} MB`,
        files: fileDetails,
      },
    };
  } catch (error) {
    return {
      status: 'error',
      message: '스토리지 접근 실패',
      details: {
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      },
    };
  }
}
