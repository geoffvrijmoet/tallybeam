export const metadata = {
  title: {
    default: 'TallyBeam - Lightning-fast Invoice Creation',
    template: '%s | TallyBeam'
  },
  description: 'Create professional invoices in seconds with smart automation, Venmo tracking, and email magic. No signup required.',
  keywords: ['invoicing', 'billing', 'freelance', 'small business', 'venmo', 'accounting', 'invoice generator'],
  authors: [{ name: 'TallyBeam' }],
  creator: 'TallyBeam',
  publisher: 'TallyBeam',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tallybeam.com',
    title: 'TallyBeam - Lightning-fast Invoice Creation',
    description: 'Create professional invoices in seconds with smart automation, Venmo tracking, and email magic. No signup required.',
    siteName: 'TallyBeam',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TallyBeam - Lightning-fast Invoice Creation',
    description: 'Create professional invoices in seconds with smart automation, Venmo tracking, and email magic. No signup required.',
    creator: '@tallybeam',
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
    google: 'your-google-site-verification-code',
    yandex: 'your-yandex-verification-code',
  },
};
import './globals.css';
import AmplifyProvider from '../components/AmplifyProvider';
import SimpleAnimatedLayout from '../components/layout/SimpleAnimatedLayout';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-screen bg-white antialiased font-sans">
        <AmplifyProvider>
          <SimpleAnimatedLayout>
            {children}
          </SimpleAnimatedLayout>
        </AmplifyProvider>
      </body>
    </html>
  );
} 