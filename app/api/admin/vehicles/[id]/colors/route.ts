import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { localDb, DB_MODE } from '@/lib/db';

// 캐싱 방지
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    if (DB_MODE === 'local') {
      const colors = localDb.colors.findMany({
        where: { vehicleId: id },
        orderBy: { sortOrder: 'asc' },
      });
      return NextResponse.json(colors);
    }

    // 새 구조: VehicleColor를 통해 MasterColor 조회
    const vehicleColors = await prisma.vehicleColor.findMany({
      where: { vehicleId: id },
      include: {
        masterColor: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    // 기존 API 형식과 호환되도록 변환
    const colors = vehicleColors.map(vc => ({
      id: vc.id,
      vehicleId: vc.vehicleId,
      masterColorId: vc.masterColorId,
      type: vc.masterColor.type,
      name: vc.masterColor.name,
      hexCode: vc.masterColor.hexCode,
      price: vc.price,
      sortOrder: vc.sortOrder,
      isAvailable: vc.isAvailable,
    }));

    return NextResponse.json(colors);
  } catch (error) {
    console.error('Error fetching colors:', error);
    // Fallback to local
    try {
      const { id } = await params;
      const colors = localDb.colors.findMany({
        where: { vehicleId: id },
        orderBy: { sortOrder: 'asc' },
      });
      return NextResponse.json(colors);
    } catch {
      return NextResponse.json({ error: 'Failed to fetch colors' }, { status: 500 });
    }
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await request.json();

    if (DB_MODE === 'local') {
      const color = localDb.colors.create({
        data: {
          vehicleId: id,
          type: data.type,
          name: data.name,
          hexCode: data.hexCode || '#000000',
          price: data.price || 0,
          sortOrder: data.sortOrder || 999,
        },
      });
      return NextResponse.json(color, { status: 201 });
    }

    // 차량의 브랜드 조회
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: { brandId: true },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // 마스터 색상에서 기존 항목 찾거나 새로 생성 (중복 자동 필터링)
    const masterColor = await prisma.masterColor.upsert({
      where: {
        brandId_type_name: {
          brandId: vehicle.brandId,
          type: data.type,
          name: data.name.trim(),
        },
      },
      create: {
        brandId: vehicle.brandId,
        type: data.type,
        name: data.name.trim(),
        hexCode: data.hexCode || '#000000',
      },
      update: {
        // hexCode가 다르면 업데이트 (선택적)
        hexCode: data.hexCode || undefined,
      },
    });

    // 차량-색상 연결 생성 (중복 시 에러 방지)
    const vehicleColor = await prisma.vehicleColor.upsert({
      where: {
        vehicleId_masterColorId: {
          vehicleId: id,
          masterColorId: masterColor.id,
        },
      },
      create: {
        vehicleId: id,
        masterColorId: masterColor.id,
        price: data.price || 0,
        sortOrder: data.sortOrder || 999,
      },
      update: {
        price: data.price || 0,
        sortOrder: data.sortOrder || 999,
      },
    });

    // 기존 API 형식과 호환되도록 응답
    const response = {
      id: vehicleColor.id,
      vehicleId: vehicleColor.vehicleId,
      masterColorId: masterColor.id,
      type: masterColor.type,
      name: masterColor.name,
      hexCode: masterColor.hexCode,
      price: vehicleColor.price,
      sortOrder: vehicleColor.sortOrder,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating color:', error);
    return NextResponse.json({ error: 'Failed to create color' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  _context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { colorId, ...updateData } = data;

    if (DB_MODE === 'local') {
      const color = localDb.colors.update({
        where: { id: colorId },
        data: updateData,
      });

      if (!color) {
        return NextResponse.json({ error: 'Color not found' }, { status: 404 });
      }

      return NextResponse.json(color);
    }

    // VehicleColor 조회 (MasterColor 포함)
    const vehicleColor = await prisma.vehicleColor.findUnique({
      where: { id: colorId },
      include: { masterColor: true },
    });

    if (!vehicleColor) {
      return NextResponse.json({ error: 'Color not found' }, { status: 404 });
    }

    // 차량별 정보 업데이트 (가격, 정렬순서)
    const updatedVehicleColor = await prisma.vehicleColor.update({
      where: { id: colorId },
      data: {
        price: updateData.price,
        sortOrder: updateData.sortOrder,
      },
    });

    // 마스터 색상 정보 업데이트 (hexCode 등)
    if (updateData.hexCode) {
      await prisma.masterColor.update({
        where: { id: vehicleColor.masterColorId },
        data: {
          hexCode: updateData.hexCode,
        },
      });
    }

    // 기존 API 형식과 호환되도록 응답
    const response = {
      id: updatedVehicleColor.id,
      vehicleId: updatedVehicleColor.vehicleId,
      masterColorId: vehicleColor.masterColorId,
      type: vehicleColor.masterColor.type,
      name: vehicleColor.masterColor.name,
      hexCode: updateData.hexCode || vehicleColor.masterColor.hexCode,
      price: updatedVehicleColor.price,
      sortOrder: updatedVehicleColor.sortOrder,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating color:', error);
    return NextResponse.json({ error: 'Failed to update color' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  _context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const colorId = searchParams.get('colorId');

    if (!colorId) {
      return NextResponse.json({ error: 'colorId is required' }, { status: 400 });
    }

    if (DB_MODE === 'local') {
      const success = localDb.colors.delete({ where: { id: colorId } });

      if (!success) {
        return NextResponse.json({ error: 'Color not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    }

    // VehicleColor 연결만 삭제 (MasterColor는 유지 - 다른 차량에서 사용 가능)
    await prisma.vehicleColor.delete({
      where: { id: colorId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting color:', error);
    return NextResponse.json({ error: 'Failed to delete color' }, { status: 500 });
  }
}
