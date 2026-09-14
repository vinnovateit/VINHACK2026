import { prisma } from "@/lib/prisma";

// Exclude ambiguous characters like 0, O, 1, I, L
const CODE_CHARS = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function generateRandomCode(length: number = 6): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * CODE_CHARS.length);
    result += CODE_CHARS[randomIndex];
  }
  return result;
}

export async function generateUniqueTeamCode(): Promise<string> {
  const maxAttempts = 15;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = `VH26-${generateRandomCode(4)}`;
    const existing = await prisma.team.findUnique({
      where: { code: candidate },
      select: { id: true },
    });
    if (!existing) {
      return candidate;
    }
  }
  // Fallback with timestamp suffix if collisions persist
  return `VH26-${generateRandomCode(2)}${Date.now().toString(36).slice(-2).toUpperCase()}`;
}
