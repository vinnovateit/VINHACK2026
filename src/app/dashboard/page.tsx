import DashboardShell from "@/components/dashboard/DashboardShell";
import "./dashboard.css";

export const metadata = {
  title: "Dashboard | VinHack 2026",
  description: "VinHack 2026 event operations dashboard.",
};

export default function DashboardPage() {
  return <DashboardShell />;
}