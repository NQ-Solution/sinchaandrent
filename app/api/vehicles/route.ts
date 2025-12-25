import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { localDb } from '@/lib/db';

// 캐싱 방지 - 관리자에서 변경한 내용 즉시 반영
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const brandId = searchParams.get('brandId');
  const category = searchParams.get('category');
  const isPopular = searchParams.get('isPopular');
  const sort = searchParams.get('sort') || 'sortOrder';
  const all = searchParams.get('all') === 'true';

  // 외부 DB 우선 시도, 실패시 로컬 fallback
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        ...(all ? {} : { isActive: true }),
        ...(brandId && { brandId }),
        ...(category && { category: category as 'SEDAN' | 'SUV' | 'TRUCK' | 'VAN' | 'EV' }),
        ...(isPopular === 'true' && { isPopular: true }),
      },
      include: {
        brand: true,
      },
      orderBy: getOrderBy(sort),
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles from DB, falling back to local:', error);
    // 외부 DB 실패시 로컬 데이터 반환
    try {
      const vehicles = localDb.vehicles.findMany({
        where: {
          ...(all ? {} : { isActive: true }),
          ...(brandId && { brandId }),
          ...(category && { category }),
          ...(isPopular === 'true' && { isPopular: true }),
        },
        include: { brand: true },
        orderBy: getOrderByLocal(sort),
      });
      return NextResponse.json(vehicles);
    } catch (localError) {
      console.error('Error fetching from local:', localError);
      return NextResponse.json([]);
    }
  }
}

function getOrderBy(sort: string) {
  switch (sort) {
    case 'newest':
      return { createdAt: 'desc' as const };
    case 'price-asc':
      return { rentPrice60: 'asc' as const };
    case 'price-desc':
      return { rentPrice60: 'desc' as const };
    case 'name':
      return { name: 'asc' as const };
    default:
      return { sortOrder: 'asc' as const };
  }
}

function getOrderByLocal(sort: string): { [key: string]: 'asc' | 'desc' } {
  switch (sort) {
    case 'price-asc':
      return { rentPrice60: 'asc' };
    case 'price-desc':
      return { rentPrice60: 'desc' };
    case 'name':
      return { name: 'asc' };
    default:
      return { sortOrder: 'asc' };
  }
}
