import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Cocktail Showcase',
  description: 'Discover cocktails you can make with your ingredients',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Cocktails',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ height: '100%', backgroundColor: '#000' }}>
      <body style={{
        margin: 0,
        padding: 0,
        minHeight: '100%',
        minHeight: '-webkit-fill-available',
        height: '100%',
        backgroundColor: '#000',
        overflow: 'hidden',
      }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
