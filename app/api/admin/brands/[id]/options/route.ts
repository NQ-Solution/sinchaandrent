import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// 캐싱 방지
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 브랜드의 모든 마스터 옵션 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: brandId } = await params;

    const masterOptions = await prisma.masterOption.findMany({
      where: { brandId, isActive: true },
      include: {
        vehicles: {
          include: {
            vehicle: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: [
        { category: 'asc' },
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    // 사용 중인 차량 수 포함하여 응답
    const options = masterOptions.map(mo => ({
      id: mo.id,
      brandId: mo.brandId,
      name: mo.name,
      description: mo.description,
      category: mo.category,
      sortOrder: mo.sortOrder,
      isActive: mo.isActive,
      usedInVehicles: mo.vehicles.map(v => ({
        vehicleId: v.vehicleId,
        vehicleName: v.vehicle.name,
        price: v.price,
      })),
      vehicleCount: mo.vehicles.length,
    }));

    return NextResponse.json(options);
  } catch (error) {
    console.error('Error fetching brand options:', error);
    return NextResponse.json({ error: 'Failed to fetch brand options' }, { status: 500 });
  }
}

// 새 마스터 옵션 추가
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: brandId } = await params;
    const data = await request.json();

    // 중복 체크 (같은 브랜드, 이름)
    const existing = await prisma.masterOption.findUnique({
      where: {
        brandId_name: {
          brandId,
          name: data.name.trim(),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: '이미 동일한 옵션이 존재합니다', existingOption: existing },
        { status: 409 }
      );
    }

    const masterOption = await prisma.masterOption.create({
      data: {
        brandId,
        name: data.name.trim(),
        description: data.description || null,
        category: data.category || null,
        sortOrder: data.sortOrder || 999,
      },
    });

    return NextResponse.json(masterOption, { status: 201 });
  } catch (error) {
    console.error('Error creating master option:', error);
    return NextResponse.json({ error: 'Failed to create master option' }, { status: 500 });
  }
}

// 마스터 옵션 수정
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

    const masterOption = await prisma.masterOption.update({
      where: { id: optionId },
      data: {
        description: updateData.description,
        category: updateData.category,
        sortOrder: updateData.sortOrder,
        isActive: updateData.isActive,
      },
    });

    return NextResponse.json(masterOption);
  } catch (error) {
    console.error('Error updating master option:', error);
    return NextResponse.json({ error: 'Failed to update master option' }, { status: 500 });
  }
}

// 마스터 옵션 삭제 (사용 중인 차량이 없을 때만)
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

    // 사용 중인 차량 확인
    const usageCount = await prisma.vehicleOption.count({
      where: { masterOptionId: optionId },
    });

    if (usageCount > 0) {
      return NextResponse.json(
        { error: `이 옵션은 ${usageCount}개 차량에서 사용 중입니다. 먼저 차량에서 제거해주세요.` },
        { status: 400 }
      );
    }

    await prisma.masterOption.delete({
      where: { id: optionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting master option:', error);
    return NextResponse.json({ error: 'Failed to delete master option' }, { status: 500 });
  }
}
