export type SetupUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  teamCode?: string | null;
};

export type Team = {
  id: string;
  name: string;
  code: string;
  ownerEmail: string;
  members: string[];
  createdAt: string;
};

const users = new Map<string, SetupUser>();
const teams = new Map<string, Team>();

const normaliseEmail = (email: string) => email.trim().toLowerCase();

const createCode = () =>
  Math.random().toString(36).slice(2, 8).toUpperCase();

export function upsertUserFromGoogle({
  email,
  name,
  image,
}: {
  email: string;
  name?: string | null;
  image?: string | null;
}) {
  const normalisedEmail = normaliseEmail(email);
  const existing = users.get(normalisedEmail);

  if (existing) {
    const updated: SetupUser = {
      ...existing,
      name: name ?? existing.name,
      image: image ?? existing.image,
    };
    users.set(normalisedEmail, updated);
    return updated;
  }

  const record: SetupUser = {
    id: crypto.randomUUID(),
    email: normalisedEmail,
    name: name ?? normalisedEmail.split("@")[0],
    image: image ?? null,
  };

  users.set(normalisedEmail, record);
  return record;
}

export function getUserByEmail(email: string) {
  return users.get(normaliseEmail(email)) ?? null;
}

export function getTeamForUser(email: string) {
  const user = getUserByEmail(email);
  if (!user?.teamCode) return null;
  return teams.get(user.teamCode) ?? null;
}

export function createTeamForUser({
  email,
  teamName,
}: {
  email: string;
  teamName: string;
}) {
  const user = getUserByEmail(email);
  if (!user) {
    throw new Error("User is not registered.");
  }
  if (getTeamForUser(email)) {
    throw new Error("This user already belongs to a team.");
  }

  const cleanedName = teamName.trim();
  if (cleanedName.length < 3) {
    throw new Error("Team name must be at least 3 characters long.");
  }

  let code = createCode();
  while (teams.has(code)) {
    code = createCode();
  }

  const team: Team = {
    id: crypto.randomUUID(),
    name: cleanedName,
    code,
    ownerEmail: user.email,
    members: [user.email],
    createdAt: new Date().toISOString(),
  };

  teams.set(code, team);
  user.teamCode = code;

  return team;
}

export function joinTeamByCode({
  email,
  code,
}: {
  email: string;
  code: string;
}) {
  const user = getUserByEmail(email);
  if (!user) {
    throw new Error("User is not registered.");
  }
  if (getTeamForUser(email)) {
    throw new Error("This user already belongs to a team.");
  }

  const team = teams.get(code.trim().toUpperCase());
  if (!team) {
    throw new Error("Team code not found.");
  }

  if (team.members.includes(user.email)) {
    user.teamCode = team.code;
    return team;
  }

  team.members.push(user.email);
  user.teamCode = team.code;
  return team;
}

export function getTeamByCode(code: string) {
  return teams.get(code.trim().toUpperCase()) ?? null;
}

export function getUserSummary(email: string) {
  const user = getUserByEmail(email);
  const team = user?.teamCode ? getTeamByCode(user.teamCode) : null;
  return { user, team };
}
