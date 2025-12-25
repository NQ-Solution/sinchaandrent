import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { localDb, DB_MODE } from '@/lib/db';

// 캐싱 방지
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - 특정 FAQ 조회
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
      const faq = localDb.faqs.findUnique({ where: { id } });
      if (!faq) {
        return NextResponse.json(
          { error: 'FAQ를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      return NextResponse.json(faq);
    }

    const faq = await prisma.fAQ.findUnique({
      where: { id },
    });

    if (!faq) {
      return NextResponse.json(
        { error: 'FAQ를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(faq);
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    return NextResponse.json(
      { error: 'FAQ 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT - FAQ 수정
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
    const body = await request.json();
    const { question, answer, isActive, sortOrder } = body;

    if (DB_MODE === 'local') {
      const updatedFaq = localDb.faqs.update({
        where: { id },
        data: {
          question,
          answer,
          isActive,
          sortOrder,
        },
      });

      if (!updatedFaq) {
        return NextResponse.json(
          { error: 'FAQ를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      return NextResponse.json(updatedFaq);
    }

    const updatedFaq = await prisma.fAQ.update({
      where: { id },
      data: {
        question,
        answer,
        isActive,
        sortOrder,
      },
    });

    return NextResponse.json(updatedFaq);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json(
      { error: 'FAQ 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE - FAQ 삭제
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

    if (DB_MODE === 'local') {
      const deleted = localDb.faqs.delete({ where: { id } });
      if (!deleted) {
        return NextResponse.json(
          { error: 'FAQ를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      return NextResponse.json({ message: 'FAQ가 삭제되었습니다.' });
    }

    await prisma.fAQ.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'FAQ가 삭제되었습니다.' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json(
      { error: 'FAQ 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
