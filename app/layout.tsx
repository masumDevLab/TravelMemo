import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TravelMemo',
  description: 'Private, local-first travel journal and memory tracker.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
