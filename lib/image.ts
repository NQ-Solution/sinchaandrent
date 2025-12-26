import sharp from 'sharp';

// 허용되는 이미지 MIME 타입
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

// 최대 파일 크기 (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(file: File): ImageValidationResult {
  // 파일 타입 검증
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `허용되지 않는 파일 형식입니다. (허용: JPEG, PNG, GIF, WebP)`,
    };
  }

  // 파일 크기 검증
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `파일 크기가 너무 큽니다. (최대 10MB)`,
    };
  }

  return { valid: true };
}

export async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(1280, 720, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 80, progressive: true })
    .toBuffer();
}

export async function optimizeThumbnail(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(400, 300, { fit: 'cover' })
    .jpeg({ quality: 75, progressive: true })
    .toBuffer();
}

// 사이즈 프리셋 정의
export const IMAGE_SIZE_PRESETS = {
  vehicle: { width: 800, height: 500, label: '차량 이미지 (800x500)', fit: 'inside' as const },
  vehicleHD: { width: 1200, height: 750, label: '고화질 (1200x750)', fit: 'inside' as const },
  banner: { width: 1920, height: 600, label: '배너 (1920x600)', fit: 'cover' as const },
  original: { width: null, height: null, label: '원본 유지', fit: 'inside' as const },
};

export type ImageSizePreset = keyof typeof IMAGE_SIZE_PRESETS;

// 패딩 옵션 정의
export const PADDING_OPTIONS = {
  0: { label: '없음', value: 0 },
  5: { label: '5%', value: 5 },
  10: { label: '10%', value: 10 },
  15: { label: '15%', value: 15 },
  20: { label: '20%', value: 20 },
} as const;

export type PaddingPercent = keyof typeof PADDING_OPTIONS;

export async function optimizeImageWithSize(
  buffer: Buffer,
  preset: ImageSizePreset = 'vehicle',
  paddingPercent: number = 0
): Promise<Buffer> {
  const config = IMAGE_SIZE_PRESETS[preset];

  console.log('[Image] Processing with:', { preset, paddingPercent, config });

  // 먼저 메타데이터 확인
  const metadata = await sharp(buffer).metadata();

  let sharpInstance = sharp(buffer);

  // 투명 배경이 있는 경우 (PNG, WebP, GIF 등) 흰색 배경으로 변환
  if (metadata.hasAlpha) {
    sharpInstance = sharpInstance.flatten({ background: { r: 255, g: 255, b: 255 } });
  }

  // 원본 유지가 아닌 경우에만 리사이즈
  if (config.width && config.height) {
    if (paddingPercent > 0) {
      // 패딩이 있는 경우: 이미지를 작게 만들고 흰색 캔버스 중앙에 배치
      const paddingRatio = paddingPercent / 100;
      const innerWidth = Math.round(config.width * (1 - paddingRatio * 2));
      const innerHeight = Math.round(config.height * (1 - paddingRatio * 2));

      // 1단계: 이미지를 작은 크기로 리사이즈
      const resizedBuffer = await sharpInstance
        .resize(innerWidth, innerHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      // 2단계: 리사이즈된 이미지의 실제 크기 확인
      const resizedMeta = await sharp(resizedBuffer).metadata();
      const actualWidth = resizedMeta.width || innerWidth;
      const actualHeight = resizedMeta.height || innerHeight;

      // 3단계: 흰색 배경 캔버스 생성 후 이미지를 중앙에 합성
      const canvas = sharp({
        create: {
          width: config.width,
          height: config.height,
          channels: 3,
          background: { r: 255, g: 255, b: 255 },
        },
      });

      return canvas
        .composite([
          {
            input: resizedBuffer,
            left: Math.round((config.width - actualWidth) / 2),
            top: Math.round((config.height - actualHeight) / 2),
          },
        ])
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();
    } else {
      // 패딩 없음: 기존 방식으로 리사이즈
      sharpInstance = sharpInstance.resize(config.width, config.height, {
        fit: 'inside',
        withoutEnlargement: true,
        background: { r: 255, g: 255, b: 255 },
      });
    }
  }

  // 모든 이미지를 JPEG로 변환 (최적화)
  return sharpInstance
    .jpeg({ quality: 85, progressive: true })
    .toBuffer();
}

export async function bufferToBase64(buffer: Buffer, mimeType: string = 'image/jpeg'): Promise<string> {
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}
