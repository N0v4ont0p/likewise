import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mutual Match — Private Class Crush Matcher',
  description: 'Find your mutual match privately and safely',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a0f] text-white antialiased">
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-pink-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-rose-500/5 blur-3xl" />
        </div>
        {children}
      </body>
    </html>
  );
}
