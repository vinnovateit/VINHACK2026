export const dashboardStats = [
  { label: "Registered hackers", value: "1,248", change: "+18.4%", tone: "green" },
  { label: "Teams formed", value: "312", change: "+12.1%", tone: "blue" },
  { label: "Projects submitted", value: "186", change: "+9.8%", tone: "red" },
  { label: "Mentor hours booked", value: "438", change: "+24.6%", tone: "lavender" },
] as const;

export const registrationTrend = [62, 74, 68, 86, 80, 96, 91, 112, 108, 124, 118, 140];

export const trendLabels = ["Apr 01", "Apr 08", "Apr 15", "Apr 22", "Apr 29", "May 06"];

export const recentTeams = [
  { name: "The Debuggers", members: 4, track: "Open Innovation", status: "Ready", color: "blue" },
  { name: "Ctrl Alt Elite", members: 3, track: "Social Impact", status: "Review", color: "red" },
  { name: "Byte Me", members: 2, track: "Open Innovation", status: "Ready", color: "green" },
  { name: "404 Found", members: 4, track: "Sustainability", status: "Pending", color: "lavender" },
] as const;

export const activity = [
  { title: "New registration", detail: "Aarav Menon joined VinHack 2026", time: "8 min ago", color: "green" },
  { title: "Team submitted", detail: "The Debuggers submitted a project", time: "24 min ago", color: "blue" },
  { title: "Mentor slot booked", detail: "Priya Nair opened a design review", time: "1 hr ago", color: "red" },
] as const;