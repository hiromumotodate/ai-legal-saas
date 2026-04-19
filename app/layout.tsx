import type { Metadata } from 'next';
import { Inter, Noto_Sans_JP } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const notoJp = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-jp',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Legal AI — 弁護士のためのAIプラットフォーム',
  description: '訴訟・証拠分析・書面作成・判例検索をAIで加速。弁護士の業務効率を10倍にするSaaS。',
  openGraph: {
    title: 'Legal AI',
    description: '弁護士のためのAIプラットフォーム',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${inter.variable} ${notoJp.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
