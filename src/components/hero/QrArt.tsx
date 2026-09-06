import { HERO } from "@/content/site";

/**
 * The "this QR changes lives" sticker.
 *
 * Every piece of it is positioned in the hero plate's own 1280 x 832
 * coordinates — several in percentages of it, and eight in container query
 * units — so it can only be drawn against a box of exactly that size. That is
 * why this component is the plate's contents rather than the sticker's: re-basing
 * it onto a 321px box would mean recomputing every one of those numbers, and the
 * container query units cannot be re-based at all.
 *
 * Both layouts therefore give it a 1280 x 832 box and then say where they want
 * it seen: the collage is that size already, and the phone crops to
 * `QR_STICKER` and slides the plate under the hole.
 */

/** Where the sticker actually sits on the plate, for a caller cropping to it. */
export const QR_STICKER = { left: 986.7, top: 355.46, width: 321.748, height: 321.626 };

export default function QrArt() {
  return (
    <>
      <div className="absolute contents h-[321.626px] left-[986.7px] top-[355.46px] w-[321.748px]" data-node-id="343:1258">
        <div className="absolute flex h-[184.826px] items-center justify-center left-[1045.95px] top-[423.86px] w-[203.236px]" data-node-id="343:1259">
          <div className="flex-none rotate-[-101.48deg]">
            <div className="h-[176.349px] relative w-[152.777px]">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/group48095478.svg" />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute contents h-[189.319px] left-[1058.95px] top-[416.73px] w-[189.318px]" data-node-id="343:1266" data-name="QR Code">
        <div className="absolute contents h-[115.455px] left-[1095.87px] top-[453.66px] w-[115.494px]" data-node-id="343:1267">
          <div className="absolute flex h-[22.827px] items-center justify-center left-[1136.05px] top-[457.04px] w-[42.148px]" data-node-id="343:1268">
            <div className="flex-none rotate-[-13.3deg]">
              <p className="[word-break:break-word] font-rotonto leading-[normal] not-italic relative text-[#2849cb] text-[11.76px] whitespace-nowrap">{HERO.qr.lead}</p>
            </div>
          </div>
          <div className="absolute flex h-[74.263px] items-center justify-center left-[1179.1px] top-[468.21px] w-[30.42px]" data-node-id="343:1269">
            <div className="flex-none rotate-[76.7deg]">
              <p className="[word-break:break-word] font-rotonto leading-[normal] not-italic relative text-[#2849cb] text-[11.76px] whitespace-nowrap">{HERO.qr.follow}</p>
            </div>
          </div>
          <div className="absolute contents inset-[56.67%_6.49%_31.6%_85.88%]" data-node-id="343:1270" style={{ containerType: "size" }} data-name="QR Elements">
            <div className="absolute flex inset-[56.67%_6.49%_31.6%_85.88%] items-center justify-center" data-node-id="343:1271" style={{ containerType: "size" }}>
              <div className="flex-none h-[hypot(19.1175cqw,80.8825cqh)] rotate-[-13.3deg] w-[hypot(80.8825cqw,-19.1175cqh)]">
                <div className="relative size-full" data-name="Clip path group">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/clip-path-group.svg" />
                </div>
              </div>
            </div>
            <div className="absolute flex inset-[56.92%_6.66%_31.85%_86.05%] items-center justify-center" data-node-id="343:1275" style={{ containerType: "size" }}>
              <div className="flex-none h-[hypot(19.1172cqw,80.8823cqh)] rotate-[-13.3deg] w-[hypot(80.8828cqw,-19.1177cqh)]">
                <div className="relative size-full" data-name="Clip path group">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/clip-path-group1.svg" />
                </div>
              </div>
            </div>
            <div className="absolute flex inset-[58.47%_11.91%_38.39%_86.05%] items-center justify-center" data-node-id="343:1497" style={{ containerType: "size" }}>
              <div className="flex-none h-[hypot(19.1175cqw,80.8825cqh)] rotate-[-13.3deg] w-[hypot(80.8825cqw,-19.1175cqh)]">
                <div className="relative size-full" data-name="Clip path group">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/clip-path-group2.svg" />
                </div>
              </div>
            </div>
            <div className="absolute flex inset-[59.37%_12.49%_39.29%_86.63%] items-center justify-center" data-node-id="343:1501" style={{ containerType: "size" }}>
              <div className="flex-none h-[hypot(19.1175cqw,80.8825cqh)] rotate-[-13.3deg] w-[hypot(80.8825cqw,-19.1175cqh)]">
                <div className="relative size-full" data-name="Clip path group">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/clip-path-group3.svg" />
                </div>
              </div>
            </div>
            <div className="absolute flex inset-[56.92%_7.66%_39.93%_90.29%] items-center justify-center" data-node-id="343:1505" style={{ containerType: "size" }}>
              <div className="flex-none h-[hypot(19.1175cqw,80.8825cqh)] rotate-[-13.3deg] w-[hypot(80.8825cqw,-19.1175cqh)]">
                <div className="relative size-full" data-name="Clip path group">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/clip-path-group4.svg" />
                </div>
              </div>
            </div>
            <div className="absolute flex inset-[57.82%_8.25%_40.83%_90.88%] items-center justify-center" data-node-id="343:1509" style={{ containerType: "size" }}>
              <div className="flex-none h-[hypot(19.1175cqw,80.8825cqh)] rotate-[-13.3deg] w-[hypot(80.8825cqw,-19.1175cqh)]">
                <div className="relative size-full" data-name="Clip path group">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/clip-path-group5.svg" />
                </div>
              </div>
            </div>
            <div className="absolute flex inset-[65.01%_10.91%_31.85%_87.05%] items-center justify-center" data-node-id="343:1513" style={{ containerType: "size" }}>
              <div className="flex-none h-[hypot(19.1175cqw,80.8825cqh)] rotate-[-13.3deg] w-[hypot(80.8825cqw,-19.1175cqh)]">
                <div className="relative size-full" data-name="Clip path group">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/clip-path-group6.svg" />
                </div>
              </div>
            </div>
            <div className="absolute flex inset-[65.9%_11.49%_32.75%_87.63%] items-center justify-center" data-node-id="343:1517" style={{ containerType: "size" }}>
              <div className="flex-none h-[hypot(19.1175cqw,80.8825cqh)] rotate-[-13.3deg] w-[hypot(80.8825cqw,-19.1175cqh)]">
                <div className="relative size-full" data-name="Clip path group">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src="/figma/clip-path-group7.svg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
