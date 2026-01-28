import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
// import Script from "next/script"; // 구글 애널리틱스 활성화 시 주석 해제
import "./globals.css";
import { Providers } from "@/lib/providers";
import { DeploymentChecker } from "@/components/DeploymentChecker";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: "신차앤렌트 - 천안 신차 장기렌트 전문",
  description: "천안 지역 신차 장기렌트 전문. 합리적인 가격의 장기렌트 견적/상담 플랫폼",
  keywords: [
    "천안장기렌트",
    "천안신차장기렌트",
    "천안렌트카",
    "천안자동차렌트",
    "아산장기렌트",
    "충남장기렌트",
    "장기렌트",
    "신차장기렌트",
    "법인장기렌트",
    "개인장기렌트",
  ],
  openGraph: {
    title: "신차앤렌트 - 천안 신차 장기렌트 전문",
    description: "천안 지역 신차 장기렌트 전문. 합리적인 가격의 장기렌트 견적/상담 플랫폼",
    type: "website",
    locale: "ko_KR",
    siteName: "신차앤렌트",
  },
  // 파비콘 설정 (네이버/구글 검색 최적화)
  // 우선순위: shortcut icon > icon > apple-touch-icon
  icons: {
    // 기본 아이콘 (여러 크기 지원)
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    // 단축 아이콘 (레거시 브라우저 지원)
    shortcut: '/favicon.ico',
    // Apple 터치 아이콘
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  // 추가 메타데이터
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* ===== 네이버 서치 어드바이저 사이트 인증 메타 태그 ===== */}
        {/* <meta name="naver-site-verification" content="여기에_인증코드_입력" /> */}

        {/* ===== 구글 서치 콘솔 사이트 인증 메타 태그 ===== */}
        {/* <meta name="google-site-verification" content="여기에_인증코드_입력" /> */}

        {/* ===== 파비콘 (네이버/구글 검색 최적화) ===== */}
        {/* 절대 경로로 명시적 선언 - 네이버 로봇 수집 최적화 */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>

      {/* ===== 구글 애널리틱스 (GA4) ===== */}
      {/*
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-XXXXXXXXXX');
        `}
      </Script>
      */}

      <body className={`${notoSansKR.variable} font-sans antialiased`}>
        <DeploymentChecker />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
