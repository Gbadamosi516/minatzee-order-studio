import confetti from 'canvas-confetti';

/**
 * Triggers a tasteful, luxurious celebration in Minatzee brand colors
 */
export function triggerCelebration(): void {
  const brandColors = ['#9A3442', '#FFB7B1', '#FFFFFF'];

  // Left burst
  confetti({
    particleCount: 40,
    angle: 60,
    spread: 55,
    origin: { x: 0.2, y: 0.7 },
    colors: brandColors,
    ticks: 200,
    gravity: 1.1,
    scalar: 0.9,
    disableForReducedMotion: true,
  });

  // Right burst
  confetti({
    particleCount: 40,
    angle: 120,
    spread: 55,
    origin: { x: 0.8, y: 0.7 },
    colors: brandColors,
    ticks: 200,
    gravity: 1.1,
    scalar: 0.9,
    disableForReducedMotion: true,
  });
}
