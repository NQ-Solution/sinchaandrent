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
      const options = localDb.options.findMany({
        where: { vehicleId: id },
        orderBy: { sortOrder: 'asc' },
      });
      return NextResponse.json(options);
    }

    // 새 구조: VehicleOption을 통해 MasterOption 조회
    const vehicleOptions = await prisma.vehicleOption.findMany({
      where: { vehicleId: id },
      include: {
        masterOption: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    // 기존 API 형식과 호환되도록 변환
    const options = vehicleOptions.map(vo => ({
      id: vo.id,
      vehicleId: vo.vehicleId,
      masterOptionId: vo.masterOptionId,
      name: vo.masterOption.name,
      description: vo.masterOption.description,
      category: vo.masterOption.category,
      price: vo.price,
      sortOrder: vo.sortOrder,
      isAvailable: vo.isAvailable,
    }));

    return NextResponse.json(options);
  } catch (error) {
    console.error('Error fetching options:', error);
    // Fallback to local
    try {
      const { id } = await params;
      const options = localDb.options.findMany({
        where: { vehicleId: id },
        orderBy: { sortOrder: 'asc' },
      });
      return NextResponse.json(options);
    } catch {
      return NextResponse.json({ error: 'Failed to fetch options' }, { status: 500 });
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
      const option = localDb.options.create({
        data: {
          vehicleId: id,
          name: data.name,
          price: data.price || 0,
          description: data.description || null,
          category: data.category || null,
          sortOrder: data.sortOrder || 999,
        },
      });
      return NextResponse.json(option, { status: 201 });
    }

    // 차량의 브랜드 조회
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: { brandId: true },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // 마스터 옵션에서 기존 항목 찾거나 새로 생성 (중복 자동 필터링)
    const masterOption = await prisma.masterOption.upsert({
      where: {
        brandId_name: {
          brandId: vehicle.brandId,
          name: data.name.trim(),
        },
      },
      create: {
        brandId: vehicle.brandId,
        name: data.name.trim(),
        description: data.description || null,
        category: data.category || null,
      },
      update: {
        // 기존 항목이 있으면 description, category 업데이트 (선택적)
        description: data.description || undefined,
        category: data.category || undefined,
      },
    });

    // 차량-옵션 연결 생성 (중복 시 에러 방지)
    const vehicleOption = await prisma.vehicleOption.upsert({
      where: {
        vehicleId_masterOptionId: {
          vehicleId: id,
          masterOptionId: masterOption.id,
        },
      },
      create: {
        vehicleId: id,
        masterOptionId: masterOption.id,
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
      id: vehicleOption.id,
      vehicleId: vehicleOption.vehicleId,
      masterOptionId: masterOption.id,
      name: masterOption.name,
      description: masterOption.description,
      category: masterOption.category,
      price: vehicleOption.price,
      sortOrder: vehicleOption.sortOrder,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating option:', error);
    return NextResponse.json({ error: 'Failed to create option' }, { status: 500 });
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
    const { optionId, ...updateData } = data;

    if (DB_MODE === 'local') {
      const option = localDb.options.update({
        where: { id: optionId },
        data: updateData,
      });

      if (!option) {
        return NextResponse.json({ error: 'Option not found' }, { status: 404 });
      }

      return NextResponse.json(option);
    }

    // VehicleOption 조회 (MasterOption 포함)
    const vehicleOption = await prisma.vehicleOption.findUnique({
      where: { id: optionId },
      include: { masterOption: true },
    });

    if (!vehicleOption) {
      return NextResponse.json({ error: 'Option not found' }, { status: 404 });
    }

    // 차량별 정보 업데이트 (가격, 정렬순서)
    const updatedVehicleOption = await prisma.vehicleOption.update({
      where: { id: optionId },
      data: {
        price: updateData.price,
        sortOrder: updateData.sortOrder,
      },
    });

    // 마스터 옵션 정보 업데이트 (description, category)
    const updateMasterData: { description?: string; category?: string } = {};
    if (updateData.description !== undefined) {
      updateMasterData.description = updateData.description;
    }
    if (updateData.category !== undefined) {
      updateMasterData.category = updateData.category;
    }

    if (Object.keys(updateMasterData).length > 0) {
      await prisma.masterOption.update({
        where: { id: vehicleOption.masterOptionId },
        data: updateMasterData,
      });
    }

    // 기존 API 형식과 호환되도록 응답
    const response = {
      id: updatedVehicleOption.id,
      vehicleId: updatedVehicleOption.vehicleId,
      masterOptionId: vehicleOption.masterOptionId,
      name: vehicleOption.masterOption.name,
      description: updateData.description ?? vehicleOption.masterOption.description,
      category: updateData.category ?? vehicleOption.masterOption.category,
      price: updatedVehicleOption.price,
      sortOrder: updatedVehicleOption.sortOrder,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating option:', error);
    return NextResponse.json({ error: 'Failed to update option' }, { status: 500 });
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
    const optionId = searchParams.get('optionId');

    if (!optionId) {
      return NextResponse.json({ error: 'optionId is required' }, { status: 400 });
    }

    if (DB_MODE === 'local') {
      const success = localDb.options.delete({ where: { id: optionId } });

      if (!success) {
        return NextResponse.json({ error: 'Option not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    }

    // VehicleOption 연결만 삭제 (MasterOption은 유지 - 다른 차량에서 사용 가능)
    await prisma.vehicleOption.delete({
      where: { id: optionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting option:', error);
    return NextResponse.json({ error: 'Failed to delete option' }, { status: 500 });
  }
}
