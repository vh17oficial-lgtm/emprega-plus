import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import SocialProofToast from '../components/common/SocialProofToast';
import MobileBottomNav from '../components/user/MobileBottomNav';
import HeroSection from '../components/landing/HeroSection';
import BrandMarquee from '../components/landing/BrandMarquee';
import HowItWorks from '../components/landing/HowItWorks';
import Benefits from '../components/landing/Benefits';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import MediaShowcase from '../components/landing/MediaShowcase';
import FeaturedJobs from '../components/landing/FeaturedJobs';
import CTASection from '../components/landing/CTASection';
import UserReviews from '../components/landing/UserReviews';
import { useAppContext } from '../context/AppContext';

export default function LandingPage() {
  const { siteConfig } = useAppContext();
  const s = siteConfig.sections || {};
  const show = (key) => s[key] !== false;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">
        {show('hero') && <HeroSection />}
        {show('partners') && <BrandMarquee />}
        {show('howItWorks') && <HowItWorks />}
        {show('features') && <Benefits />}
        {show('testimonials') && <TestimonialsSection />}
        {show('videos') && <MediaShowcase />}
        <FeaturedJobs />
        {show('cta') && <CTASection />}
        {show('reviews') && <UserReviews />}
      </main>
      <div className="hidden lg:block">
        <Footer />
      </div>
      <SocialProofToast />
      <MobileBottomNav />
    </div>
  );
}
