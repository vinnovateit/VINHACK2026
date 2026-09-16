import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

// The onboarding screen shows a team's code (and its QR) before the team is saved. The server
// signs that preview code for the participant it was issued to, so createTeamAction only accepts a
// code the server generated rather than any code the browser chooses to send.

function sign(participantId: string, code: string, secret: string): Buffer {
  return createHmac("sha256", secret).update(`team-code:v1:${participantId}:${code}`).digest();
}

export function signTeamCode(participantId: string, code: string): string | null {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  return sign(participantId, code, secret).toString("base64url");
}

export function verifyTeamCodeToken(participantId: string, code: string, token: unknown): boolean {
  const secret = process.env.AUTH_SECRET;
  if (!secret || typeof token !== "string") return false;
  const expected = sign(participantId, code, secret);
  const given = Buffer.from(token, "base64url");
  return given.length === expected.length && timingSafeEqual(given, expected);
}
