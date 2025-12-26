import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 트림에 연결된 옵션 목록 조회
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

    const trimOptions = await prisma.trimOption.findMany({
      where: { trimId },
      include: {
        option: true,
      },
    });

    return NextResponse.json(trimOptions);
  } catch (error) {
    console.error('Error fetching trim options:', error);
    return NextResponse.json({ error: 'Failed to fetch trim options' }, { status: 500 });
  }
}

// 트림에 옵션 연결
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
    const { options } = await request.json();

    // 기존 연결 삭제
    await prisma.trimOption.deleteMany({
      where: { trimId },
    });

    // 새로운 연결 생성
    const trimOptions = await prisma.trimOption.createMany({
      data: options.map((opt: { optionId: string; isIncluded: boolean }) => ({
        trimId,
        optionId: opt.optionId,
        isIncluded: opt.isIncluded,
      })),
    });

    return NextResponse.json(trimOptions, { status: 201 });
  } catch (error) {
    console.error('Error creating trim options:', error);
    return NextResponse.json({ error: 'Failed to create trim options' }, { status: 500 });
  }
}

// 트림에서 옵션 연결 해제
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
    const optionId = searchParams.get('optionId');

    if (!optionId) {
      return NextResponse.json({ error: 'optionId is required' }, { status: 400 });
    }

    const { trimId } = await params;

    await prisma.trimOption.deleteMany({
      where: {
        trimId,
        optionId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting trim option:', error);
    return NextResponse.json({ error: 'Failed to delete trim option' }, { status: 500 });
  }
}
