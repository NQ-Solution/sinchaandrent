import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { localDb, DB_MODE } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const brandId = searchParams.get('brandId');
    const category = searchParams.get('category');
    const isPopular = searchParams.get('isPopular');
    const sort = searchParams.get('sort') || 'sortOrder';
    const all = searchParams.get('all') === 'true';

    if (DB_MODE === 'local') {
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
    }

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
    console.error('Error fetching vehicles:', error);
    // 에러 시 로컬 데이터 반환
    const vehicles = localDb.vehicles.findMany({
      where: { isActive: true },
      include: { brand: true },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(vehicles);
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
