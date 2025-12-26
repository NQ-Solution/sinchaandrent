import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 트림에 연결된 색상 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; trimId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { trimId } = await params;

    const trimColors = await prisma.trimColor.findMany({
      where: { trimId },
      include: {
        color: true,
      },
    });

    return NextResponse.json(trimColors);
  } catch (error) {
    console.error('Error fetching trim colors:', error);
    return NextResponse.json({ error: 'Failed to fetch trim colors' }, { status: 500 });
  }
}

// 트림에 색상 연결
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; trimId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { trimId } = await params;
    const { colorIds } = await request.json();

    // 기존 연결 삭제
    await prisma.trimColor.deleteMany({
      where: { trimId },
    });

    // 새로운 연결 생성
    const trimColors = await prisma.trimColor.createMany({
      data: colorIds.map((colorId: string) => ({
        trimId,
        colorId,
      })),
    });

    return NextResponse.json(trimColors, { status: 201 });
  } catch (error) {
    console.error('Error creating trim colors:', error);
    return NextResponse.json({ error: 'Failed to create trim colors' }, { status: 500 });
  }
}

// 트림에서 색상 연결 해제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; trimId: string }> }
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

    const { trimId } = await params;

    await prisma.trimColor.deleteMany({
      where: {
        trimId,
        colorId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting trim color:', error);
    return NextResponse.json({ error: 'Failed to delete trim color' }, { status: 500 });
  }
}
