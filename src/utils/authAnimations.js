import { animate, createTimeline, stagger } from 'animejs';

export function navigateWithAnimeExit(navigate, to) {
  const routeItems = Array.from(document.querySelectorAll('[data-route-item]'));
  const shellItems = Array.from(document.querySelectorAll('nav, footer'));
  const fallbackMain = Array.from(document.querySelectorAll('main'));
  const targets = routeItems.length > 0 ? [...shellItems, ...routeItems] : [...shellItems, ...fallbackMain];

  if (targets.length === 0) {
    navigate(to);
    return;
  }

  const timeline = createTimeline({ defaults: { duration: 320 } });

  timeline.add(targets, {
    opacity: [1, 0],
    translateY: [0, -24],
    filter: ['blur(0px)', 'blur(4px)'],
    delay: stagger(45, { from: 'last' }),
  });

  timeline.call(() => navigate(to));
}

export function animateAuthEntry(scopeElement) {
  if (!scopeElement) return;

  const stagedItems = scopeElement.querySelectorAll('[data-auth-enter]');

  animate(scopeElement, {
    opacity: [0, 1],
    duration: 260,
  });

  if (stagedItems.length === 0) return;

  animate(stagedItems, {
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 460,
    delay: stagger(85),
  });
}

export function animateAuthStep(scopeElement) {
  if (!scopeElement) return;

  const stagedItems = scopeElement.querySelectorAll('[data-step-enter]');
  if (stagedItems.length === 0) return;

  animate(stagedItems, {
    opacity: [0, 1],
    translateY: [16, 0],
    duration: 340,
    delay: stagger(70),
  });
}
