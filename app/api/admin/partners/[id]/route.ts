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

// GET - 제휴사 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (DB_MODE === 'local') {
      const partners = readPartnersJson();
      const partner = partners.find(p => p.id === id);
      if (!partner) {
        return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
      }
      return NextResponse.json(partner);
    }

    const partner = await prisma.partner.findUnique({
      where: { id },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    return NextResponse.json(partner);
  } catch (error) {
    console.error('Failed to fetch partner:', error);
    return NextResponse.json({ error: 'Failed to fetch partner' }, { status: 500 });
  }
}

// PATCH - 제휴사 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    if (DB_MODE === 'local') {
      const partners = readPartnersJson();
      const index = partners.findIndex(p => p.id === id);
      if (index === -1) {
        return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
      }

      const updatedPartner = { ...partners[index] };
      if (data.name !== undefined) updatedPartner.name = data.name;
      if (data.logo !== undefined) updatedPartner.logo = data.logo;
      if (data.link !== undefined) updatedPartner.link = data.link;
      if (data.category !== undefined) updatedPartner.category = data.category;
      if (data.sortOrder !== undefined) updatedPartner.sortOrder = data.sortOrder;
      if (data.isActive !== undefined) updatedPartner.isActive = data.isActive;

      partners[index] = updatedPartner;
      writePartnersJson(partners);
      return NextResponse.json(updatedPartner);
    }

    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.logo !== undefined) updateData.logo = data.logo;
    if (data.link !== undefined) updateData.link = data.link;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const partner = await prisma.partner.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(partner);
  } catch (error) {
    console.error('Failed to update partner:', error);
    return NextResponse.json({ error: 'Failed to update partner' }, { status: 500 });
  }
}

// DELETE - 제휴사 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (DB_MODE === 'local') {
      const partners = readPartnersJson();
      const filtered = partners.filter(p => p.id !== id);
      writePartnersJson(filtered);
      return NextResponse.json({ success: true });
    }

    await prisma.partner.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete partner:', error);
    return NextResponse.json({ error: 'Failed to delete partner' }, { status: 500 });
  }
}
