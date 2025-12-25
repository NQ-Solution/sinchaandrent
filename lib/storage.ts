const STORAGE_TYPE = process.env.IMAGE_STORAGE_TYPE || 'db';

export async function uploadImage(file: File): Promise<string> {
  if (STORAGE_TYPE === 'db') {
    return uploadToDb(file);
  } else {
    return uploadToStorage(file);
  }
}

export async function deleteImage(url: string): Promise<void> {
  if (STORAGE_TYPE === 'db') {
    return;
  } else {
    return deleteFromStorage(url);
  }
}

// DB 저장 (base64)
async function uploadToDb(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const mimeType = file.type;
  return `data:${mimeType};base64,${base64}`;
}

// 외부 스토리지 저장 (확장 시)
async function uploadToStorage(_file: File): Promise<string> {
  // TODO: 가비아 스토리지 연동
  throw new Error('Storage not configured');
}

async function deleteFromStorage(_url: string): Promise<void> {
  // TODO: 외부 스토리지에서 삭제
  throw new Error('Storage not configured');
}

export function isBase64Image(url: string): boolean {
  return url.startsWith('data:image/');
}
