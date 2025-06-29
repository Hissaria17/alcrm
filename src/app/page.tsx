import Navigation from '@/module/landingpage/components/navigation';
import HeroSection from '@/module/landingpage/components/hero-section';
import FeaturesSection from '@/module/landingpage/components/features-section';
import TestimonialsSection from '@/module/landingpage/components/testimonials-section';
import CTASection from '@/module/landingpage/components/cta-section';
import Footer from '@/module/landingpage/components/footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
}