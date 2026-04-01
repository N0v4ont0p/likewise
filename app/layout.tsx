import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Likewise — Private Class Matcher',
  description: 'Find your mutual match privately and safely within your school class',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080810] text-white antialiased">
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-pink-500/8 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-500/8 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-rose-500/4 blur-3xl" />
        </div>
        {children}
      </body>
    </html>
  );
}
