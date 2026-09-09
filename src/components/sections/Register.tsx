import { REGISTER } from "@/content/site";
import RegisterSvg from "@/components/RegisterSvg";
import NowSvg from "@/components/NowSvg";

export default function RegisterSection() {
  return (
    <section aria-label="Register now" className="-translate-x-1/2 absolute bg-black h-[832px] left-1/2 overflow-clip top-[7592px] w-[1280px]" data-node-id="297:166" data-name="REGISTER NOW">
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-rotonto leading-[normal] left-1/2 not-italic text-[#bfea88] text-[30px] text-center top-[593px] whitespace-pre" data-node-id="297:167">
        {REGISTER.tagline[0]}
        <br aria-hidden />
        {REGISTER.tagline[1]}
      </p>
      <div className="absolute contents left-[250px] top-[168.43px]" data-node-id="297:168" data-name="register now">
        <h2 className="absolute h-[327.438px] left-[250px] top-[168.43px] w-[779.141px]" data-node-id="297:169" data-name="register">
          <RegisterSvg className="absolute block inset-0 max-w-none size-full" />
        </h2>
        <div className="absolute h-[134.04px] left-[531.96px] top-[376.87px] w-[388.209px]" data-node-id="297:177" data-name="now">
          <NowSvg className="absolute block inset-0 max-w-none size-full" />
        </div>
      </div>
    </section>
  );
}
