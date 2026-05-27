import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/Nav';
import PageWrapper from '@/components/PageWrapper';

export const metadata: Metadata = {
  title: 'S. Ashwath · Multi-Domain AI Systems Builder',
  description: 'Enterprise technology leader who builds AI systems hands-on across e-commerce, fin-tech, insurance, and travel-tech.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <PageWrapper>
          <main style={{ position: 'relative', zIndex: 2 }}>
            {children}
          </main>
        </PageWrapper>
      </body>
    </html>
  );
}
