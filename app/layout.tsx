import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css'; // Global styles
import { AppProvider } from '../lib/AppContext';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#132257',
};

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eliterasi.manu01banyuputih.sch.id';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'E-Literasi MA NU 01 Banyuputih',
    template: '%s | E-Literasi MA NU 01 Banyuputih',
  },
  description: 'Aplikasi literasi digital terintegrasi untuk siswa, guru, dan admin di MA NU 01 Banyuputih. Kelola aktivitas literasi, catat tulisan harian, resensi buku, cerpen, puisi, dan laporan pengamatan secara terstruktur.',
  icons: {
    icon: '/eliterasi.png',
    shortcut: '/eliterasi.png',
    apple: '/eliterasi.png',
  },
  openGraph: {
    title: 'E-Literasi MA NU 01 Banyuputih',
    description: 'Aplikasi literasi digital terintegrasi untuk siswa, guru, dan admin di MA NU 01 Banyuputih.',
    url: '/',
    siteName: 'E-Literasi MA NU 01 Banyuputih',
    images: [
      {
        url: '/eliterasi_branding.png',
        width: 1200,
        height: 630,
        alt: 'E-Literasi MA NU 01 Banyuputih',
      },
      {
        url: '/eliterasi.png',
        width: 512,
        height: 512,
        alt: 'Logo E-Literasi MA NU 01 Banyuputih',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'E-Literasi MA NU 01 Banyuputih',
    description: 'Aplikasi literasi digital terintegrasi untuk siswa, guru, dan admin di MA NU 01 Banyuputih.',
    images: ['/eliterasi_branding.png'],
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id">
      <body className={`${jakarta.variable} ${jakarta.className} font-sans antialiased bg-slate-50 text-slate-900 min-h-screen selection:bg-[#111c44] selection:text-white`} suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for (var r of registrations) { r.unregister(); }
                });
              }
            `,
          }}
        />
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}

