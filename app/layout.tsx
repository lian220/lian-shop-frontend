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
  title: "Lian Shop - 온라인 쇼핑몰",
  description: "Lian Shop - 최고의 쇼핑 경험을 제공하는 온라인 쇼핑몰",
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

