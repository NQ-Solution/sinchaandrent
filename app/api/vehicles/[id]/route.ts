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
                vehicleColor: {
                  include: {
                    masterColor: true,
                  },
                },
              },
            },
            options: {
              include: {
                vehicleOption: {
                  include: {
                    masterOption: true,
                  },
                },
              },
            },
          },
        },
        // 기존 구조 (호환성 유지)
        colors: {
          orderBy: { sortOrder: 'asc' },
        },
        options: {
          orderBy: { sortOrder: 'asc' },
        },
        // 새 구조 (VehicleColor/VehicleOption)
        vehicleColors: {
          orderBy: { sortOrder: 'asc' },
          include: {
            masterColor: true,
          },
        },
        vehicleOptions: {
          orderBy: { sortOrder: 'asc' },
          include: {
            masterOption: true,
          },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // 새 구조의 색상/옵션을 기존 형식으로 변환
    const colorsFromNew = vehicle.vehicleColors.map(vc => ({
      id: vc.id,
      vehicleId: vc.vehicleId,
      type: vc.masterColor.type,
      name: vc.masterColor.name,
      hexCode: vc.masterColor.hexCode,
      price: vc.price,
      sortOrder: vc.sortOrder,
    }));

    const optionsFromNew = vehicle.vehicleOptions.map(vo => ({
      id: vo.id,
      vehicleId: vo.vehicleId,
      name: vo.masterOption.name,
      description: vo.masterOption.description,
      category: vo.masterOption.category,
      price: vo.price,
      sortOrder: vo.sortOrder,
    }));

    // 트림별 색상과 옵션 정보를 포맷팅
    const formattedVehicle = {
      ...vehicle,
      // 새 구조 데이터가 있으면 사용, 없으면 기존 데이터 사용
      colors: colorsFromNew.length > 0 ? colorsFromNew : vehicle.colors,
      options: optionsFromNew.length > 0 ? optionsFromNew : vehicle.options,
      // 내부 필드 제거
      vehicleColors: undefined,
      vehicleOptions: undefined,
      trims: vehicle.trims.map(trim => ({
        ...trim,
        availableColors: trim.colors.map(tc => ({
          id: tc.vehicleColor.id,
          type: tc.vehicleColor.masterColor.type,
          name: tc.vehicleColor.masterColor.name,
          hexCode: tc.vehicleColor.masterColor.hexCode,
          price: tc.vehicleColor.price,
          sortOrder: tc.vehicleColor.sortOrder,
          trimColorId: tc.id,
        })),
        availableOptions: trim.options.map(to => ({
          id: to.vehicleOption.id,
          name: to.vehicleOption.masterOption.name,
          description: to.vehicleOption.masterOption.description,
          category: to.vehicleOption.masterOption.category,
          price: to.vehicleOption.price,
          sortOrder: to.vehicleOption.sortOrder,
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
