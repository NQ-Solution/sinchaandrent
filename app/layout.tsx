import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: "신차앤렌트 - 신차 장기렌트 전문",
  description: "합리적인 가격의 신차 장기렌트 서비스. 국산차 장기렌트 견적/상담 플랫폼",
  keywords: ["장기렌트", "신차", "렌트카", "장기렌트카", "국산차렌트"],
  openGraph: {
    title: "신차앤렌트 - 신차 장기렌트 전문",
    description: "합리적인 가격의 신차 장기렌트 서비스",
    type: "website",
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
      <body className={`${notoSansKR.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
