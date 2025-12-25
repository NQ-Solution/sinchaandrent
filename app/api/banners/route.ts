import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { DB_MODE } from '@/lib/db';
import fs from 'fs';
import path from 'path';

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
  try {
    if (DB_MODE === 'local') {
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
    }

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
    console.error('Failed to fetch banners:', error);
    return NextResponse.json([], { status: 200 });
  }
}
