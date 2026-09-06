import { FACE } from "@/components/memories/card";
import { badgeLines, boxOf, type Sticker } from "@/components/memories/stickers";

/**
 * One sticker, drawn at `width` in whatever unit the caller is working in —
 * card units on the card, CSS pixels in the carousel. Everything inside is a
 * fraction of the piece's own drawn box, so both come out identical.
 *
 * The lettering on a badge is wrapped at the piece's *card* width in every
 * case, including the carousel, so a thumbnail breaks its lines exactly where
 * the card does and the tray is an honest picture of what you are about to add.
 *
 * `measured` is what keeps that off the server. Wrapping needs `measureText`
 * and the webfont, and neither exists while this is being prerendered — so
 * until the studio says it has both, a badge shows its copy unbroken, which is
 * the same thing the server rendered. Breaking the lines during the first
 * client render instead would be markup that disagreed with the server's and a
 * hydration error to go with it.
 */
export default function StickerArt({
  sticker,
  width,
  measured,
}: {
  sticker: Sticker;
  width: number;
  measured: boolean;
}) {
  const box = boxOf(sticker);
  const k = width / box.w;
  const height = box.h * k;
  const badge = sticker.badge;
  const tracking = badge ? (badge.tracking ?? 0) * box.w * k : 0;

  return (
    <div className="relative" style={{ width, height }}>
      {sticker.crop ? (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ borderRadius: sticker.round ? "50%" : undefined }}
        >
          <img
            alt=""
            src={sticker.src}
            draggable={false}
            className="absolute block max-w-none"
            style={{
              width: (sticker.w / sticker.crop.w) * width,
              height: (sticker.h / sticker.crop.h) * height,
              left: -(sticker.crop.x / sticker.crop.w) * width,
              top: -(sticker.crop.y / sticker.crop.h) * height,
            }}
          />
        </div>
      ) : (
        <img
          alt=""
          src={sticker.src}
          draggable={false}
          className="absolute inset-0 block size-full max-w-none"
        />
      )}
      {badge ? (
        <div
          style={{
            position: "absolute",
            left: badge.cx * width,
            top: badge.cy * height,
            width: badge.width * width,
            transform: `translate(-50%, -50%) rotate(${badge.rotate}deg)`,
            color: badge.color,
            fontFamily: FACE,
            fontSize: badge.size * box.w * k,
            lineHeight: badge.lineHeight,
            letterSpacing: tracking || undefined,
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          {(measured ? badgeLines(badge, box.w) : [...badge.lines]).map((line, i) => (
            // Letter-spacing lands after the last glyph too, which shifts a
            // centred line by half a step off where the canvas puts it. The
            // negative margin takes that trailing step back.
            <div key={i} style={{ marginRight: tracking ? -tracking : undefined }}>
              {line}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
