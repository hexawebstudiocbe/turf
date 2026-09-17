import { useEffect } from 'react';
import confetti from 'canvas-confetti';

const ConfettiCelebration = () => {
  useEffect(() => {
    // Fire celebratory confetti burst
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#10b981', '#22c55e', '#84cc16', '#3b82f6', '#f59e0b', '#ffffff'],
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, []);

  return null;
};

export default ConfettiCelebration;
