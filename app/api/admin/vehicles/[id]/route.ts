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
      const vehicle = localDb.vehicles.findUnique({
        where: { id },
        include: { brand: true },
      });

      if (!vehicle) {
        return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
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
        trims: { orderBy: { sortOrder: 'asc' } },
        colors: { orderBy: { sortOrder: 'asc' } },
        options: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    return NextResponse.json(vehicle);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch vehicle' }, { status: 500 });
  }
}

export async function PUT(
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
      const vehicle = localDb.vehicles.update({
        where: { id },
        data: {
          name: data.name,
          brandId: data.brandId,
          category: data.category,
          fuelTypes: data.fuelTypes,
          driveTypes: data.driveTypes,
          seatingCapacityMin: data.seatingCapacityMin,
          seatingCapacityMax: data.seatingCapacityMax,
          basePrice: data.basePrice,
          // 보증금 0%
          rentPrice60_0: data.rentPrice60_0,
          rentPrice48_0: data.rentPrice48_0,
          rentPrice36_0: data.rentPrice36_0,
          rentPrice24_0: data.rentPrice24_0,
          // 보증금 25%
          rentPrice60_25: data.rentPrice60_25,
          rentPrice48_25: data.rentPrice48_25,
          rentPrice36_25: data.rentPrice36_25,
          rentPrice24_25: data.rentPrice24_25,
          // 보증금 50%
          rentPrice60_50: data.rentPrice60_50,
          rentPrice48_50: data.rentPrice48_50,
          rentPrice36_50: data.rentPrice36_50,
          rentPrice24_50: data.rentPrice24_50,
          isPopular: data.isPopular,
          isNew: data.isNew,
          isActive: data.isActive,
          thumbnail: data.thumbnail,
          images: data.images,
          imageSizePreset: data.imageSizePreset,
          imagePadding: data.imagePadding,
        },
      });
      return NextResponse.json(vehicle);
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        name: data.name,
        brandId: data.brandId,
        category: data.category,
        fuelTypes: data.fuelTypes,
        driveTypes: data.driveTypes,
        seatingCapacityMin: data.seatingCapacityMin,
        seatingCapacityMax: data.seatingCapacityMax,
        basePrice: data.basePrice,
        // 보증금 0%
        rentPrice60_0: data.rentPrice60_0,
        rentPrice48_0: data.rentPrice48_0,
        rentPrice36_0: data.rentPrice36_0,
        rentPrice24_0: data.rentPrice24_0,
        // 보증금 25%
        rentPrice60_25: data.rentPrice60_25,
        rentPrice48_25: data.rentPrice48_25,
        rentPrice36_25: data.rentPrice36_25,
        rentPrice24_25: data.rentPrice24_25,
        // 보증금 50%
        rentPrice60_50: data.rentPrice60_50,
        rentPrice48_50: data.rentPrice48_50,
        rentPrice36_50: data.rentPrice36_50,
        rentPrice24_50: data.rentPrice24_50,
        isPopular: data.isPopular,
        isNew: data.isNew,
        isActive: data.isActive,
        thumbnail: data.thumbnail,
        images: data.images,
        imageSizePreset: data.imageSizePreset,
        imagePadding: data.imagePadding,
      },
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 });
  }
}

// PATCH - 부분 업데이트 (인기차량, 신차 뱃지, 공개 상태 등 토글)
export async function PATCH(
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

    // 허용된 필드만 업데이트
    const allowedFields = ['isPopular', 'isNew', 'isActive', 'sortOrder'];
    const updateData: Record<string, boolean | number> = {};

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    if (DB_MODE === 'local') {
      const vehicle = localDb.vehicles.update({
        where: { id },
        data: updateData,
      });
      return NextResponse.json(vehicle);
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: updateData,
      include: { brand: true },
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Error patching vehicle:', error);
    return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 });
  }
}

export async function DELETE(
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
      localDb.vehicles.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    await prisma.vehicle.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json({ error: 'Failed to delete vehicle' }, { status: 500 });
  }
}
