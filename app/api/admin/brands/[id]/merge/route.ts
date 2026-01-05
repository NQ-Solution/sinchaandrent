import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// 캐싱 방지
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * 중복 색상/옵션 병합 API
 *
 * 여러 항목을 하나의 대상으로 병합:
 * 1. 대상 항목으로 모든 차량 연결을 이동
 * 2. 원본 항목들 삭제
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: _brandId } = await params;
    const data = await request.json();

    const { type, targetId, sourceIds } = data;

    if (!type || !targetId || !sourceIds || !Array.isArray(sourceIds) || sourceIds.length === 0) {
      return NextResponse.json(
        { error: 'type, targetId, sourceIds가 필요합니다' },
        { status: 400 }
      );
    }

    let movedCount = 0;
    let deletedCount = 0;

    if (type === 'color') {
      // 색상 병합
      for (const sourceId of sourceIds) {
        // 1. 소스 색상을 사용하는 모든 VehicleColor 조회
        const vehicleColors = await prisma.vehicleColor.findMany({
          where: { masterColorId: sourceId },
        });

        // 2. 각 VehicleColor를 대상 색상으로 이동 (중복 체크)
        for (const vc of vehicleColors) {
          // 이미 대상 색상이 해당 차량에 연결되어 있는지 확인
          const existing = await prisma.vehicleColor.findUnique({
            where: {
              vehicleId_masterColorId: {
                vehicleId: vc.vehicleId,
                masterColorId: targetId,
              },
            },
          });

          if (existing) {
            // 이미 존재하면 소스 연결만 삭제
            await prisma.vehicleColor.delete({
              where: { id: vc.id },
            });
          } else {
            // 존재하지 않으면 대상으로 업데이트
            await prisma.vehicleColor.update({
              where: { id: vc.id },
              data: { masterColorId: targetId },
            });
            movedCount++;
          }
        }

        // 3. 소스 MasterColor 삭제
        await prisma.masterColor.delete({
          where: { id: sourceId },
        });
        deletedCount++;
      }
    } else if (type === 'option') {
      // 옵션 병합
      for (const sourceId of sourceIds) {
        // 1. 소스 옵션을 사용하는 모든 VehicleOption 조회
        const vehicleOptions = await prisma.vehicleOption.findMany({
          where: { masterOptionId: sourceId },
        });

        // 2. 각 VehicleOption을 대상 옵션으로 이동 (중복 체크)
        for (const vo of vehicleOptions) {
          const existing = await prisma.vehicleOption.findUnique({
            where: {
              vehicleId_masterOptionId: {
                vehicleId: vo.vehicleId,
                masterOptionId: targetId,
              },
            },
          });

          if (existing) {
            await prisma.vehicleOption.delete({
              where: { id: vo.id },
            });
          } else {
            await prisma.vehicleOption.update({
              where: { id: vo.id },
              data: { masterOptionId: targetId },
            });
            movedCount++;
          }
        }

        // 3. 소스 MasterOption 삭제
        await prisma.masterOption.delete({
          where: { id: sourceId },
        });
        deletedCount++;
      }
    } else {
      return NextResponse.json({ error: '잘못된 type입니다' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `병합 완료: ${deletedCount}개 항목 삭제, ${movedCount}개 차량 연결 이동`,
      deletedCount,
      movedCount,
    });
  } catch (error) {
    console.error('Error merging:', error);
    return NextResponse.json({ error: 'Failed to merge' }, { status: 500 });
  }
}
