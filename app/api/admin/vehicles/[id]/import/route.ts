import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// 캐싱 방지
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * 다른 차량에서 색상/옵션을 가져오기 (중복 자동 필터링)
 *
 * 예: G80, G70에서 옵션을 가져오면 중복은 자동으로 건너뛰고
 * 새로운 항목만 추가됨
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
    const { id: targetVehicleId } = await params;
    const data = await request.json();

    // sourceVehicleIds: 가져올 차량 ID 배열 (예: ['g80-id', 'g70-id'])
    // importColors: 색상 가져오기 여부
    // importOptions: 옵션 가져오기 여부
    const { sourceVehicleIds, importColors = true, importOptions = true } = data;

    if (!sourceVehicleIds || !Array.isArray(sourceVehicleIds) || sourceVehicleIds.length === 0) {
      return NextResponse.json({ error: 'sourceVehicleIds is required' }, { status: 400 });
    }

    // 대상 차량 확인
    const targetVehicle = await prisma.vehicle.findUnique({
      where: { id: targetVehicleId },
      select: { id: true, name: true, brandId: true },
    });

    if (!targetVehicle) {
      return NextResponse.json({ error: 'Target vehicle not found' }, { status: 404 });
    }

    const result = {
      colors: { added: 0, skipped: 0, skippedItems: [] as string[] },
      options: { added: 0, skipped: 0, skippedItems: [] as string[] },
    };

    // 현재 차량의 색상/옵션 조회 (중복 체크용)
    const existingColors = await prisma.vehicleColor.findMany({
      where: { vehicleId: targetVehicleId },
      select: { masterColorId: true },
    });
    const existingColorIds = new Set(existingColors.map(c => c.masterColorId));

    const existingOptions = await prisma.vehicleOption.findMany({
      where: { vehicleId: targetVehicleId },
      select: { masterOptionId: true },
    });
    const existingOptionIds = new Set(existingOptions.map(o => o.masterOptionId));

    // 색상 가져오기
    if (importColors) {
      const sourceColors = await prisma.vehicleColor.findMany({
        where: { vehicleId: { in: sourceVehicleIds } },
        include: {
          masterColor: true,
          vehicle: { select: { name: true } },
        },
      });

      // 중복 제거를 위해 masterColorId로 그룹화
      const uniqueColors = new Map<string, typeof sourceColors[0]>();
      for (const color of sourceColors) {
        if (!uniqueColors.has(color.masterColorId)) {
          uniqueColors.set(color.masterColorId, color);
        }
      }

      for (const [masterColorId, color] of Array.from(uniqueColors.entries())) {
        // 이미 존재하는 색상은 건너뛰기
        if (existingColorIds.has(masterColorId)) {
          result.colors.skipped++;
          result.colors.skippedItems.push(
            `${color.masterColor.name} (${color.masterColor.type === 'EXTERIOR' ? '외장' : '내장'})`
          );
          continue;
        }

        // 같은 브랜드인지 확인
        if (color.masterColor.brandId !== targetVehicle.brandId) {
          // 다른 브랜드면 마스터 색상을 새로 만들거나 찾기
          const targetMasterColor = await prisma.masterColor.upsert({
            where: {
              brandId_type_name: {
                brandId: targetVehicle.brandId,
                type: color.masterColor.type,
                name: color.masterColor.name,
              },
            },
            create: {
              brandId: targetVehicle.brandId,
              type: color.masterColor.type,
              name: color.masterColor.name,
              hexCode: color.masterColor.hexCode,
            },
            update: {},
          });

          await prisma.vehicleColor.create({
            data: {
              vehicleId: targetVehicleId,
              masterColorId: targetMasterColor.id,
              price: color.price,
              sortOrder: color.sortOrder,
            },
          });
        } else {
          // 같은 브랜드면 바로 연결
          await prisma.vehicleColor.create({
            data: {
              vehicleId: targetVehicleId,
              masterColorId,
              price: color.price,
              sortOrder: color.sortOrder,
            },
          });
        }

        result.colors.added++;
        existingColorIds.add(masterColorId); // 중복 추가 방지
      }
    }

    // 옵션 가져오기
    if (importOptions) {
      const sourceOptions = await prisma.vehicleOption.findMany({
        where: { vehicleId: { in: sourceVehicleIds } },
        include: {
          masterOption: true,
          vehicle: { select: { name: true } },
        },
      });

      // 중복 제거를 위해 masterOptionId로 그룹화
      const uniqueOptions = new Map<string, typeof sourceOptions[0]>();
      for (const option of sourceOptions) {
        if (!uniqueOptions.has(option.masterOptionId)) {
          uniqueOptions.set(option.masterOptionId, option);
        }
      }

      for (const [masterOptionId, option] of Array.from(uniqueOptions.entries())) {
        // 이미 존재하는 옵션은 건너뛰기
        if (existingOptionIds.has(masterOptionId)) {
          result.options.skipped++;
          result.options.skippedItems.push(option.masterOption.name);
          continue;
        }

        // 같은 브랜드인지 확인
        if (option.masterOption.brandId !== targetVehicle.brandId) {
          // 다른 브랜드면 마스터 옵션을 새로 만들거나 찾기
          const targetMasterOption = await prisma.masterOption.upsert({
            where: {
              brandId_name: {
                brandId: targetVehicle.brandId,
                name: option.masterOption.name,
              },
            },
            create: {
              brandId: targetVehicle.brandId,
              name: option.masterOption.name,
              description: option.masterOption.description,
              category: option.masterOption.category,
            },
            update: {},
          });

          await prisma.vehicleOption.create({
            data: {
              vehicleId: targetVehicleId,
              masterOptionId: targetMasterOption.id,
              price: option.price,
              sortOrder: option.sortOrder,
            },
          });
        } else {
          // 같은 브랜드면 바로 연결
          await prisma.vehicleOption.create({
            data: {
              vehicleId: targetVehicleId,
              masterOptionId,
              price: option.price,
              sortOrder: option.sortOrder,
            },
          });
        }

        result.options.added++;
        existingOptionIds.add(masterOptionId); // 중복 추가 방지
      }
    }

    return NextResponse.json({
      success: true,
      message: `가져오기 완료: 색상 ${result.colors.added}개 추가 (${result.colors.skipped}개 중복), 옵션 ${result.options.added}개 추가 (${result.options.skipped}개 중복)`,
      result,
    });
  } catch (error) {
    console.error('Error importing from other vehicles:', error);
    return NextResponse.json({ error: 'Failed to import' }, { status: 500 });
  }
}
