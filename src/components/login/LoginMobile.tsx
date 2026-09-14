import Image from "next/image";
import GoogleLoginButton from "./GoogleLoginButton";
import LoginWordmark from "./LoginWordmark";

interface LoginMobileProps {
  signInAction: () => Promise<void>;
  errorMessage?: string | null;
}

export default function LoginMobile({
  signInAction,
  errorMessage,
}: LoginMobileProps) {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-black px-6 py-10 text-white select-none">
      {/* Top Header: Logo + Tagline */}
      <header className="space-y-3">
        <LoginWordmark className="w-32 h-auto" />
        <p className="font-rotonto text-sm tracking-wider text-[#868686]">
          Build. Collaborate. Ideate.
        </p>
      </header>

      {/* Hero Content: Headline + Google Button */}
      <main className="my-auto py-8">
        <h1 className="font-rotonto text-[40px] leading-[1.08] tracking-tight uppercase">
          <span className="block text-[#FC2425]">GOOD IDEAS</span>
          <span className="block text-[#FC2425]">START WITH</span>
          <span className="block">
            <span className="text-[#FC2425]">THE </span>
            <span className="text-white">RIGHT</span>
          </span>
          <span className="inline-flex items-center gap-2 text-white">
            PEOPLE
            <span className="text-[#74D4F0] text-[36px] leading-none select-none">
              *
            </span>
          </span>
        </h1>

        {/* 3D Google Login Button */}
        <div className="mt-8 w-full max-w-[360px]">
          <form action={signInAction}>
            <GoogleLoginButton className="w-full h-auto" />
          </form>

          {errorMessage && (
            <p className="mt-4 text-xs font-mono text-[#FC2425] bg-red-950/40 border border-red-800/60 rounded-lg px-3 py-2">
              {errorMessage}
            </p>
          )}
        </div>
      </main>

      {/* Bottom: Memory Box Illustration */}
      <footer className="w-full pt-4">
        <div className="relative mx-auto w-full max-w-[320px] aspect-[664/630]">
          <Image
            src="/login/memory-box.webp"
            alt="VinHack 2026 attendee memory box"
            fill
            sizes="320px"
            className="object-contain"
            priority
          />
        </div>
      </footer>
    </div>
  );
}
