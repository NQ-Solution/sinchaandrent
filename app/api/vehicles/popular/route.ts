import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { localDb, DB_MODE } from '@/lib/db';

export async function GET() {
  try {
    if (DB_MODE === 'local') {
      const vehicles = localDb.vehicles.findMany({
        where: { isActive: true, isPopular: true },
        include: { brand: true },
        orderBy: { sortOrder: 'asc' },
      });
      return NextResponse.json(vehicles.slice(0, 8));
    }

    const vehicles = await prisma.vehicle.findMany({
      where: {
        isActive: true,
        isPopular: true,
      },
      include: {
        brand: true,
      },
      orderBy: { sortOrder: 'asc' },
      take: 8,
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error('Error fetching popular vehicles:', error);
    // 에러 시 로컬 데이터 반환
    const vehicles = localDb.vehicles.findMany({
      where: { isActive: true, isPopular: true },
      include: { brand: true },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(vehicles.slice(0, 8));
  }
}
