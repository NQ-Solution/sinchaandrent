import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { localDb, DB_MODE } from '@/lib/db';
import { VehicleSchema, validateRequest } from '@/lib/validations';

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (DB_MODE === 'local') {
      const vehicles = localDb.vehicles.findMany({
        include: { brand: true },
        orderBy: [{ isActive: 'desc' }, { sortOrder: 'asc' }],
      });
      return NextResponse.json(vehicles);
    }

    const vehicles = await prisma.vehicle.findMany({
      include: { brand: true },
      orderBy: [{ isActive: 'desc' }, { sortOrder: 'asc' }],
    });

    return NextResponse.json(vehicles);
  } catch {
    // 에러 시 로컬 데이터 반환
    const vehicles = localDb.vehicles.findMany({
      include: { brand: true },
      orderBy: [{ isActive: 'desc' }, { sortOrder: 'asc' }],
    });
    return NextResponse.json(vehicles);
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rawData = await request.json();

    // 입력값 검증
    const validation = validateRequest(VehicleSchema, rawData);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    const data = validation.data;

    if (DB_MODE === 'local') {
      const vehicle = localDb.vehicles.create({
        data: {
          name: data.name,
          brandId: data.brandId,
          category: data.category,
          fuelTypes: data.fuelTypes || [],
          driveTypes: data.driveTypes || [],
          seatingCapacityMin: data.seatingCapacityMin || null,
          seatingCapacityMax: data.seatingCapacityMax || null,
          basePrice: data.basePrice,
          // 보증금 0%
          rentPrice60_0: data.rentPrice60_0 ?? null,
          rentPrice48_0: data.rentPrice48_0 ?? null,
          rentPrice36_0: data.rentPrice36_0 ?? null,
          rentPrice24_0: data.rentPrice24_0 ?? null,
          // 보증금 25%
          rentPrice60_25: data.rentPrice60_25 ?? null,
          rentPrice48_25: data.rentPrice48_25 ?? null,
          rentPrice36_25: data.rentPrice36_25 ?? null,
          rentPrice24_25: data.rentPrice24_25 ?? null,
          // 보증금 50%
          rentPrice60_50: data.rentPrice60_50 ?? null,
          rentPrice48_50: data.rentPrice48_50 ?? null,
          rentPrice36_50: data.rentPrice36_50 ?? null,
          rentPrice24_50: data.rentPrice24_50 ?? null,
          isPopular: data.isPopular ?? false,
          isNew: data.isNew ?? false,
          isActive: data.isActive ?? true,
          thumbnail: data.thumbnail ?? null,
          images: data.images ?? [],
          sortOrder: 999,
        },
      });
      return NextResponse.json(vehicle, { status: 201 });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        name: data.name,
        brandId: data.brandId,
        category: data.category,
        fuelTypes: data.fuelTypes ?? [],
        driveTypes: data.driveTypes ?? [],
        seatingCapacityMin: data.seatingCapacityMin ?? null,
        seatingCapacityMax: data.seatingCapacityMax ?? null,
        basePrice: data.basePrice,
        // 보증금 0%
        rentPrice60_0: data.rentPrice60_0 ?? null,
        rentPrice48_0: data.rentPrice48_0 ?? null,
        rentPrice36_0: data.rentPrice36_0 ?? null,
        rentPrice24_0: data.rentPrice24_0 ?? null,
        // 보증금 25%
        rentPrice60_25: data.rentPrice60_25 ?? null,
        rentPrice48_25: data.rentPrice48_25 ?? null,
        rentPrice36_25: data.rentPrice36_25 ?? null,
        rentPrice24_25: data.rentPrice24_25 ?? null,
        // 보증금 50%
        rentPrice60_50: data.rentPrice60_50 ?? null,
        rentPrice48_50: data.rentPrice48_50 ?? null,
        rentPrice36_50: data.rentPrice36_50 ?? null,
        rentPrice24_50: data.rentPrice24_50 ?? null,
        isPopular: data.isPopular ?? false,
        isNew: data.isNew ?? false,
        isActive: data.isActive ?? true,
        thumbnail: data.thumbnail ?? null,
        images: data.images ?? [],
      },
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return NextResponse.json(
      { error: '차량 등록에 실패했습니다.' },
      { status: 500 }
    );
  }
}
