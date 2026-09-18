/**
 * Plain, empty reverse side of the newspaper front page.
 * Clean newsprint broadsheet paper with subtle natural texture,
 * spine fold crease, and staple clinch marks along the binding edge.
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

      {/* Spine staple clinch marks on the right edge (where the wire crimps through the paper) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 flex flex-col justify-between py-[120px] pr-[3px]"
      >
        {/* Top staple clinch */}
        <div className="relative h-[46px] w-[5px] flex flex-col justify-between py-[2px]">
          <div className="h-[2.5px] w-[7px] -ml-[1px] bg-[#1a1a1a]/85 rounded-[0.5px] shadow-[0_0.5px_1px_rgba(0,0,0,0.4)]" />
          <div className="h-[36px] w-[4px] rounded-[0.5px] bg-gradient-to-r from-[#475569] via-[#cbd5e1] to-[#334155] shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
          <div className="h-[2.5px] w-[7px] -ml-[1px] bg-[#1a1a1a]/85 rounded-[0.5px] shadow-[0_0.5px_1px_rgba(0,0,0,0.4)]" />
        </div>

        {/* Bottom staple clinch */}
        <div className="relative h-[46px] w-[5px] flex flex-col justify-between py-[2px]">
          <div className="h-[2.5px] w-[7px] -ml-[1px] bg-[#1a1a1a]/85 rounded-[0.5px] shadow-[0_0.5px_1px_rgba(0,0,0,0.4)]" />
          <div className="h-[36px] w-[4px] rounded-[0.5px] bg-gradient-to-r from-[#475569] via-[#cbd5e1] to-[#334155] shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
          <div className="h-[2.5px] w-[7px] -ml-[1px] bg-[#1a1a1a]/85 rounded-[0.5px] shadow-[0_0.5px_1px_rgba(0,0,0,0.4)]" />
        </div>
      </div>
    </div>
  );
}
