import gsap from "gsap";

/**
 * Makes a cursor arrow follow the pointer position with a natural lag
 * and rotate to point directly towards the pointer.
 */
export function wireCursorFollower(
  target: HTMLElement,
  options?: {
    maxOffset?: number;
    lag?: number;
    baseAngle?: number;
  },
): () => void {
  const maxOffset = options?.maxOffset ?? 45;
  const duration = options?.lag ?? 0.6;
  const baseAngle = options?.baseAngle ?? 135;

  let currentRotation = 0;

  const onPointerMove = (e: MouseEvent | PointerEvent) => {
    const rect = target.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);

    if (dist < 4) return;

    // Smooth proportional offset clamped to maxOffset
    const factor = Math.min(1, dist / 350);
    const targetX = (dx / (dist || 1)) * maxOffset * factor;
    const targetY = (dy / (dist || 1)) * maxOffset * factor;

    // Calculate angle in degrees
    const angleRad = Math.atan2(dy, dx);
    const targetAngle = (angleRad * 180) / Math.PI - baseAngle;

    // Calculate shortest rotational delta
    let diff = (targetAngle - currentRotation) % 360;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    currentRotation += diff;

    gsap.to(target, {
      x: targetX,
      y: targetY,
      rotation: currentRotation,
      duration,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });

  return () => {
    window.removeEventListener("pointermove", onPointerMove);
    gsap.killTweensOf(target);
  };
}
