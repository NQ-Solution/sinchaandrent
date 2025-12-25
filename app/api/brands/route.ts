import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { localDb } from '@/lib/db';

// 캐싱 방지 - 관리자에서 변경한 내용 즉시 반영
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  // 외부 DB 우선 시도, 실패시 로컬 fallback
  try {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(brands);
  } catch (error) {
    console.error('Error fetching brands from DB, falling back to local:', error);
    // 외부 DB 실패시 로컬 데이터 반환
    try {
      const brands = localDb.brands.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
      return NextResponse.json(brands);
    } catch (localError) {
      console.error('Error fetching from local:', localError);
      return NextResponse.json([]);
    }
  }
}
