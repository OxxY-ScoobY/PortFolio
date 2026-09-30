import React, { useEffect, useRef } from 'react';

export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    const mouseGlow = glowRef.current;
    const progressBar = progressRef.current;

    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;
    let glowX = 0;
    let glowY = 0;
    let animId: number | null = null;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        if (cursor) cursor.style.opacity = '1';
        if (follower) follower.style.opacity = '1';
        if (mouseGlow) mouseGlow.style.opacity = '1';
      }

      // Move cursor dot instantly
      if (cursor) {
        cursor.style.transform = `translate3d(${mouseX - 5}px, ${mouseY - 5}px, 0)`;
      }

      if (animId === null) animId = requestAnimationFrame(render);
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.classList.contains('btn') ||
        target.classList.contains('nav-link');

      if (cursor) cursor.classList.toggle('hovered', !!isInteractive);
      if (follower) follower.classList.toggle('hovered', !!isInteractive);
    };

    // Animate the follower only while it is catching up to the pointer.
    const render = () => {
      followerX += (mouseX - followerX) * 0.14;
      followerY += (mouseY - followerY) * 0.14;

      glowX += (mouseX - glowX) * 0.07;
      glowY += (mouseY - glowY) * 0.07;

      if (follower) {
        follower.style.transform = `translate3d(${followerX - 18}px, ${followerY - 18}px, 0)`;
      }
      if (mouseGlow) {
        mouseGlow.style.transform = `translate3d(${glowX - 200}px, ${glowY - 200}px, 0)`;
      }

      const stillMoving =
        Math.abs(mouseX - followerX) > 0.1 ||
        Math.abs(mouseY - followerY) > 0.1 ||
        Math.abs(mouseX - glowX) > 0.1 ||
        Math.abs(mouseY - glowY) > 0.1;
      animId = stillMoving ? requestAnimationFrame(render) : null;
    };

    // Update progress only when scrolling instead of polling every frame.
    const onScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalScroll > 0 ? (window.scrollY / totalScroll) * 100 : 0;
      if (progressBar) progressBar.style.width = `${progress}%`;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('scroll', onScroll, { passive: true });

    onScroll();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('scroll', onScroll);
      if (animId !== null) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      {/* Cursor dot */}
      <div
        ref={cursorRef}
        className="custom-cursor"
        id="customCursor"
        style={{ opacity: 0 }}
      />
      {/* Follower ring */}
      <div
        ref={followerRef}
        className="cursor-follower"
        id="cursorFollower"
        style={{ opacity: 0 }}
      />
      {/* Mouse glow */}
      <div
        ref={glowRef}
        className="mouse-glow"
        id="mouseGlow"
        style={{ opacity: 0 }}
      />
      {/* Scroll progress bar — driven by RAF, no state */}
      <div
        ref={progressRef}
        className="scroll-progress"
        id="scrollProgress"
      />
    </>
  );
};
