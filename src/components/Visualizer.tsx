import React, { useEffect, useRef } from 'react';
import { pianoSynth } from '../audio/pianoSynth.ts';

interface VisualizerProps {
  isPlaying: boolean;
}

export const Visualizer: React.FC<VisualizerProps> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Deep clean black background
      ctx.fillStyle = '#0f0f0f';
      ctx.fillRect(0, 0, width, height);

      // Center reference baseline
      ctx.strokeStyle = '#222222';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      const analyser = pianoSynth.getAnalyser();
      const bufferLength = analyser ? analyser.frequencyBinCount : 128;
      const timeData = new Uint8Array(bufferLength);

      if (analyser && isPlaying) {
        analyser.getByteTimeDomainData(timeData);
      } else {
        // Subtle resting pulse
        for (let i = 0; i < bufferLength; i++) {
          timeData[i] = 128 + Math.sin(phase + i * 0.08) * 2;
        }
      }

      // Crisp monochrome signal trace
      ctx.lineWidth = 1.25;
      ctx.strokeStyle = '#f0f0f0';
      ctx.beginPath();

      const sliceWidth = width / (bufferLength - 1);
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = timeData[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      ctx.stroke();

      phase += isPlaying ? 0.04 : 0.01;
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying]);

  return (
    <div className="w-full overflow-hidden rounded border border-[#222222] bg-[#0f0f0f]">
      <canvas
        ref={canvasRef}
        className="h-16 w-full block"
      />
    </div>
  );
};
