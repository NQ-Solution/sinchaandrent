import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { localDb } from '@/lib/db';

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
    const trims = localDb.trims.findMany({
      where: { vehicleId: id },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(trims);
  } catch (error) {
    console.error('Error fetching trims:', error);
    return NextResponse.json({ error: 'Failed to fetch trims' }, { status: 500 });
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

    const trim = localDb.trims.create({
      data: {
        vehicleId: id,
        name: data.name,
        price: data.price || 0,
        description: data.description || null,
        sortOrder: data.sortOrder || 999,
      },
    });

    return NextResponse.json(trim, { status: 201 });
  } catch (error) {
    console.error('Error creating trim:', error);
    return NextResponse.json({ error: 'Failed to create trim' }, { status: 500 });
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
    const { trimId, ...updateData } = data;

    const trim = localDb.trims.update({
      where: { id: trimId },
      data: updateData,
    });

    if (!trim) {
      return NextResponse.json({ error: 'Trim not found' }, { status: 404 });
    }

    return NextResponse.json(trim);
  } catch (error) {
    console.error('Error updating trim:', error);
    return NextResponse.json({ error: 'Failed to update trim' }, { status: 500 });
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
    const trimId = searchParams.get('trimId');

    if (!trimId) {
      return NextResponse.json({ error: 'trimId is required' }, { status: 400 });
    }

    const success = localDb.trims.delete({ where: { id: trimId } });

    if (!success) {
      return NextResponse.json({ error: 'Trim not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting trim:', error);
    return NextResponse.json({ error: 'Failed to delete trim' }, { status: 500 });
  }
}
