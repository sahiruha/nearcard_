import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { WalletProvider } from '@/components/providers/WalletProvider';
import { I18nProvider } from '@/lib/i18n';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'NEAR Digital Card',
  description: 'Blockchain-based digital business card on NEAR Protocol',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A0A0C',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <I18nProvider>
          <WalletProvider>
            <div className="min-h-dvh flex flex-col">
              <Header />
              <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 pb-24">
                {children}
              </main>
              <BottomNav />
            </div>
          </WalletProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
