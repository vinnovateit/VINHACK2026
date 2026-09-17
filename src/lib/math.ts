/**
 * Shared motion & animation math utilities.
 */

export function clamp(min: number, max: number, value: number): number {
  return value < min ? min : value > max ? max : value;
}

export function mix(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/** Easing with zero velocity at both ends (smoothstep). */
export function smooth(t: number): number {
  const c = clamp(0, 1, t);
  return c * c * (3 - 2 * c);
}

/** Quadratic ease out: 1 - (1 - t)^2 */
export function easeOutQuad(t: number): number {
  const c = 1 - t;
  return 1 - c * c;
}

/** Cubic ease in: t^3 */
export function easeIn(t: number): number {
  return t * t * t;
}

/** Symmetrical arc peak at 0.5: 4 * t * (1 - t) */
export function arc(t: number): number {
  return 4 * t * (1 - t);
}

/** `p` remapped onto [from, to] and eased with smoothstep. */
export function stage(p: number, from: number, to: number): number {
  return smooth((p - from) / (to - from));
}

/**
 * Critically damped spring simulation (smoothDamp).
 * Provides continuous velocity and acceleration without overshoot or oscillation.
 * Frame-rate independent via deltaTime.
 */
export function smoothDamp(
  current: number,
  target: number,
  velocityRef: { value: number },
  smoothTime: number,
  maxSpeed: number,
  deltaTime: number,
): number {
  smoothTime = Math.max(0.0001, smoothTime);
  const omega = 2 / smoothTime;

  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  let change = current - target;
  const originalTo = target;

  const maxChange = maxSpeed * smoothTime;
  change = clamp(-maxChange, maxChange, change);
  target = current - change;

  const temp = (velocityRef.value + omega * change) * deltaTime;
  velocityRef.value = (velocityRef.value - omega * temp) * exp;
  let output = target + (change + temp) * exp;

  if ((originalTo - current > 0) === (output > originalTo)) {
    output = originalTo;
    velocityRef.value = (output - originalTo) / deltaTime;
  }

  return output;
}
