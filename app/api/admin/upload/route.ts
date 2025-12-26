import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { optimizeImage, optimizeThumbnail, optimizeImageWithSize, bufferToBase64, validateImageFile, IMAGE_SIZE_PRESETS, ImageSizePreset } from '@/lib/image';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const contentType = request.headers.get('content-type') || '';

    // JSON 요청인 경우 (기존 이미지 재처리)
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { imageUrl, sizePreset, padding } = body;

      if (!imageUrl || !imageUrl.startsWith('data:image')) {
        return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 });
      }

      console.log('[Reprocess] Settings:', { sizePreset, padding });

      // base64 디코딩
      const base64Data = imageUrl.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');

      let optimizedBuffer: Buffer;
      if (sizePreset && sizePreset in IMAGE_SIZE_PRESETS) {
        optimizedBuffer = await optimizeImageWithSize(buffer, sizePreset as ImageSizePreset, padding || 0);
      } else {
        optimizedBuffer = await optimizeImage(buffer);
      }

      const base64Url = await bufferToBase64(optimizedBuffer);
      return NextResponse.json({ url: base64Url });
    }

    // FormData 요청인 경우 (새 파일 업로드)
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'thumbnail' or 'image'
    const sizePreset = formData.get('sizePreset') as ImageSizePreset | null;
    const paddingStr = formData.get('padding') as string | null;
    const padding = paddingStr ? parseInt(paddingStr, 10) : 0;

    console.log('[Upload] Settings:', { type, sizePreset, padding });

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 파일 타입 및 크기 검증
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let optimizedBuffer: Buffer;
    if (type === 'thumbnail') {
      optimizedBuffer = await optimizeThumbnail(buffer);
    } else if (sizePreset && sizePreset in IMAGE_SIZE_PRESETS) {
      // 사이즈 프리셋이 지정된 경우 (패딩 포함)
      optimizedBuffer = await optimizeImageWithSize(buffer, sizePreset, padding);
    } else {
      optimizedBuffer = await optimizeImage(buffer);
    }

    const base64Url = await bufferToBase64(optimizedBuffer);

    return NextResponse.json({ url: base64Url });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
