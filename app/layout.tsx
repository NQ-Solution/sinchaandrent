import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/lib/providers";

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
  icons: {
    icon: { url: '/favicon.svg', type: 'image/svg+xml' },
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
