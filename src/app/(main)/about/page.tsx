
import AboutClient from '@/components/AboutClient';

export const metadata = {
  title: 'About Us - Jamnagar Wehvaria Memon Jamat',
  description: 'Learn about Jamnagar Wehvaria Memon Jamat, established in 1949. A non-profit organization providing education, healthcare, housing, and community support to its members.',
  keywords: 'Jamnagar Wehvaria Memon Jamat, about, community, non-profit, education, healthcare',
  openGraph: {
    title: 'About Us - Jamnagar Wehvaria Memon Jamat',
    description: 'Established in 1949, JWMJ is dedicated to fostering unity and providing comprehensive support to its members.',
    type: 'website',
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
