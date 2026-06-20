import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

const BASE_URL = "https://prompt-share-eight-alpha.vercel.app";

export const metadata: Metadata = {
  title: "PromptShare - AIプロンプト共有プラットフォーム",
  description: "ChatGPT・Claude・Geminiなど、みんなが使っている便利なAIプロンプトを共有・発見できるコミュニティサイト。",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: "PromptShare - AIプロンプト共有プラットフォーム",
    description: "ChatGPT・Claude・Geminiなど、みんなが使っている便利なAIプロンプトを共有・発見できるコミュニティサイト。",
    url: BASE_URL,
    siteName: "PromptShare",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "PromptShare - AIプロンプト共有プラットフォーム",
    description: "便利なAIプロンプトを共有・発見できるコミュニティサイト。",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 font-sans">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
