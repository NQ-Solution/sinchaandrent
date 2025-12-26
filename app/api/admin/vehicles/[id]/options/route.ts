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

    const options = await prisma.option.findMany({
      where: { vehicleId: id },
      orderBy: { sortOrder: 'asc' },
    });
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

    const option = await prisma.option.create({
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

    const option = await prisma.option.update({
      where: { id: optionId },
      data: {
        name: updateData.name,
        price: updateData.price,
        description: updateData.description,
        category: updateData.category,
        sortOrder: updateData.sortOrder,
      },
    });

    return NextResponse.json(option);
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

    await prisma.option.delete({
      where: { id: optionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting option:', error);
    return NextResponse.json({ error: 'Failed to delete option' }, { status: 500 });
  }
}
