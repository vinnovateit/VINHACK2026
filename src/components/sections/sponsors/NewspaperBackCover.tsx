/**
 * Plain, empty reverse side of the newspaper front page.
 * Clean newsprint broadsheet paper with subtle natural texture
 * and spine fold crease along the binding edge.
 */
export default function NewspaperBackCover() {
  return (
    <div className="absolute inset-0 select-none bg-[#ebebe9] overflow-hidden">
      {/* Subtle paper grain / warm newsprint illumination */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.45)_0%,rgba(0,0,0,0.02)_100%)]"
      />

      {/* Inner spine crease shadow on the right (hinge side when flipped 180deg) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-[52px] bg-[linear-gradient(270deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.12)_45%,rgba(0,0,0,0)_100%)]"
      />
    </div>
  );
}
