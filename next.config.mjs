/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
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
    },
  },
};

export default nextConfig;
