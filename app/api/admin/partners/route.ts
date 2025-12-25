import { NextRequest, NextResponse } from 'next/server';
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
  sortOrder: number;
  isActive: boolean;
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

function writePartnersJson(partners: Partner[]) {
  fs.writeFileSync(getPartnersFilePath(), JSON.stringify(partners, null, 2));
}

// GET - 모든 제휴사 조회 (관리자용)
export async function GET() {
  try {
    if (DB_MODE === 'local') {
      const partners = readPartnersJson();
      partners.sort((a, b) => a.sortOrder - b.sortOrder);
      return NextResponse.json(partners);
    }

    const partners = await prisma.partner.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return NextResponse.json(partners);
  } catch (error) {
    console.error('Failed to fetch partners:', error);
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 });
  }
}

// POST - 새 제휴사 생성
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (DB_MODE === 'local') {
      const partners = readPartnersJson();
      const newPartner: Partner = {
        id: `partner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: data.name,
        logo: data.logo || null,
        link: data.link || null,
        category: data.category || null,
        sortOrder: data.sortOrder || 0,
        isActive: data.isActive ?? true,
      };
      partners.push(newPartner);
      writePartnersJson(partners);
      return NextResponse.json(newPartner);
    }

    const partner = await prisma.partner.create({
      data: {
        name: data.name,
        logo: data.logo || null,
        link: data.link || null,
        category: data.category || null,
        sortOrder: data.sortOrder || 0,
        isActive: data.isActive ?? true,
      },
    });

    return NextResponse.json(partner);
  } catch (error) {
    console.error('Failed to create partner:', error);
    return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 });
  }
}
