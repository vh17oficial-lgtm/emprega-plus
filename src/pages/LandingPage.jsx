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

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">
        <HeroSection />
        <BrandMarquee />
        <HowItWorks />
        <Benefits />
        <TestimonialsSection />
        <MediaShowcase />
        <FeaturedJobs />
        <CTASection />
        <UserReviews />
      </main>
      <div className="hidden lg:block">
        <Footer />
      </div>
      <SocialProofToast />
      <MobileBottomNav />
    </div>
  );
}
