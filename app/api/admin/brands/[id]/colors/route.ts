import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// 캐싱 방지
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 브랜드의 모든 마스터 색상 조회
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

    const masterColors = await prisma.masterColor.findMany({
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
        { type: 'asc' },
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    // 사용 중인 차량 수 포함하여 응답
    const colors = masterColors.map(mc => ({
      id: mc.id,
      brandId: mc.brandId,
      type: mc.type,
      name: mc.name,
      hexCode: mc.hexCode,
      sortOrder: mc.sortOrder,
      isActive: mc.isActive,
      usedInVehicles: mc.vehicles.map(v => ({
        vehicleId: v.vehicleId,
        vehicleName: v.vehicle.name,
        price: v.price,
      })),
      vehicleCount: mc.vehicles.length,
    }));

    return NextResponse.json(colors);
  } catch (error) {
    console.error('Error fetching brand colors:', error);
    return NextResponse.json({ error: 'Failed to fetch brand colors' }, { status: 500 });
  }
}

// 새 마스터 색상 추가
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

    // 중복 체크 (같은 브랜드, 타입, 이름)
    const existing = await prisma.masterColor.findUnique({
      where: {
        brandId_type_name: {
          brandId,
          type: data.type,
          name: data.name.trim(),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: '이미 동일한 색상이 존재합니다', existingColor: existing },
        { status: 409 }
      );
    }

    const masterColor = await prisma.masterColor.create({
      data: {
        brandId,
        type: data.type,
        name: data.name.trim(),
        hexCode: data.hexCode || '#000000',
        sortOrder: data.sortOrder || 999,
      },
    });

    return NextResponse.json(masterColor, { status: 201 });
  } catch (error) {
    console.error('Error creating master color:', error);
    return NextResponse.json({ error: 'Failed to create master color' }, { status: 500 });
  }
}

// 마스터 색상 수정
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

    const masterColor = await prisma.masterColor.update({
      where: { id: colorId },
      data: {
        hexCode: updateData.hexCode,
        sortOrder: updateData.sortOrder,
        isActive: updateData.isActive,
      },
    });

    return NextResponse.json(masterColor);
  } catch (error) {
    console.error('Error updating master color:', error);
    return NextResponse.json({ error: 'Failed to update master color' }, { status: 500 });
  }
}

// 마스터 색상 삭제 (사용 중인 차량이 없을 때만)
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

    // 사용 중인 차량 확인
    const usageCount = await prisma.vehicleColor.count({
      where: { masterColorId: colorId },
    });

    if (usageCount > 0) {
      return NextResponse.json(
        { error: `이 색상은 ${usageCount}개 차량에서 사용 중입니다. 먼저 차량에서 제거해주세요.` },
        { status: 400 }
      );
    }

    await prisma.masterColor.delete({
      where: { id: colorId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting master color:', error);
    return NextResponse.json({ error: 'Failed to delete master color' }, { status: 500 });
  }
}
