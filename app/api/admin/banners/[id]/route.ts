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

// GET - 배너 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (DB_MODE === 'local') {
      const banners = readBannersJson();
      const banner = banners.find(b => b.id === id);
      if (!banner) {
        return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
      }
      return NextResponse.json(banner);
    }

    const banner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Failed to fetch banner:', error);
    return NextResponse.json({ error: 'Failed to fetch banner' }, { status: 500 });
  }
}

// PATCH - 배너 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    if (DB_MODE === 'local') {
      const banners = readBannersJson();
      const index = banners.findIndex(b => b.id === id);
      if (index === -1) {
        return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
      }

      const updatedBanner = { ...banners[index] };
      if (data.title !== undefined) updatedBanner.title = data.title;
      if (data.subtitle !== undefined) updatedBanner.subtitle = data.subtitle;
      if (data.image !== undefined) updatedBanner.image = data.image;
      if (data.mobileImage !== undefined) updatedBanner.mobileImage = data.mobileImage;
      if (data.link !== undefined) updatedBanner.link = data.link;
      if (data.linkText !== undefined) updatedBanner.linkText = data.linkText;
      if (data.description !== undefined) updatedBanner.description = data.description;
      if (data.backgroundColor !== undefined) updatedBanner.backgroundColor = data.backgroundColor;
      if (data.textColor !== undefined) updatedBanner.textColor = data.textColor;
      if (data.startDate !== undefined) updatedBanner.startDate = data.startDate;
      if (data.endDate !== undefined) updatedBanner.endDate = data.endDate;
      if (data.sortOrder !== undefined) updatedBanner.sortOrder = data.sortOrder;
      if (data.isActive !== undefined) updatedBanner.isActive = data.isActive;

      banners[index] = updatedBanner;
      writeBannersJson(banners);
      return NextResponse.json(updatedBanner);
    }

    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.subtitle !== undefined) updateData.subtitle = data.subtitle;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.mobileImage !== undefined) updateData.mobileImage = data.mobileImage;
    if (data.link !== undefined) updateData.link = data.link;
    if (data.linkText !== undefined) updateData.linkText = data.linkText;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.backgroundColor !== undefined) updateData.backgroundColor = data.backgroundColor;
    if (data.textColor !== undefined) updateData.textColor = data.textColor;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const banner = await prisma.banner.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Failed to update banner:', error);
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}

// DELETE - 배너 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (DB_MODE === 'local') {
      const banners = readBannersJson();
      const filtered = banners.filter(b => b.id !== id);
      writeBannersJson(filtered);
      return NextResponse.json({ success: true });
    }

    await prisma.banner.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete banner:', error);
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}
