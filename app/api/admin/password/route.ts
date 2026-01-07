import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { DB_MODE, localDb } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// PUT - 비밀번호 변경
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: '현재 비밀번호와 새 비밀번호를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: '새 비밀번호는 6자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    const email = session.user.email;

    if (DB_MODE === 'local') {
      // 로컬 모드
      const admin = localDb.admins.findUnique({ where: { email } });
      if (!admin) {
        return NextResponse.json({ error: '관리자를 찾을 수 없습니다.' }, { status: 404 });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: '현재 비밀번호가 올바르지 않습니다.' }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 로컬 DB 업데이트
      const adminsPath = path.join(process.cwd(), 'data', 'admins.json');
      const admins = JSON.parse(fs.readFileSync(adminsPath, 'utf-8'));
      const adminIndex = admins.findIndex((a: { email: string }) => a.email === email);
      if (adminIndex !== -1) {
        admins[adminIndex].password = hashedPassword;
        admins[adminIndex].updatedAt = new Date().toISOString();
        fs.writeFileSync(adminsPath, JSON.stringify(admins, null, 2));
      }

      return NextResponse.json({ success: true, message: '비밀번호가 변경되었습니다.' });
    }

    // DB 모드
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return NextResponse.json({ error: '관리자를 찾을 수 없습니다.' }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: '현재 비밀번호가 올바르지 않습니다.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.admin.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true, message: '비밀번호가 변경되었습니다.' });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json({ error: '비밀번호 변경 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
