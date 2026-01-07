import { z } from 'zod';

// 차량 카테고리
export const VehicleCategorySchema = z.enum(['SEDAN', 'SUV', 'TRUCK', 'VAN', 'EV', 'COMPACT', 'HATCHBACK', 'COUPE', 'CONVERTIBLE']);

// 연료 타입
export const FuelTypeSchema = z.enum(['GASOLINE', 'DIESEL', 'HYBRID', 'EV', 'LPG']);

// 색상 타입
export const ColorTypeSchema = z.enum(['EXTERIOR', 'INTERIOR']);

// 브랜드 생성/수정
export const BrandSchema = z.object({
  name: z.string().min(1, '브랜드명을 입력해주세요').max(100),
  nameKr: z.string().min(1, '한글명을 입력해주세요').max(100),
  nameEn: z.string().max(100).nullable().optional(),
  logo: z.string().nullable().optional(),
  isDomestic: z.boolean().default(true),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

// 차량 생성/수정
export const VehicleSchema = z.object({
  name: z.string().min(1, '차량명을 입력해주세요').max(200),
  brandId: z.string().min(1, '브랜드를 선택해주세요'),
  category: VehicleCategorySchema,
  fuelTypes: z.array(z.string()).default([]),
  driveTypes: z.array(z.string()).default([]),
  seatingCapacityMin: z.number().int().min(1).max(20).nullable().optional(),
  seatingCapacityMax: z.number().int().min(1).max(20).nullable().optional(),
  basePrice: z.number().int().min(0, '가격은 0 이상이어야 합니다'),
  // 보증금 0%
  rentPrice60_0: z.number().int().min(0).nullable().optional(),
  rentPrice48_0: z.number().int().min(0).nullable().optional(),
  rentPrice36_0: z.number().int().min(0).nullable().optional(),
  rentPrice24_0: z.number().int().min(0).nullable().optional(),
  // 보증금 30%
  rentPrice60_30: z.number().int().min(0).nullable().optional(),
  rentPrice48_30: z.number().int().min(0).nullable().optional(),
  rentPrice36_30: z.number().int().min(0).nullable().optional(),
  rentPrice24_30: z.number().int().min(0).nullable().optional(),
  // 보증금 40%
  rentPrice60_40: z.number().int().min(0).nullable().optional(),
  rentPrice48_40: z.number().int().min(0).nullable().optional(),
  rentPrice36_40: z.number().int().min(0).nullable().optional(),
  rentPrice24_40: z.number().int().min(0).nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  images: z.array(z.string()).default([]),
  imageSizePreset: z.string().nullable().optional(),
  imagePadding: z.number().int().min(0).max(50).nullable().optional(),
  // 모델 정보
  baseModelName: z.string().max(100).nullable().optional(),
  hasOtherModels: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

// 트림 생성/수정
export const TrimSchema = z.object({
  vehicleId: z.string().min(1),
  name: z.string().min(1, '트림명을 입력해주세요').max(100),
  description: z.string().max(500).nullable().optional(),
  price: z.number().int().min(0).default(0),
  sortOrder: z.number().int().min(0).default(0),
});

// 색상 생성/수정
export const ColorSchema = z.object({
  vehicleId: z.string().min(1),
  type: ColorTypeSchema,
  name: z.string().min(1, '색상명을 입력해주세요').max(100),
  hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '유효한 HEX 색상코드를 입력해주세요'),
  price: z.number().int().min(0).default(0),
  sortOrder: z.number().int().min(0).default(0),
});

// 옵션 생성/수정
export const OptionSchema = z.object({
  vehicleId: z.string().min(1),
  name: z.string().min(1, '옵션명을 입력해주세요').max(200),
  description: z.string().max(500).nullable().optional(),
  price: z.number().int().min(0).default(0),
  category: z.string().max(50).nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
});

// FAQ 생성/수정
export const FAQSchema = z.object({
  question: z.string().min(1, '질문을 입력해주세요').max(500),
  answer: z.string().min(1, '답변을 입력해주세요').max(2000),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

// 배너 생성/수정
export const BannerSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(200),
  image: z.string().min(1, '이미지를 업로드해주세요'),
  mobileImage: z.string().nullable().optional(),
  link: z.string().url('유효한 URL을 입력해주세요').nullable().optional().or(z.literal('')),
  description: z.string().max(500).nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

// 파트너 생성/수정
export const PartnerSchema = z.object({
  name: z.string().min(1, '제휴사명을 입력해주세요').max(100),
  logo: z.string().nullable().optional(),
  link: z.string().url('유효한 URL을 입력해주세요').nullable().optional().or(z.literal('')),
  category: z.string().max(50).nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

// 회사 정보
export const CompanyInfoSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().max(1000),
  description: z.string().max(500).nullable().optional(),
});

// 설정
export const SettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().max(1000),
});

// API 응답 헬퍼
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map(e => e.message).join(', ');
    return { success: false, error: errors };
  }
  return { success: true, data: result.data };
}

// 타입 추출
export type BrandInput = z.infer<typeof BrandSchema>;
export type VehicleInput = z.infer<typeof VehicleSchema>;
export type TrimInput = z.infer<typeof TrimSchema>;
export type ColorInput = z.infer<typeof ColorSchema>;
export type OptionInput = z.infer<typeof OptionSchema>;
export type FAQInput = z.infer<typeof FAQSchema>;
export type BannerInput = z.infer<typeof BannerSchema>;
export type PartnerInput = z.infer<typeof PartnerSchema>;
