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
        // 새 구조
        vehicleColors: {
          orderBy: { sortOrder: 'asc' },
          include: { masterColor: true },
        },
        vehicleOptions: {
          orderBy: { sortOrder: 'asc' },
          include: { masterOption: true },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // 새 구조의 색상/옵션을 기존 형식으로 변환
    const colorsFromNew = vehicle.vehicleColors.map(vc => ({
      id: vc.id,
      vehicleId: vc.vehicleId,
      masterColorId: vc.masterColorId,
      type: vc.masterColor.type,
      name: vc.masterColor.name,
      hexCode: vc.masterColor.hexCode,
      price: vc.price,
      sortOrder: vc.sortOrder,
    }));

    const optionsFromNew = vehicle.vehicleOptions.map(vo => ({
      id: vo.id,
      vehicleId: vo.vehicleId,
      masterOptionId: vo.masterOptionId,
      name: vo.masterOption.name,
      description: vo.masterOption.description,
      category: vo.masterOption.category,
      price: vo.price,
      sortOrder: vo.sortOrder,
    }));

    const result = {
      ...vehicle,
      colors: colorsFromNew,
      options: optionsFromNew,
      vehicleColors: undefined,
      vehicleOptions: undefined,
    };

    return NextResponse.json(result);
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
          // 선납금 0%
          rentPrice60_0: data.rentPrice60_0,
          rentPrice48_0: data.rentPrice48_0,
          rentPrice36_0: data.rentPrice36_0,
          rentPrice24_0: data.rentPrice24_0,
          // 선납금 30%
          rentPrice60_30: data.rentPrice60_30,
          rentPrice48_30: data.rentPrice48_30,
          rentPrice36_30: data.rentPrice36_30,
          rentPrice24_30: data.rentPrice24_30,
          // 선납금 40%
          rentPrice60_40: data.rentPrice60_40,
          rentPrice48_40: data.rentPrice48_40,
          rentPrice36_40: data.rentPrice36_40,
          rentPrice24_40: data.rentPrice24_40,
          // 모델 정보
          baseModelName: data.baseModelName,
          hasOtherModels: data.hasOtherModels,
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
        // 선납금 0%
        rentPrice60_0: data.rentPrice60_0,
        rentPrice48_0: data.rentPrice48_0,
        rentPrice36_0: data.rentPrice36_0,
        rentPrice24_0: data.rentPrice24_0,
        // 선납금 30%
        rentPrice60_30: data.rentPrice60_30,
        rentPrice48_30: data.rentPrice48_30,
        rentPrice36_30: data.rentPrice36_30,
        rentPrice24_30: data.rentPrice24_30,
        // 선납금 40%
        rentPrice60_40: data.rentPrice60_40,
        rentPrice48_40: data.rentPrice48_40,
        rentPrice36_40: data.rentPrice36_40,
        rentPrice24_40: data.rentPrice24_40,
        // 모델 정보
        baseModelName: data.baseModelName,
        hasOtherModels: data.hasOtherModels,
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
