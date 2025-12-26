import { useEffect, useRef, RefObject } from 'react';

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Custom hook for scroll reveal animations using IntersectionObserver
 * Based on the portfolio's scroll animation pattern
 */
export const useScrollReveal = <T extends HTMLElement>(
  options: ScrollRevealOptions = {}
): RefObject<T> => {
  const elementRef = useRef<T>(null);

  const {
    threshold = 0.1,
    rootMargin = '0px 0px -100px 0px',
    triggerOnce = true,
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Set initial state
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';

    // Create observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('style', `
              opacity: 1;
              transform: translateY(0);
              transition: opacity 0.6s ease-out, transform 0.6s ease-out;
            `);

            // Unobserve if triggerOnce is true
            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          } else if (!triggerOnce) {
            // Reset animation if triggerOnce is false
            entry.target.setAttribute('style', `
              opacity: 0;
              transform: translateY(20px);
              transition: opacity 0.6s ease-out, transform 0.6s ease-out;
            `);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    // Cleanup
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, triggerOnce]);

  return elementRef;
};
