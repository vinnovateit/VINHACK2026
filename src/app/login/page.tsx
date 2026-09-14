import LoginPage from "@/components/login/LoginPage";

export const metadata = {
  title: "Login - VinHack 2026",
  description: "Good ideas start with the right people. Sign in to access your hackathon registration and dashboard.",
};

export default function Page() {
  return (
    <main className="h-screen bg-black overflow-hidden">
      <LoginPage />
    </main>
  );
}
