import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { localDb, DB_MODE } from '@/lib/db';

// 캐싱 방지
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - 모든 FAQ 조회 (관리자용 - 비활성 포함)
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (DB_MODE === 'local') {
      const faqs = localDb.faqs.findMany({
        orderBy: { sortOrder: 'asc' },
      });
      return NextResponse.json(faqs);
    }

    const faqs = await prisma.fAQ.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(faqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    // 에러 시 로컬 데이터 반환
    const faqs = localDb.faqs.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(faqs);
  }
}

// POST - 새 FAQ 생성
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { question, answer, isActive, sortOrder } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: '질문과 답변은 필수 항목입니다.' },
        { status: 400 }
      );
    }

    if (DB_MODE === 'local') {
      const newFaq = localDb.faqs.create({
        data: {
          question,
          answer,
          isActive: isActive ?? true,
          sortOrder: sortOrder ?? 0,
        },
      });
      return NextResponse.json(newFaq, { status: 201 });
    }

    const newFaq = await prisma.fAQ.create({
      data: {
        question,
        answer,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json(newFaq, { status: 201 });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json(
      { error: 'FAQ 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
