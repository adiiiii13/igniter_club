import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import EventsSection from '../components/EventsSection';
import JoinSection from '../components/JoinSection';
import BackgroundScrubber from '../components/BackgroundScrubber';

export default function LandingPage() {
  return (
    <>
      <BackgroundScrubber />
      
      {/* Subtle noise overlay for premium texture */}
      <div className="noise-overlay" />

      {/* Main content */}
      <main className="relative z-10">
        <HeroSection />
        <AboutSection />

        {/* Subtle separator */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-ignite-500/20 to-transparent" />
        </div>

        <EventsSection />

        {/* Subtle separator */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-ignite-500/20 to-transparent" />
        </div>

        <JoinSection />
      </main>
    </>
  );
}
