import './globals.css';

export const metadata = {
  title: {
    default: 'RABHTA — Women\'s Western Fashion',
    template: '%s | Rabhta',
  },
  description: 'Discover the finest women\'s western clothing. Elegant dresses, tops, co-ord sets, and more — crafted for the modern woman.',
  keywords: ['women fashion', 'western clothing', 'dresses', 'tops', 'co-ord sets', 'rabhta'],
  openGraph: {
    title: 'RABHTA — Women\'s Western Fashion',
    description: 'Discover the finest women\'s western clothing.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
