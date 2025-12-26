import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { localDb } from '@/lib/db';

// 캐싱 방지 - 관리자에서 변경한 내용 즉시 반영
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 외부 DB 우선 시도, 실패시 로컬 fallback
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        brand: true,
        trims: {
          orderBy: { sortOrder: 'asc' },
          include: {
            colors: {
              include: {
                color: true,
              },
            },
            options: {
              include: {
                option: true,
              },
            },
          },
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

    // 트림별 색상과 옵션 정보를 포맷팅
    const formattedVehicle = {
      ...vehicle,
      trims: vehicle.trims.map(trim => ({
        ...trim,
        availableColors: trim.colors.map(tc => ({
          ...tc.color,
          trimColorId: tc.id,
        })),
        availableOptions: trim.options.map(to => ({
          ...to.option,
          trimOptionId: to.id,
          isIncluded: to.isIncluded,
        })),
        colors: undefined,
        options: undefined,
      })),
    };

    return NextResponse.json(formattedVehicle);
  } catch (error) {
    console.error('Error fetching vehicle from DB, falling back to local:', error);
    // 외부 DB 실패시 로컬 데이터 반환
    try {
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
    } catch (localError) {
      console.error('Error fetching from local:', localError);
      return NextResponse.json(
        { error: 'Failed to fetch vehicle' },
        { status: 500 }
      );
    }
  }
}
