import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { DB_MODE } from '@/lib/db';
import fs from 'fs';
import path from 'path';

interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  image?: string | null;
  mobileImage?: string | null;
  link?: string | null;
  linkText?: string | null;
  description?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  sortOrder: number;
  isActive: boolean;
}

function getBannersFilePath() {
  return path.join(process.cwd(), 'data', 'banners.json');
}

function readBannersJson(): Banner[] {
  try {
    const data = fs.readFileSync(getBannersFilePath(), 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeBannersJson(banners: Banner[]) {
  fs.writeFileSync(getBannersFilePath(), JSON.stringify(banners, null, 2));
}

// GET - 모든 배너 조회 (관리자용)
export async function GET() {
  try {
    if (DB_MODE === 'local') {
      const banners = readBannersJson();
      banners.sort((a, b) => a.sortOrder - b.sortOrder);
      return NextResponse.json(banners);
    }

    const banners = await prisma.banner.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return NextResponse.json(banners);
  } catch (error) {
    console.error('Failed to fetch banners:', error);
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}

// POST - 새 배너 생성
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (DB_MODE === 'local') {
      const banners = readBannersJson();
      const newBanner: Banner = {
        id: `banner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: data.title,
        subtitle: data.subtitle || null,
        image: data.image || null,
        mobileImage: data.mobileImage || null,
        link: data.link || null,
        linkText: data.linkText || null,
        description: data.description || null,
        backgroundColor: data.backgroundColor || null,
        textColor: data.textColor || null,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        sortOrder: data.sortOrder || 0,
        isActive: data.isActive ?? true,
      };
      banners.push(newBanner);
      writeBannersJson(banners);
      return NextResponse.json(newBanner);
    }

    const banner = await prisma.banner.create({
      data: {
        title: data.title,
        subtitle: data.subtitle || null,
        image: data.image || null,
        mobileImage: data.mobileImage || null,
        link: data.link || null,
        linkText: data.linkText || null,
        description: data.description || null,
        backgroundColor: data.backgroundColor || null,
        textColor: data.textColor || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        sortOrder: data.sortOrder || 0,
        isActive: data.isActive ?? true,
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Failed to create banner:', error);
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
  }
}
