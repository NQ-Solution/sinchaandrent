/** @type {import('next').NextConfig} */

// 배포 ID 생성 (빌드 시점 타임스탬프)
const deploymentId = process.env.DEPLOYMENT_ID || Date.now().toString();

const nextConfig = {
  output: 'standalone',

  // 배포 ID를 환경변수로 주입 (캐시 무효화용)
  env: {
    NEXT_PUBLIC_DEPLOYMENT_ID: deploymentId,
  },

  // 캐시 헤더 설정 - 배포 후 캐시 불일치 방지
  headers: async () => [
    {
      // 모든 페이지에 배포 ID 헤더 추가
      source: '/:path*',
      headers: [
        {
          key: 'x-deployment-id',
          value: deploymentId,
        },
      ],
    },
    {
      // HTML 페이지는 캐시하지 않음 (항상 최신 버전)
      source: '/:path((?!_next|api).*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-cache, no-store, must-revalidate',
        },
      ],
    },
    {
      // API 라우트도 캐시하지 않음
      source: '/api/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-cache, no-store, must-revalidate',
        },
      ],
    },
    {
      // 정적 자산은 배포 ID 기반 캐싱 (1년, immutable)
      source: '/_next/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
  // standalone 빌드에 data 폴더 포함 (로컬 DB 모드용)
  outputFileTracingIncludes: {
    '/*': ['./data/**/*'],
  },
  images: {
    remotePatterns: [
      // 자체 도메인
      {
        protocol: 'https',
        hostname: 'sincharent.com',
      },
      {
        protocol: 'https',
        hostname: '*.sincharent.com',
      },
      // 개발용 ngrok
      {
        protocol: 'https',
        hostname: '*.ngrok-free.app',
      },
      // 자동차 제조사 공식 이미지 (필요시)
      {
        protocol: 'https',
        hostname: '*.hyundai.com',
      },
      {
        protocol: 'https',
        hostname: '*.kia.com',
      },
      {
        protocol: 'https',
        hostname: '*.genesis.com',
      },
    ],
    // 파비콘 등 내부 SVG 허용 (외부 호스트 제한으로 보안 유지)
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  allowedDevOrigins: ['*.ngrok-free.app'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.ngrok-free.app'],
      bodySizeLimit: '50mb', // 대용량 PDF 업로드 지원
    },
  },
};

export default nextConfig;
