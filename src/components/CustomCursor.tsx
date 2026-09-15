import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const cursor = document.getElementById('customCursor');
    const follower = document.getElementById('cursorFollower');
    const mouseGlow = document.getElementById('mouseGlow');

    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;
    let glowX = 0;
    let glowY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setIsVisible(true);

      if (cursor) {
        cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.classList.contains('btn') ||
        target.classList.contains('nav-link')
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);

    // Smooth follower & glow animation loop
    let animId: number;
    const render = () => {
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;

      glowX += (mouseX - glowX) * 0.08;
      glowY += (mouseY - glowY) * 0.08;

      if (follower) {
        follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
      }
      if (mouseGlow) {
        mouseGlow.style.left = `${glowX}px`;
        mouseGlow.style.top = `${glowY}px`;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    // Scroll progress calculation
    const onScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(currentProgress);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      <div
        className={`custom-cursor ${isHovered ? 'hovered' : ''}`}
        id="customCursor"
        style={{ opacity: isVisible ? 1 : 0 }}
      />
      <div
        className={`cursor-follower ${isHovered ? 'hovered' : ''}`}
        id="cursorFollower"
        style={{ opacity: isVisible ? 1 : 0 }}
      />
      <div
        className="mouse-glow"
        id="mouseGlow"
        style={{ opacity: isVisible ? 1 : 0 }}
      />
      <div
        className="scroll-progress"
        id="scrollProgress"
        style={{ width: `${scrollProgress}%` }}
      />
    </>
  );
};
