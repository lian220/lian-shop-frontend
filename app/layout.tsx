import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "./components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // 폰트 로딩 최적화
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // 폰트 로딩 최적화
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://lian-shop.com'),
  title: {
    default: "Lian Shop - 프리미엄 온라인 쇼핑몰",
    template: "%s | Lian Shop",
  },
  description: "미니멀하고 모던한 라이프스타일 제품을 만나보세요. Lian Shop에서 프리미엄 상품을 최고의 가격으로 제공합니다.",
  keywords: ["온라인쇼핑", "쇼핑몰", "프리미엄", "패션", "라이프스타일", "Lian Shop"],
  authors: [{ name: "Lian Shop" }],
  creator: "Lian Shop",
  publisher: "Lian Shop",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Lian Shop - 프리미엄 온라인 쇼핑몰",
    description: "미니멀하고 모던한 라이프스타일 제품을 만나보세요",
    url: "/",
    siteName: "Lian Shop",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Lian Shop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lian Shop - 프리미엄 온라인 쇼핑몰",
    description: "미니멀하고 모던한 라이프스타일 제품을 만나보세요",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code-here', // Google Search Console에서 받은 코드로 교체
    // naver: 'naver-site-verification-code-here', // 네이버 서치어드바이저에서 받은 코드로 교체
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        <main className="min-h-screen">{children}</main>
        <footer className="border-t border-zinc-100 dark:border-zinc-900 py-12">
          <div className="container mx-auto px-4 text-center text-xs text-zinc-500">
            <p>&copy; 2024 LIAN SHOP. ALL RIGHTS RESERVED.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

