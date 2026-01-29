
import { useEffect, useState } from 'react';

export const useShake = (onShake: () => void, threshold = 15) => {
  useEffect(() => {
    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;
    let lastTime = 0;

    const handleMotion = (e: DeviceMotionEvent) => {
      const current = e.accelerationIncludingGravity;
      if (!current) return;

      const { x, y, z } = current;
      const currentTime = Date.now();

      if ((currentTime - lastTime) > 100) {
        const diffTime = currentTime - lastTime;
        lastTime = currentTime;

        const speed = Math.abs((x || 0) + (y || 0) + (z || 0) - lastX - lastY - lastZ) / diffTime * 10000;

        if (speed > threshold) {
          onShake();
        }

        lastX = x || 0;
        lastY = y || 0;
        lastZ = z || 0;
      }
    };

    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('devicemotion', handleMotion);
        }
    };
  }, [onShake, threshold]);
};
