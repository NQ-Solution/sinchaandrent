import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// 캐싱 방지 - 관리자에서 변경한 내용 즉시 반영
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  startDate: string | null;
  endDate: string | null;
}

function readBannersJson(): Banner[] {
  try {
    const filePath = path.join(process.cwd(), 'data', 'banners.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// GET - 활성화된 배너 목록 조회
export async function GET() {
  // 외부 DB 우선 시도, 실패시 로컬 fallback
  try {
    const now = new Date();

    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        OR: [
          // 날짜 설정이 없는 경우 항상 표시
          {
            startDate: null,
            endDate: null,
          },
          // 시작일만 있고 현재 시작일 이후인 경우
          {
            startDate: { lte: now },
            endDate: null,
          },
          // 종료일만 있고 현재 종료일 이전인 경우
          {
            startDate: null,
            endDate: { gte: now },
          },
          // 시작일과 종료일 사이인 경우
          {
            startDate: { lte: now },
            endDate: { gte: now },
          },
        ],
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return NextResponse.json(banners);
  } catch (error) {
    console.error('Failed to fetch banners from DB, falling back to local:', error);
    // 외부 DB 실패시 로컬 데이터 반환
    try {
      const banners = readBannersJson();
      const now = new Date();

      const activeBanners = banners.filter(banner => {
        if (!banner.isActive) return false;

        const startDate = banner.startDate ? new Date(banner.startDate) : null;
        const endDate = banner.endDate ? new Date(banner.endDate) : null;

        if (!startDate && !endDate) return true;
        if (startDate && !endDate) return startDate <= now;
        if (!startDate && endDate) return endDate >= now;
        return startDate! <= now && endDate! >= now;
      });

      activeBanners.sort((a, b) => a.sortOrder - b.sortOrder);
      return NextResponse.json(activeBanners);
    } catch (localError) {
      console.error('Error fetching from local:', localError);
      return NextResponse.json([]);
    }
  }
}
