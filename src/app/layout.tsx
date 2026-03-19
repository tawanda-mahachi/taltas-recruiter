import type { Metadata } from 'next';
import { Providers } from './providers';
import { Cormorant_Garamond, DM_Mono, DM_Sans, Roboto, Roboto_Mono, Roboto_Slab } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400','500','600','700'], style: ['normal','italic'], variable: '--font-cormorant', display: 'block' });
const dmMono    = DM_Mono({ subsets: ['latin'], weight: ['300','400','500'], variable: '--font-dm-mono', display: 'block' });
const dmSans    = DM_Sans({ subsets: ['latin'], weight: ['300','400','500'], variable: '--font-dm-sans', display: 'block' });
const roboto    = Roboto({ subsets: ['latin'], weight: ['300','400','500','700'], variable: '--font-roboto', display: 'block' });
const robotoMono = Roboto_Mono({ subsets: ['latin'], weight: ['300','400','500','700'], variable: '--font-roboto-mono', display: 'block' });
const robotoSlab = Roboto_Slab({ subsets: ['latin'], weight: ['400','700'], variable: '--font-roboto-slab', display: 'block' });

export const metadata: Metadata = {
  title: 'Taltas · Recruiter Portal',
  description: 'Recruitment Intelligence Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmMono.variable} ${dmSans.variable} ${roboto.variable} ${robotoMono.variable} ${robotoSlab.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}