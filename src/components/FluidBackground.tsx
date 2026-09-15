import React, { useEffect, useRef } from 'react';

interface Pointer {
  id: number;
  texcoordX: number;
  texcoordY: number;
  prevTexcoordX: number;
  prevTexcoordY: number;
  deltaX: number;
  deltaY: number;
  down: boolean;
  moved: boolean;
  color: number[];
}

export const FluidBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pointers: Pointer[] = [
      {
        id: -1,
        texcoordX: 0,
        texcoordY: 0,
        prevTexcoordX: 0,
        prevTexcoordY: 0,
        deltaX: 0,
        deltaY: 0,
        down: false,
        moved: false,
        color: [0, 0, 0]
      }
    ];

    const params = {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false
    };

    let gl: WebGLRenderingContext | WebGL2RenderingContext | null = canvas.getContext('webgl2', params) as WebGL2RenderingContext;
    if (!gl) {
      gl = (canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params)) as WebGLRenderingContext;
    }

    if (!gl) {
      canvas.style.display = 'none';
      return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const handleMouseMove = (e: MouseEvent) => {
      if (pointers[0]) {
        pointers[0].moved = true;
        pointers[0].prevTexcoordX = pointers[0].texcoordX;
        pointers[0].prevTexcoordY = pointers[0].texcoordY;
        pointers[0].texcoordX = e.clientX / window.innerWidth;
        pointers[0].texcoordY = 1.0 - e.clientY / window.innerHeight;
        pointers[0].deltaX = pointers[0].texcoordX - pointers[0].prevTexcoordX;
        pointers[0].deltaY = pointers[0].texcoordY - pointers[0].prevTexcoordY;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      <canvas
        id="fluid-canvas"
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <div className="glow-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
    </>
  );
};
