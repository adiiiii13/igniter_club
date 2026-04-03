const INTRO_WORDMARK = 'IGNITER CLUB × GMIT';
let parallaxInitialized = false;

const initParallax = () => {
    if (parallaxInitialized) return;
    parallaxInitialized = true;

    window.addEventListener('scroll', e => {
        document.body.style.cssText += `--scrollTop: ${this.scrollY}px`;
    });

    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
    ScrollSmoother.create({
        wrapper: '.wrapper',
        content: '.content'
    });
};

const setupLandingIntro = () => {
    const introRoot = document.getElementById('landingIntro');
    const wordmarkEl = document.getElementById('landingIntroWordmark');
    const captionEl = introRoot ? introRoot.querySelector('.landing-intro__caption') : null;

    if (!introRoot || !wordmarkEl) {
        document.body.classList.remove('intro-active');
        initParallax();
        return;
    }

    document.body.classList.add('intro-active');

    const accentStart = INTRO_WORDMARK.indexOf('×');

    wordmarkEl.innerHTML = INTRO_WORDMARK
        .split('')
        .map((char, index) => {
            const isAccent = index >= accentStart;
            const isSpace = char === ' ';
            const cls = [
                'landing-intro__char',
                isAccent ? 'landing-intro__char--accent' : '',
                isSpace ? 'landing-intro__space' : ''
            ].filter(Boolean).join(' ');
            const content = char === ' ' ? '&nbsp;' : char;
            return `<span class="${cls}">${content}</span>`;
        })
        .join('');

    const chars = gsap.utils.toArray('.landing-intro__char:not(.landing-intro__space)');

    gsap.set(captionEl, { opacity: 0, y: 10, letterSpacing: '0.52em' });
    gsap.set(chars, { opacity: 0, y: 24, x: 6, filter: 'blur(3px)' });

    gsap.timeline()
        .to(
            captionEl,
            {
                opacity: 0.95,
                y: 0,
                letterSpacing: '0.45em',
                duration: 0.45,
                ease: 'power2.out'
            }
        )
        .to(
            chars,
            {
                opacity: 1,
                y: 0,
                x: 0,
                filter: 'blur(0px)',
                duration: 0.5,
                stagger: 0.038,
                ease: 'power2.out'
            },
            '-=0.08'
        )
        .to(
            chars,
            {
                opacity: 0,
                y: -22,
                filter: 'blur(3px)',
                duration: 0.35,
                stagger: { each: 0.018, from: 'end' },
                ease: 'power2.in'
            },
            '+=0.55'
        )
        .to(
            captionEl,
            {
                opacity: 0,
                y: -10,
                duration: 0.25,
                ease: 'power2.in'
            },
            '<'
        )
        .to(
            introRoot,
            {
                opacity: 0,
                duration: 0.35,
                ease: 'power2.out',
                onComplete: () => {
                    introRoot.remove();
                    document.body.classList.remove('intro-active');
                    gsap.fromTo('.wrapper', { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'power2.out' });
                    initParallax();
                }
            },
            '-=0.05'
        );
};

setupLandingIntro();