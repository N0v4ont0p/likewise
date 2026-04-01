import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Likewise — Private Class Matcher',
  description: 'Find your mutual match privately and safely within your school class',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0e0e18] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
