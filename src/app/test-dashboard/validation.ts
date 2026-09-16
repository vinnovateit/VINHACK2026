import { TRACK_OPTIONS } from "./constants";

const TEAM_CODE_PATTERN = /^VH26-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$/;

export function isValidTrack(value: string): boolean {
  return TRACK_OPTIONS.includes(value);
}

export function isWithinMaxLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength;
}

export function isValidTeamCode(value: string): boolean {
  return TEAM_CODE_PATTERN.test(value);
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateOptionalHttpUrl(value: string): boolean {
  return value === "" || isValidHttpUrl(value);
}
