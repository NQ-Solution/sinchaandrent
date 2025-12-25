import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { localDb, DB_MODE } from '@/lib/db';

export async function GET() {
  try {
    if (DB_MODE === 'local') {
      const brands = localDb.brands.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
      return NextResponse.json(brands);
    }

    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    // 에러 시 로컬 데이터 반환
    const brands = localDb.brands.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(brands);
  }
}
