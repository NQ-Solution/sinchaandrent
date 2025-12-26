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

    const colors = await prisma.color.findMany({
      where: { vehicleId: id },
      orderBy: { sortOrder: 'asc' },
    });
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

    const color = await prisma.color.create({
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

    const color = await prisma.color.update({
      where: { id: colorId },
      data: {
        type: updateData.type,
        name: updateData.name,
        hexCode: updateData.hexCode,
        price: updateData.price,
        sortOrder: updateData.sortOrder,
      },
    });

    return NextResponse.json(color);
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

    await prisma.color.delete({
      where: { id: colorId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting color:', error);
    return NextResponse.json({ error: 'Failed to delete color' }, { status: 500 });
  }
}
