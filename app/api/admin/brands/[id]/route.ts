import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { localDb, DB_MODE } from '@/lib/db';

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
      const brand = localDb.brands.findUnique({
        where: { id },
      });

      if (!brand) {
        return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
      }

      return NextResponse.json(brand);
    }

    const brand = await prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json(brand);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch brand' }, { status: 500 });
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

    // 부분 업데이트를 위한 데이터 객체 생성
    const updateData: Record<string, unknown> = {};
    if (data.nameKr !== undefined) updateData.nameKr = data.nameKr;
    if (data.nameEn !== undefined) updateData.nameEn = data.nameEn;
    if (data.logo !== undefined) updateData.logo = data.logo;
    if (data.isDomestic !== undefined) updateData.isDomestic = data.isDomestic;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    if (DB_MODE === 'local') {
      const brand = localDb.brands.update({
        where: { id },
        data: updateData,
      });
      return NextResponse.json(brand);
    }

    // Prisma 업데이트 시 name도 함께 업데이트
    if (data.nameKr !== undefined) {
      updateData.name = data.nameKr;
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error updating brand:', error);
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 });
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

    // Check if brand has vehicles
    if (DB_MODE === 'local') {
      const vehiclesWithBrand = localDb.vehicles.findMany({
        where: { brandId: id },
      });

      if (vehiclesWithBrand.length > 0) {
        return NextResponse.json(
          { error: '이 브랜드에 등록된 차량이 있어 삭제할 수 없습니다.' },
          { status: 400 }
        );
      }

      localDb.brands.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    const vehicleCount = await prisma.vehicle.count({
      where: { brandId: id },
    });

    if (vehicleCount > 0) {
      return NextResponse.json(
        { error: '이 브랜드에 등록된 차량이 있어 삭제할 수 없습니다.' },
        { status: 400 }
      );
    }

    await prisma.brand.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 });
  }
}
