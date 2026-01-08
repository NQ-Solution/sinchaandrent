import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { localDb, DB_MODE } from '@/lib/db';
import { VehicleSchema, validateRequest } from '@/lib/validations';

// 캐싱 방지
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
          // 선납금 0%
          rentPrice60_0: data.rentPrice60_0 ?? null,
          rentPrice48_0: data.rentPrice48_0 ?? null,
          rentPrice36_0: data.rentPrice36_0 ?? null,
          rentPrice24_0: data.rentPrice24_0 ?? null,
          // 선납금 30%
          rentPrice60_30: data.rentPrice60_30 ?? null,
          rentPrice48_30: data.rentPrice48_30 ?? null,
          rentPrice36_30: data.rentPrice36_30 ?? null,
          rentPrice24_30: data.rentPrice24_30 ?? null,
          // 선납금 40%
          rentPrice60_40: data.rentPrice60_40 ?? null,
          rentPrice48_40: data.rentPrice48_40 ?? null,
          rentPrice36_40: data.rentPrice36_40 ?? null,
          rentPrice24_40: data.rentPrice24_40 ?? null,
          // 모델 정보
          baseModelName: data.baseModelName ?? null,
          hasOtherModels: data.hasOtherModels ?? true,
          isPopular: data.isPopular ?? false,
          isNew: data.isNew ?? false,
          isActive: data.isActive ?? true,
          thumbnail: data.thumbnail ?? null,
          images: data.images ?? [],
          imageSizePreset: data.imageSizePreset ?? 'vehicle',
          imagePadding: data.imagePadding ?? 0,
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
        // 선납금 0%
        rentPrice60_0: data.rentPrice60_0 ?? null,
        rentPrice48_0: data.rentPrice48_0 ?? null,
        rentPrice36_0: data.rentPrice36_0 ?? null,
        rentPrice24_0: data.rentPrice24_0 ?? null,
        // 선납금 30%
        rentPrice60_30: data.rentPrice60_30 ?? null,
        rentPrice48_30: data.rentPrice48_30 ?? null,
        rentPrice36_30: data.rentPrice36_30 ?? null,
        rentPrice24_30: data.rentPrice24_30 ?? null,
        // 선납금 40%
        rentPrice60_40: data.rentPrice60_40 ?? null,
        rentPrice48_40: data.rentPrice48_40 ?? null,
        rentPrice36_40: data.rentPrice36_40 ?? null,
        rentPrice24_40: data.rentPrice24_40 ?? null,
        // 모델 정보
        baseModelName: data.baseModelName ?? null,
        hasOtherModels: data.hasOtherModels ?? true,
        isPopular: data.isPopular ?? false,
        isNew: data.isNew ?? false,
        isActive: data.isActive ?? true,
        thumbnail: data.thumbnail ?? null,
        images: data.images ?? [],
        imageSizePreset: data.imageSizePreset ?? 'vehicle',
        imagePadding: data.imagePadding ?? 0,
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
