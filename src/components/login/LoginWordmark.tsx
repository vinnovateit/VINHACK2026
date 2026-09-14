import { LOGIN_LOGO_FILL, LOGIN_LOGO_OUTLINE } from "./paths";

export default function LoginWordmark({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`relative inline-block ${className}`}>
      <svg
        viewBox="35 32 260 262"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-label="VinHack"
      >
        <path d={LOGIN_LOGO_FILL} fill="#FA1A1D" />
        <path d={LOGIN_LOGO_OUTLINE} fill="#FA1A1D" />
      </svg>
    </div>
  );
}
