export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center pt-20"
      aria-label="Hero section"
    >
      {/* Hero text overlay */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 w-full">
        {/* Subtitle badge */}
        <div className="mb-6 px-5 py-2 rounded-full glass border border-ignite-500/20">
          <span className="font-inter text-xs sm:text-sm font-medium tracking-[0.25em] uppercase text-ignite-300">
            Where Innovation Begins
          </span>
        </div>

        {/* Main title */}
        <h1 className="font-outfit font-black text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tight mb-6">
          <span className="block text-white drop-shadow-2xl">IGNITER</span>
          <span className="block text-gradient mt-1">CLUB</span>
          <span className="block text-white/60 text-2xl sm:text-3xl md:text-4xl font-light tracking-[0.3em] mt-4">
            × GMIT
          </span>
        </h1>

        {/* Tagline */}
        <p className="font-inter text-dark-300 text-base sm:text-lg md:text-xl max-w-xl leading-relaxed mb-10">
          Building tomorrow's tech leaders through hands-on innovation, hackathons, and creative collaboration.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <a href="#join" className="btn-ignite text-base">
            <span className="mr-2">🔥</span>
            Join The Club
          </a>
          <a
            href="#about"
            className="inline-flex items-center justify-center px-8 py-4 font-outfit font-semibold text-white/80 rounded-xl border border-white/10 hover:border-ignite-500/40 hover:bg-white/5 transition-all duration-300"
          >
            Learn More
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
          <span className="text-dark-400 text-xs font-inter tracking-widest uppercase">Scroll</span>
          <div className="w-5 h-8 rounded-full border-2 border-dark-500 flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-ignite-400 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
