import HomeClient from '@/components/HomeClient';

export const metadata = {
  title: 'Jamnagar Wehvaria Memon Jamat - Together for a Better Tomorrow',
  description: 'Jamnagar Wehvaria Memon Jamat is a non-profit organization established in 1949, providing facilities to its members and strengthening community brotherhood.',
  keywords: 'Jamnagar Wehvaria Memon Jamat, community, non-profit, education, healthcare, microfinance',
  openGraph: {
    title: 'Jamnagar Wehvaria Memon Jamat',
    description: 'Together in serve for better Tomorrow - Jamnagar Wehvaria Memon Jamat',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jamnagar Wehvaria Memon Jamat',
    description: 'Together in serve for better Tomorrow',
  },
};

export default function Home() {
  return <HomeClient />;
}