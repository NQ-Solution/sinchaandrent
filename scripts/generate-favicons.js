/**
 * 파비콘 생성 스크립트
 * logo.png를 기반으로 다양한 크기의 파비콘을 생성합니다.
 *
 * 실행: node scripts/generate-favicons.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, '..', 'public');
const sourceImage = path.join(publicDir, 'logo.png');

async function generateFavicons() {
  console.log('파비콘 생성 시작...\n');

  // 원본 이미지 확인
  if (!fs.existsSync(sourceImage)) {
    console.error('Error: logo.png 파일을 찾을 수 없습니다.');
    process.exit(1);
  }

  try {
    // 원본 이미지 로드
    const image = sharp(sourceImage);
    const metadata = await image.metadata();
    console.log(`원본 이미지: ${metadata.width}x${metadata.height}`);

    // 정사각형으로 크롭 (중앙 기준)
    const size = Math.min(metadata.width, metadata.height);
    const left = Math.floor((metadata.width - size) / 2);
    const top = Math.floor((metadata.height - size) / 2);

    // 배경색을 흰색으로 설정하여 정사각형 파비콘 생성
    const squareImage = sharp(sourceImage)
      .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .flatten({ background: { r: 255, g: 255, b: 255 } });

    // 다양한 크기의 파비콘 생성
    const sizes = [
      { name: 'favicon-16x16.png', size: 16 },
      { name: 'favicon-32x32.png', size: 32 },
      { name: 'favicon-48x48.png', size: 48 },
      { name: 'apple-touch-icon.png', size: 180 },
      { name: 'favicon-192x192.png', size: 192 },
      { name: 'favicon-512x512.png', size: 512 },
    ];

    for (const { name, size } of sizes) {
      await sharp(sourceImage)
        .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .png()
        .toFile(path.join(publicDir, name));

      console.log(`  생성됨: ${name} (${size}x${size})`);
    }

    // favicon.ico 생성 (16x16, 32x32 포함)
    // ICO 형식은 sharp에서 직접 지원하지 않으므로 가장 작은 PNG로 대체
    // 실제 ICO 파일은 별도 도구가 필요하지만, 많은 브라우저가 PNG도 지원합니다
    await sharp(sourceImage)
      .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .png()
      .toFile(path.join(publicDir, 'favicon.ico'));

    console.log('  생성됨: favicon.ico (32x32 PNG 형식)');

    console.log('\n파비콘 생성 완료!');
    console.log('\n생성된 파일들:');
    console.log('  - favicon-16x16.png (브라우저 탭)');
    console.log('  - favicon-32x32.png (브라우저 탭)');
    console.log('  - favicon-48x48.png (네이버 검색 결과)');
    console.log('  - apple-touch-icon.png (iOS 홈 화면)');
    console.log('  - favicon-192x192.png (Android 홈 화면)');
    console.log('  - favicon-512x512.png (PWA)');
    console.log('  - favicon.ico (레거시 브라우저)');

  } catch (error) {
    console.error('파비콘 생성 중 오류 발생:', error);
    process.exit(1);
  }
}

generateFavicons();
