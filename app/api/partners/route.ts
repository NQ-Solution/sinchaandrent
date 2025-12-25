import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { DB_MODE } from '@/lib/db';
import fs from 'fs';
import path from 'path';

interface Partner {
  id: string;
  name: string;
  logo?: string | null;
  link?: string | null;
  category?: string | null;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function getPartnersFilePath() {
  return path.join(process.cwd(), 'data', 'partners.json');
}

function readPartnersJson(): Partner[] {
  try {
    const data = fs.readFileSync(getPartnersFilePath(), 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// GET - 활성화된 제휴사 목록 조회
export async function GET() {
  try {
    if (DB_MODE === 'local') {
      const partners = readPartnersJson()
        .filter(p => p.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      return NextResponse.json(partners);
    }

    const partners = await prisma.partner.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return NextResponse.json(partners);
  } catch (error) {
    console.error('Failed to fetch partners:', error);
    // Fallback to local
    try {
      const partners = readPartnersJson()
        .filter(p => p.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      return NextResponse.json(partners);
    } catch {
      return NextResponse.json([], { status: 200 });
    }
  }
}
