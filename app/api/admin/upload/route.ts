import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { optimizeImage, optimizeThumbnail, optimizeImageWithSize, bufferToBase64, validateImageFile, IMAGE_SIZE_PRESETS, ImageSizePreset } from '@/lib/image';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'thumbnail' or 'image'
    const sizePreset = formData.get('sizePreset') as ImageSizePreset | null;
    const paddingStr = formData.get('padding') as string | null;
    const padding = paddingStr ? parseInt(paddingStr, 10) : 0;

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
