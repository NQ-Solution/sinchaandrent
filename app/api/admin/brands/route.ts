import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { localDb, DB_MODE } from '@/lib/db';
import { BrandSchema, validateRequest } from '@/lib/validations';

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (DB_MODE === 'local') {
      const brands = localDb.brands.findMany({
        orderBy: { sortOrder: 'asc' },
      });
      return NextResponse.json(brands);
    }

    const brands = await prisma.brand.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(brands);
  } catch {
    const brands = localDb.brands.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(brands);
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rawData = await request.json();

    // 입력값 검증
    const validation = validateRequest(BrandSchema, rawData);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    const data = validation.data;

    if (DB_MODE === 'local') {
      const brand = localDb.brands.create({
        data: {
          nameKr: data.nameKr,
          nameEn: data.nameEn || null,
          logo: data.logo || null,
          isDomestic: data.isDomestic ?? true,
          isActive: data.isActive ?? true,
          sortOrder: data.sortOrder || 999,
        },
      });
      return NextResponse.json(brand, { status: 201 });
    }

    const brand = await prisma.brand.create({
      data: {
        name: data.nameKr, // name은 대표 이름으로 한글명 사용
        nameKr: data.nameKr,
        nameEn: data.nameEn || null,
        logo: data.logo || null,
        isDomestic: data.isDomestic ?? true,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder || 999,
      },
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    console.error('Error creating brand:', error);
    return NextResponse.json(
      { error: '브랜드 등록에 실패했습니다.' },
      { status: 500 }
    );
  }
}
