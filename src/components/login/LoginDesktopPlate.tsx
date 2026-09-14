import Image from "next/image";
import AsteriskArt from "./AsteriskArt";
import GoogleLoginButton from "./GoogleLoginButton";
import {
  LOGIN_HEADLINE_RED_PATH,
  LOGIN_HEADLINE_WHITE_PATH,
  LOGIN_LOGO_FILL,
  LOGIN_LOGO_OUTLINE,
  LOGIN_TAGLINE_PATH,
} from "./paths";

interface LoginDesktopPlateProps {
  signInAction: () => Promise<void>;
  errorMessage?: string | null;
}

export default function LoginDesktopPlate({
  signInAction,
  errorMessage,
}: LoginDesktopPlateProps) {
  return (
    <div
      className="relative mx-auto bg-black select-none overflow-hidden"
      style={{
        width: "var(--canvas-width, 1280px)",
        height: "var(--hero-height, 832px)",
      }}
    >
      {/* Right side: 3D Memory Box illustration */}
      <div
        className="absolute pointer-events-none z-0"
        style={{
          left: "450px",
          top: "44px",
          width: "830px",
          height: "788px",
        }}
      >
        <Image
          src="/login/memory-box.webp"
          alt="VinHack 2026 attendee memory box"
          width={830}
          height={788}
          className="size-full object-contain object-right-bottom"
          priority
        />
      </div>

      {/* Left side: Vector art layer (Logo, Tagline, Multi-line Headline) */}
      <svg
        viewBox="0 0 1280 832"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 size-full pointer-events-none z-10"
        aria-hidden="true"
      >
        {/* Logo Wordmark */}
        <path d={LOGIN_LOGO_FILL} fill="#FA1A1D" />
        <path d={LOGIN_LOGO_OUTLINE} fill="#FA1A1D" />

        {/* Tagline "Build. Collaborate. Ideate." */}
        <path d={LOGIN_TAGLINE_PATH} fill="#868686" />

        {/* Headline: "GOOD IDEAS / START WITH / THE " */}
        <path d={LOGIN_HEADLINE_RED_PATH} fill="#FC2425" />

        {/* Headline: "RIGHT / PEOPLE" */}
        <path d={LOGIN_HEADLINE_WHITE_PATH} fill="white" />
      </svg>

      {/* Cyan Asterisk after "PEOPLE" */}
      <div
        className="absolute pointer-events-none z-20"
        style={{
          left: "328px",
          top: "520px",
          width: "75px",
          height: "75px",
        }}
      >
        <AsteriskArt className="size-full" />
      </div>

      {/* Interactive 3D Google Login Button */}
      <div
        className="absolute z-30"
        style={{
          left: "81.66px",
          top: "622.66px",
          width: "418px",
          height: "88px",
        }}
      >
        <form action={signInAction}>
          <GoogleLoginButton className="w-full h-auto" />
        </form>

        {errorMessage && (
          <p className="mt-3 text-xs font-mono text-[#FC2425] bg-red-950/40 border border-red-800/60 rounded-lg px-3 py-1.5 max-w-[418px]">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
