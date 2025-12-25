import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { localDb, DB_MODE } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (DB_MODE === 'local') {
      const vehicle = localDb.vehicles.findUnique({
        where: { id },
        include: { brand: true },
      });

      if (!vehicle) {
        return NextResponse.json(
          { error: 'Vehicle not found' },
          { status: 404 }
        );
      }

      // 로컬 모드에서도 트림, 색상, 옵션 데이터 가져오기
      const trims = localDb.trims.findMany({
        where: { vehicleId: id },
        orderBy: { sortOrder: 'asc' },
      });

      const colors = localDb.colors.findMany({
        where: { vehicleId: id },
        orderBy: { sortOrder: 'asc' },
      });

      const options = localDb.options.findMany({
        where: { vehicleId: id },
        orderBy: { sortOrder: 'asc' },
      });

      return NextResponse.json({
        ...vehicle,
        trims,
        colors,
        options,
      });
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        brand: true,
        trims: {
          orderBy: { sortOrder: 'asc' },
        },
        colors: {
          orderBy: { sortOrder: 'asc' },
        },
        options: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicle' },
      { status: 500 }
    );
  }
}
