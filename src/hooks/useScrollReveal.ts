import { useEffect } from 'react';

export const useScrollReveal = () => {
  useEffect(() => {
    const scrollRevealItems = document.querySelectorAll('.scroll-reveal, .scroll-reveal-item');

    if (!('IntersectionObserver' in window)) {
      scrollRevealItems.forEach((item) => item.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -20px 0px'
      }
    );

    scrollRevealItems.forEach((item) => observer.observe(item));

    return () => {
      scrollRevealItems.forEach((item) => observer.unobserve(item));
    };
  }, []);
};
