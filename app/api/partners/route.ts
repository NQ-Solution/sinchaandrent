import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// 캐싱 방지 - 관리자에서 변경한 내용 즉시 반영
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Partner {
  id: string;
  name: string;
  logo?: string | null;
  link?: string | null;
  category?: string | null;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function getPartnersFilePath() {
  return path.join(process.cwd(), 'data', 'partners.json');
}

function readPartnersJson(): Partner[] {
  try {
    const data = fs.readFileSync(getPartnersFilePath(), 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// GET - 활성화된 제휴사 목록 조회
export async function GET() {
  // 외부 DB 우선 시도, 실패시 로컬 fallback
  try {
    const partners = await prisma.partner.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return NextResponse.json(partners);
  } catch (error) {
    console.error('Failed to fetch partners from DB, falling back to local:', error);
    // 외부 DB 실패시 로컬 데이터 반환
    try {
      const partners = readPartnersJson()
        .filter(p => p.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      return NextResponse.json(partners);
    } catch (localError) {
      console.error('Error fetching from local:', localError);
      return NextResponse.json([]);
    }
  }
}
