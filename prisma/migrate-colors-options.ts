/**
 * 기존 Color/Option 데이터를 MasterColor/MasterOption으로 마이그레이션
 * 브랜드별로 중복을 제거하고 VehicleColor/VehicleOption 연결 생성
 *
 * 실행: npx tsx prisma/migrate-colors-options.ts
 */

import { PrismaClient, ColorType } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateColorsAndOptions() {
  console.log('Starting migration...\n')

  // 1. 기존 색상 데이터 조회 (차량 정보 포함)
  const existingColors = await prisma.color.findMany({
    include: {
      vehicle: {
        select: {
          id: true,
          brandId: true,
          name: true,
        }
      }
    }
  })

  console.log(`Found ${existingColors.length} existing colors`)

  // 2. 브랜드별로 색상 그룹화 및 중복 제거
  const colorsByBrand: Map<string, Map<string, {
    type: ColorType,
    name: string,
    hexCode: string,
    vehicles: { vehicleId: string, price: number, sortOrder: number }[]
  }>> = new Map()

  for (const color of existingColors) {
    const brandId = color.vehicle.brandId
    const key = `${color.type}_${color.name.trim().toLowerCase()}`

    if (!colorsByBrand.has(brandId)) {
      colorsByBrand.set(brandId, new Map())
    }

    const brandColors = colorsByBrand.get(brandId)!

    if (!brandColors.has(key)) {
      brandColors.set(key, {
        type: color.type,
        name: color.name.trim(),
        hexCode: color.hexCode,
        vehicles: []
      })
    }

    // 차량별 정보 추가
    brandColors.get(key)!.vehicles.push({
      vehicleId: color.vehicleId,
      price: color.price,
      sortOrder: color.sortOrder
    })
  }

  // 3. MasterColor 생성 및 VehicleColor 연결
  let masterColorCount = 0
  let vehicleColorCount = 0

  for (const [brandId, colors] of Array.from(colorsByBrand.entries())) {
    console.log(`\nProcessing brand ${brandId}: ${colors.size} unique colors`)

    for (const [, colorData] of Array.from(colors.entries())) {
      // MasterColor 생성 (이미 존재하면 스킵)
      const masterColor = await prisma.masterColor.upsert({
        where: {
          brandId_type_name: {
            brandId,
            type: colorData.type,
            name: colorData.name
          }
        },
        create: {
          brandId,
          type: colorData.type,
          name: colorData.name,
          hexCode: colorData.hexCode,
        },
        update: {} // 이미 존재하면 변경 없음
      })

      masterColorCount++

      // VehicleColor 연결 생성
      for (const vehicle of colorData.vehicles) {
        await prisma.vehicleColor.upsert({
          where: {
            vehicleId_masterColorId: {
              vehicleId: vehicle.vehicleId,
              masterColorId: masterColor.id
            }
          },
          create: {
            vehicleId: vehicle.vehicleId,
            masterColorId: masterColor.id,
            price: vehicle.price,
            sortOrder: vehicle.sortOrder
          },
          update: {} // 이미 존재하면 변경 없음
        })
        vehicleColorCount++
      }
    }
  }

  console.log(`\nCreated ${masterColorCount} master colors`)
  console.log(`Created ${vehicleColorCount} vehicle-color links`)

  // 4. 기존 옵션 데이터 조회
  const existingOptions = await prisma.option.findMany({
    include: {
      vehicle: {
        select: {
          id: true,
          brandId: true,
          name: true,
        }
      }
    }
  })

  console.log(`\nFound ${existingOptions.length} existing options`)

  // 5. 브랜드별로 옵션 그룹화 및 중복 제거
  const optionsByBrand: Map<string, Map<string, {
    name: string,
    description: string | null,
    category: string | null,
    vehicles: { vehicleId: string, price: number, sortOrder: number }[]
  }>> = new Map()

  for (const option of existingOptions) {
    const brandId = option.vehicle.brandId
    const key = option.name.trim().toLowerCase()

    if (!optionsByBrand.has(brandId)) {
      optionsByBrand.set(brandId, new Map())
    }

    const brandOptions = optionsByBrand.get(brandId)!

    if (!brandOptions.has(key)) {
      brandOptions.set(key, {
        name: option.name.trim(),
        description: option.description,
        category: option.category,
        vehicles: []
      })
    }

    brandOptions.get(key)!.vehicles.push({
      vehicleId: option.vehicleId,
      price: option.price,
      sortOrder: option.sortOrder
    })
  }

  // 6. MasterOption 생성 및 VehicleOption 연결
  let masterOptionCount = 0
  let vehicleOptionCount = 0

  for (const [brandId, options] of Array.from(optionsByBrand.entries())) {
    console.log(`\nProcessing brand ${brandId}: ${options.size} unique options`)

    for (const [, optionData] of Array.from(options.entries())) {
      const masterOption = await prisma.masterOption.upsert({
        where: {
          brandId_name: {
            brandId,
            name: optionData.name
          }
        },
        create: {
          brandId,
          name: optionData.name,
          description: optionData.description,
          category: optionData.category,
        },
        update: {}
      })

      masterOptionCount++

      for (const vehicle of optionData.vehicles) {
        await prisma.vehicleOption.upsert({
          where: {
            vehicleId_masterOptionId: {
              vehicleId: vehicle.vehicleId,
              masterOptionId: masterOption.id
            }
          },
          create: {
            vehicleId: vehicle.vehicleId,
            masterOptionId: masterOption.id,
            price: vehicle.price,
            sortOrder: vehicle.sortOrder
          },
          update: {}
        })
        vehicleOptionCount++
      }
    }
  }

  console.log(`\nCreated ${masterOptionCount} master options`)
  console.log(`Created ${vehicleOptionCount} vehicle-option links`)

  // 7. 결과 요약
  console.log('\n=== Migration Summary ===')
  console.log(`Original colors: ${existingColors.length}`)
  console.log(`Master colors (deduplicated): ${await prisma.masterColor.count()}`)
  console.log(`Vehicle-color links: ${await prisma.vehicleColor.count()}`)
  console.log(`\nOriginal options: ${existingOptions.length}`)
  console.log(`Master options (deduplicated): ${await prisma.masterOption.count()}`)
  console.log(`Vehicle-option links: ${await prisma.vehicleOption.count()}`)

  console.log('\nMigration completed successfully!')
}

migrateColorsAndOptions()
  .catch((e) => {
    console.error('Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
