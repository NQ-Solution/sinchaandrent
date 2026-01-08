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
        vehicleOption: {
          include: {
            masterOption: true,
          },
        },
      },
    });

    // 기존 형식으로 변환하여 반환
    const result = trimOptions.map(to => ({
      id: to.id,
      trimId: to.trimId,
      vehicleOptionId: to.vehicleOptionId,
      isIncluded: to.isIncluded,
      price: to.price, // 트림별 개별 가격
      option: {
        id: to.vehicleOption.id,
        name: to.vehicleOption.masterOption.name,
        description: to.vehicleOption.masterOption.description,
        category: to.vehicleOption.masterOption.category,
        price: to.vehicleOption.price, // 기본 가격
        sortOrder: to.vehicleOption.sortOrder,
      },
    }));

    return NextResponse.json(result);
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

    // 새로운 연결 생성 (options 배열에서 optionId는 이제 VehicleOption.id)
    if (options && options.length > 0) {
      await prisma.trimOption.createMany({
        data: options.map((opt: { optionId: string; isIncluded: boolean; price?: number | null }) => ({
          trimId,
          vehicleOptionId: opt.optionId,
          isIncluded: opt.isIncluded ?? false,
          price: opt.price ?? null, // 트림별 개별 가격
        })),
      });
    }

    // 생성된 결과 조회하여 반환
    const createdTrimOptions = await prisma.trimOption.findMany({
      where: { trimId },
      include: {
        vehicleOption: {
          include: {
            masterOption: true,
          },
        },
      },
    });

    return NextResponse.json(createdTrimOptions, { status: 201 });
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
    const vehicleOptionId = searchParams.get('vehicleOptionId') || searchParams.get('optionId');

    if (!vehicleOptionId) {
      return NextResponse.json({ error: 'vehicleOptionId is required' }, { status: 400 });
    }

    const { trimId } = await params;

    await prisma.trimOption.deleteMany({
      where: {
        trimId,
        vehicleOptionId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting trim option:', error);
    return NextResponse.json({ error: 'Failed to delete trim option' }, { status: 500 });
  }
}
