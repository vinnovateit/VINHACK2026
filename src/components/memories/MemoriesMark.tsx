"use client";

import { useId, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { MEMORIES } from "@/content/site";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

/**
 * The title of `/memories`, drawn the way "register now" is on the home page:
 * a pen-drawn centreline revealed along its length. "memories" is one
 * continuous cursive stroke in the green hand, the i dotted after; the "@"
 * follows in the same pen, and then the VinHack mark is written in red,
 * tucked under the right half the way "now" sits under "register".
 *
 * The cursive is not traced by hand like "register" is. It is set in Hershey
 * Script, the classic single-line plotter face, from Inkscape's Hershey Text
 * set: laid out, the pen-lifts the plotter takes between the arches of an m
 * bridged, and the polylines smoothed, all offline. The numbers below are that
 * output, in a 1278 × 432 box with a 24-unit pen — except the "@", which is
 * written larger and finer than the face sets it, for the reason `AT_PLACE`
 * gives.
 *
 * The wordmark is `public/figma/logo-red.svg` verbatim, scaled and placed to
 * sit on the "@". It is a filled shape, so it cannot be traced the way a
 * stroke can. Instead it is written with a brush: a route through its letters,
 * traced by hand off the drawing, is the mask the fill shows through, and that
 * route draws on like every other stroke here — so the V goes down and up, and
 * "inhack" appears in one movement, the way the mark was lettered.
 */

interface MemoriesMarkProps {
  className?: string;
}

const GREEN = "#bfea88";
const RED = "#fa1a1d";
const PEN = 24;
const VIEW = { w: 1278, h: 432 };

/**
 * The "@", written larger than the face sets it.
 *
 * Two things were wrong with it, and only one of them was size. Hershey's "@"
 * is set as *four* movements, not two: the bowl and the ring are each written
 * twice, a second line seven units inside the first. That is how the Hershey
 * sets add weight — the plotter has one nib, so a heavier stroke is two passes
 * — and it is why the glyph appeared to write itself and then write itself
 * again. Under a 19-unit pen the two passes were not two lines at all, they
 * were one smear with the counters filled in.
 *
 * So the doubling goes and the weight comes back from the pen instead, which is
 * what a person with a real nib would have done in the first place. `AT` is the
 * two movements that are actually the glyph — the bowl of the a, then its stem
 * carrying on into the outer ring — written near the weight of the cursive
 * beside it rather than at the thin 19 the doubled version had to be cut to.
 *
 * The size and the placing stay exactly as they were. Measured: at the face's
 * own scale the bowl and the ring pass within 29.6 units of each other,
 * centreline to centreline, which a 24-unit pen all but closes on its own —
 * written at 1.28 that becomes 37.9, and a 22 pen leaves nearly sixteen units
 * of white in the counter. That is the whole calculation, and it is why both
 * numbers are what they are.
 *
 * Written as a transform rather than as new path data so the glyph stays the
 * face's — the numbers in `AT` are still Hershey's, and this is only where and
 * how big they are drawn. `pen` is the width on the page: the group divides it
 * back out, because a stroke inside a scaled group is scaled too.
 */
const AT_PLACE = {
  scale: 1.28,
  pen: 22,
  /** The centre of the glyph as the face draws it. */
  centre: { x: 523, y: 279.5 },
  dx: -12,
  dy: 26,
};

const AT_TRANSFORM = `translate(${(
  AT_PLACE.centre.x * (1 - AT_PLACE.scale) +
  AT_PLACE.dx
).toFixed(2)} ${(AT_PLACE.centre.y * (1 - AT_PLACE.scale) + AT_PLACE.dy).toFixed(
  2,
)}) scale(${AT_PLACE.scale})`;

/** Units of stroke per second. The whole title lands in about three seconds,
 *  which is what "register now" takes. */
const SPEED = 2000;

/** "memories", start to finish without lifting the pen. */
const WORD =
  "M35 129C39 124 49 105 56 98C63 91 72 87 77 87C82 87 86 94 88 98C89 102 89 100 88 109C86 117 81 138 77 151C74 163 67 182 67 182C67 182 74 159 77 151C81 142 82 138 88 129C93 121 102 105 109 98C116 91 123 89 130 87C137 86 145 86 151 87C156 89 159 94 161 98C163 102 163 100 161 109C159 117 154 138 151 151C147 163 140 182 140 182C140 182 147 159 151 151C154 142 156 138 161 129C166 121 175 105 182 98C189 91 196 89 203 87C210 86 219 86 224 87C229 89 233 93 235 98C236 103 236 110 235 119C233 128 226 142 224 151C222 159 222 166 224 172C226 177 231 180 235 182C238 184 240 184 245 182C250 180 261 175 266 172C271 168 271 168 277 161C282 154 292 129 298 129C303 129 303 158 308 161C313 165 324 154 329 151C334 147 336 145 340 140C343 135 348 126 350 119C352 112 352 103 350 98C348 93 343 89 340 87C336 86 334 86 329 87C324 89 313 93 308 98C303 103 299 110 298 119C296 128 296 142 298 151C299 159 303 166 308 172C313 177 322 180 329 182C336 184 343 184 350 182C357 180 366 175 371 172C376 168 377 168 382 161C387 154 396 140 403 129C410 119 417 105 424 98C431 91 440 87 445 87C450 87 453 94 455 98C457 102 457 100 455 109C453 117 448 138 445 151C441 163 434 182 434 182C434 182 441 159 445 151C448 142 450 138 455 129C460 121 469 105 476 98C483 91 490 89 497 87C504 86 513 86 518 87C523 89 527 94 529 98C531 102 531 100 529 109C527 117 522 138 518 151C515 163 508 182 508 182C508 182 515 159 518 151C522 142 524 138 529 129C534 121 543 105 550 98C557 91 564 89 571 87C578 86 586 86 592 87C597 89 600 93 602 98C604 103 604 110 602 119C600 128 593 142 592 151C590 159 590 166 592 172C593 177 599 180 602 182C606 184 608 184 613 182C618 180 628 175 634 172C639 168 639 168 644 161C649 154 651 142 665 129C679 117 721 94 728 87C735 80 715 86 708 87C701 89 692 94 686 98C681 102 679 103 676 109C672 114 667 122 665 129C664 136 664 144 665 151C667 158 671 166 676 172C681 177 690 180 697 182C704 184 711 184 718 182C725 180 734 175 739 172C744 168 746 166 750 161C753 156 758 147 760 140C762 133 762 126 760 119C758 112 755 103 750 98C744 93 733 87 728 87C723 87 720 93 718 98C716 103 716 112 718 119C720 126 723 135 728 140C733 145 741 149 750 151C758 152 772 152 781 151C790 149 797 144 802 140C807 137 807 136 812 129C817 122 828 107 833 98C839 89 842 77 844 77C846 77 839 95 844 98C849 102 868 96 875 98C882 100 884 103 886 109C888 114 888 121 886 129C884 138 877 154 875 161C873 168 873 168 875 172C877 175 882 180 886 182C889 184 891 184 897 182C902 180 912 175 917 172C922 168 923 168 928 161C933 154 942 142 949 129C956 117 970 84 970 87C970 91 953 137 949 151C946 165 947 166 949 172C951 177 956 180 960 182C963 184 965 184 970 182C975 180 986 175 991 172C996 168 996 168 1002 161C1007 154 1017 129 1023 129C1028 129 1028 158 1033 161C1038 165 1049 154 1054 151C1059 147 1061 145 1065 140C1068 135 1073 126 1075 119C1077 112 1077 103 1075 98C1073 93 1068 89 1065 87C1061 86 1059 86 1054 87C1049 89 1038 93 1033 98C1028 103 1024 110 1022 119C1021 128 1021 142 1022 151C1024 159 1028 166 1033 172C1038 177 1047 180 1054 182C1061 184 1068 184 1075 182C1082 180 1091 175 1096 172C1101 168 1101 168 1107 161C1112 154 1120 140 1127 129C1134 119 1143 107 1148 98C1154 89 1157 77 1159 77C1161 77 1155 89 1159 98C1162 107 1175 121 1180 129C1185 138 1188 144 1190 151C1192 158 1194 166 1190 172C1187 177 1180 182 1170 182C1159 182 1131 172 1127 172C1124 172 1138 180 1148 182C1159 184 1180 184 1190 182C1201 180 1206 175 1212 172C1217 168 1217 168 1222 161C1227 154 1239 135 1243 129";

/** The dot on the i. */
const DOT = "M981 35C981 37 979 44 981 45C982 47 989 47 991 45C993 44 993 37 991 35C989 33 982 35 981 35";

/**
 * The "@", in the 2 movements that are the glyph.
 *
 * The face sets it in four: these two, and then a second pass down the inside
 * of each of them to fatten the line. Both passes are dropped — see `AT_PLACE`
 * — because a nib has a width and a plotter's does not, so the weight is in the
 * stroke here rather than in how many times it is walked.
 */
const AT = [
  // The bowl of the a: round from the top right, anticlockwise, back to the stem.
  "M553 262C552 260 550 252 547 248C543 245 539 242 533 241C527 240 518 240 512 241C506 242 501 246 498 248C495 251 493 250 491 255C489 260 485 269 484 276C483 283 483 291 484 297C485 302 488 307 491 310C495 314 499 316 505 317C511 318 520 318 526 317C531 316 536 314 540 310C543 307 545 299 547 297",
  // The stem, and out of its foot straight into the ring, without a lift.
  "M553 241C552 250 548 285 547 297C545 308 544 307 547 310C549 314 556 316 560 317C565 318 570 320 574 317C579 315 585 309 588 304C592 298 594 289 595 283C596 277 596 275 595 269C594 263 591 254 588 248C586 242 585 239 581 234C578 230 572 224 568 220C563 217 559 216 553 213C548 211 540 208 533 206C526 205 519 205 512 206C505 208 497 211 491 213C485 216 482 217 477 220C473 224 467 230 463 234C460 239 459 242 457 248C454 254 451 262 450 269C448 276 448 283 450 290C451 296 454 305 457 310C459 316 460 320 463 324C467 329 473 335 477 338C482 342 485 343 491 345C497 347 505 351 512 352C519 353 526 353 533 352C540 351 548 347 553 345C559 343 564 340 568 338C571 336 573 332 574 331",
];

/** The wordmark: `logo-red.svg`'s one path in its own 230 × 78.77 box, and
 *  where that box lands here. */
const LOGO = {
  transform: "translate(636.82 185.23) scale(2.59)",
  scale: 2.59,
  box: { w: 230, h: 78.77 },
  d: "M54.5654 4.34762C59.0524 5.04344 61.3007 5.83484 63.0439 10.6494C43.5087 36.3485 34.2745 51.4614 18.6953 78.7705C14.8659 78.2335 12.6771 77.403 8.69531 75.0761L15.7607 33.1386L6.41309 44.6552L0 40.3095C7.56115 26.455 13.1653 22.1972 24.6738 18.4716C27.7925 20.3095 29.0391 21.8271 29.6738 26.0771L26.5215 27.8154L21.8477 55.6289C32.4787 33.1334 39.234 21.435 54.5654 4.34762ZM205.652 1.19723C206.492 -1.49654 215.326 1.19723 215.326 1.19723L207.826 22.4922C211.834 18.8955 214.216 17.0905 219.674 15.7558C223.707 16.4511 225.055 17.6548 226.087 21.0791C226.686 27.2455 225.393 30.7688 220.435 37.1591C216.564 41.5711 214.529 42.1087 210.979 41.9394L214.456 46.8281L225 41.9394C227.169 43.5982 228.268 44.8521 229.831 46.6357L230 46.8281C223.973 52.2153 219.756 54.0289 210.979 55.4111L200.652 43.1347L196.195 54.1074C192.866 54.8578 191.189 54.4588 188.695 51.6093V48.2412C181.848 55.5074 177.572 57.9406 169.131 59.1054L161.521 52.4785L157.718 59.1054C155.105 59.1287 153.672 58.6996 151.195 56.8242C151.195 56.8242 151.195 50.4138 149.782 49.6533C148.369 48.8944 144.587 59.3383 135.869 62.4736L128.152 56.8242V50.414L115.544 63.4511C111.148 63.2746 109.811 61.8935 107.718 59.1054C113.953 50.5622 116.107 45.7802 117.174 37.1591L117.029 37.2314C111.785 39.8473 109.394 41.0398 107.718 44.6552C103.001 53.1611 101.587 57.6511 99.2393 65.624C95.5858 64.9832 93.7413 64.4594 91.7393 62.4736L93.1523 55.4111L83.3691 65.624C79.983 65.1936 78.1389 64.6962 75.3262 61.6045L81.1953 46.2851C81.1604 46.3149 73.7995 52.594 71.8477 55.6289C69.8911 58.6711 64.6738 68.8838 64.6738 68.8838C61.344 68.5542 59.705 67.931 57.1738 65.624L59.2393 59.1054L45.6523 69.7529C42.6436 68.8345 40.9912 68.0154 38.1523 65.624L50 36.5068C55.0086 37.2108 58.4731 37.2383 59.2393 40.3095C59.2393 40.3095 53.1533 52.5854 53.0439 53.5644C52.9352 54.5422 63.5869 45.0898 64.6738 43.7861C65.7568 42.4868 69.2133 34.0721 69.2393 34.0088C72.9629 34.2422 74.8789 34.7087 77.8262 36.5068L76.8477 40.3095L83.3691 33.1386C87.9594 33.3306 90.244 33.856 93.1523 36.5068L89.5654 49.1103L97.1738 41.9394L107.718 11.8447C111.398 10.4193 113.466 10.3448 117.174 13.1484L110.869 33.1386C113.589 29.5974 115.402 28.0166 119.892 26.9463C123.211 27.8571 125.76 27.707 126.956 30.4228C128.15 33.135 125.66 41.9137 125.652 41.9394C137.573 28.6686 142.752 24.2975 149.131 22.4922C152.697 23.9427 153.6 25.1577 153.805 27.8154L142.826 36.5068C137.371 42.8283 134.456 51.3918 135.869 52.4785C137.282 53.5649 145.974 43.2886 149.131 33.1386C151.659 30.0974 153.53 29.7373 157.718 31.6181V44.6552L161.521 41.9394C167.585 27.0882 172.384 23.0881 182.174 19.7754C186.734 21.6264 189.015 22.9682 190.869 27.8154L186.195 34.0088C186.153 34.0186 182.93 34.7576 182.174 33.1386C181.413 31.5087 182.174 27.8154 182.174 27.8154C172.816 35.8226 166.957 46.7201 169.131 50.414C171.305 54.107 181.859 43.8849 193.805 30.4228L205.652 1.19723ZM217.394 24.122C216.414 22.7115 203.916 35.5305 204.459 36.291C205.003 37.0511 208.224 36.4723 213.154 32.3789C215.68 29.5354 218.372 25.5344 217.394 24.122ZM59.2393 21.2968C63.9418 21.0069 66.1639 21.673 69.2393 24.665L63.0439 35.0947L54.5654 31.6181C56.2041 26.6055 57.3652 25.0723 59.2393 21.2968Z",
};

/** The brush's route through the wordmark, in the wordmark's own units: the
 *  V, then "inhack" in one movement, then the dot on the i. The fill shows
 *  through these, so the route only has to pass along each letter; nothing
 *  outside the fill is ever seen. The width is the narrowest that still
 *  uncovers every pixel of the mark — measured, not guessed — so the finished
 *  wordmark is the whole wordmark. */
const BRUSH = {
  width: 21,
  strokes: [
    "M3 41C4 39.3 7 33.7 9 31C11 28.3 12.7 26.8 15 25C17.3 23.2 21 19.8 23 20C25 20.2 27.2 23 27 26C26.8 29 23.5 33.7 22 38C20.5 42.3 19.2 47.3 18 52C16.8 56.7 15.5 62 15 66C14.5 70 14 75.3 15 76C16 76.7 18.5 73.7 21 70C23.5 66.3 27 59.2 30 54C33 48.8 36 44.2 39 39C42 33.8 45.3 27.5 48 23C50.7 18.5 53 14.8 55 12C57 9.2 59.2 7 60 6",
    "M56 37C55.3 38.7 53.5 43.7 52 47C50.5 50.3 48.5 53.8 47 57C45.5 60.2 42.5 65.7 43 66C43.5 66.3 47.2 62.2 50 59C52.8 55.8 57 50.2 60 47C63 43.8 65.2 42.2 68 40C70.8 37.8 76.3 33 77 34C77.7 35 73.7 42.2 72 46C70.3 49.8 68.3 54 67 57C65.7 60 63.5 65.2 64 64C64.5 62.8 67.7 54.5 70 50C72.3 45.5 75.3 39.8 78 37C80.7 34.2 83.8 33 86 33C88.2 33 90.3 34.8 91 37C91.7 39.2 90.8 42.8 90 46C89.2 49.2 87 53 86 56C85 59 83 64.2 84 64C85 63.8 89.3 58.3 92 55C94.7 51.7 97.7 48.5 100 44C102.3 39.5 104 33.2 106 28C108 22.8 111.5 12.7 112 13C112.5 13.3 110.2 24.7 109 30C107.8 35.3 106.3 40 105 45C103.7 50 102 56.5 101 60C100 63.5 98.5 66.8 99 66C99.5 65.2 101.8 59.7 104 55C106.2 50.3 109.3 42.5 112 38C114.7 33.5 117.3 29.7 120 28C122.7 26.3 125.8 27 128 28C130.2 29 132.7 31.2 133 34C133.3 36.8 131.5 41.3 130 45C128.5 48.7 125.7 53 124 56C122.3 59 119.3 63.3 120 63C120.7 62.7 125.3 56.8 128 54C130.7 51.2 133.2 50.3 136 46C138.8 41.7 142.3 31.3 145 28C147.7 24.7 149.8 25.7 152 26C154.2 26.3 158.3 28.3 158 30C157.7 31.7 153 33.7 150 36C147 38.3 142.7 41.7 140 44C137.3 46.3 134 48.3 134 50C134 51.7 137.3 54.3 140 54C142.7 53.7 147 51.7 150 48C153 44.3 157 33 158 32C159 31 157 38.7 156 42C155 45.3 153.3 49.7 152 52C150.7 54.3 146.7 56.7 148 56C149.3 55.3 156.3 50.7 160 48C163.7 45.3 166.7 43.7 170 40C173.3 36.3 177 28.8 180 26C183 23.2 186.3 22.7 188 23C189.7 23.3 191.3 26.8 190 28C188.7 29.2 183 28.5 180 30C177 31.5 174 34.5 172 37C170 39.5 167.7 42.3 168 45C168.3 47.7 171.3 53.5 174 53C176.7 52.5 180.7 45.8 184 42C187.3 38.2 191 34.2 194 30C197 25.8 199.3 21.3 202 17C204.7 12.7 209.3 3.5 210 4C210.7 4.5 207.7 14 206 20C204.3 26 201.8 34 200 40C198.2 46 194.7 55.3 195 56C195.3 56.7 199.2 48.3 202 44C204.8 39.7 209 34 212 30C215 26 217.8 21.3 220 20C222.2 18.7 224.7 20 225 22C225.3 24 223.8 28.7 222 32C220.2 35.3 216.3 39.7 214 42C211.7 44.3 207.7 45.3 208 46C208.3 46.7 213.3 46.2 216 46C218.7 45.8 221.7 44.8 224 45C226.3 45.2 229 46.7 230 47",
    "M58 25C58.8 25.5 62 26.8 63 28C64 29.2 63.8 31.3 64 32",
  ],
};

export default function MemoriesMark({ className }: MemoriesMarkProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  // Kept to letters and digits: the id goes into url(#…), where React's
  // punctuation is not safe.
  const brushId = `memories-brush-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  useGSAP(
    () => {
      const svg = svgRef.current;
      if (!svg) return;

      // Writing order, named rather than taken from the document: the
      // brush lives in a <mask> inside <defs>, so in document order it comes
      // first — which would write the wordmark before the word.
      const strokes = ["word", "dot", "at", "brush"].flatMap((kind) =>
        gsap.utils.toArray<SVGPathElement>(`[data-stroke="${kind}"]`, svg),
      );

      // Everything is drawn in the markup, so with no motion there is nothing
      // to do: the title is simply there.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Each stroke starts fully dashed out. The buffer past the length hides
      // the round cap that would otherwise sit at the start of a hidden
      // stroke. Both the brush strokes and the "@" live in scaled groups, so
      // their nibs are their own and their lengths are scaled back up to the
      // page before the pace is worked out from them.
      const lengths = strokes.map((path) => {
        const kind = path.dataset.stroke;
        const nib =
          kind === "brush" ? BRUSH.width
          : kind === "at" ? AT_PLACE.pen / AT_PLACE.scale
          : PEN;
        const scale =
          kind === "brush" ? LOGO.scale
          : kind === "at" ? AT_PLACE.scale
          : 1;
        const padded = path.getTotalLength() + 2 * nib;
        gsap.set(path, {
          strokeDasharray: `${padded} ${padded}`,
          strokeDashoffset: padded,
          visibility: "hidden",
        });
        return padded * scale;
      });

      const tl = gsap.timeline({ delay: 0.2 });

      strokes.forEach((path, i) => {
        const kind = path.dataset.stroke;
        const previous = strokes[i - 1]?.dataset.stroke;
        // A breath before the pen comes back for a dot, a longer one before
        // it moves down a line to the "@", and again before the brush.
        const position =
          kind === "dot" ? "+=0.08"
          : kind !== previous ? "+=0.14"
          : "+=0.02";
        const ease =
          kind === "dot" ? "power2.out"
          : kind === "word" ? "power1.inOut"
          : "sine.inOut";
        tl.set(path, { visibility: "visible" }, position).to(path, {
          strokeDashoffset: 0,
          duration: Math.max(0.14, lengths[i] / SPEED),
          ease,
        });
      });
    },
    { scope: svgRef },
  );

  return (
    <svg
      ref={svgRef}
      className={className}
      viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
      fill="none"
      role="img"
      aria-label={MEMORIES.mark}
    >
      <defs>
        <mask
          id={brushId}
          maskUnits="userSpaceOnUse"
          x={-BRUSH.width}
          y={-BRUSH.width}
          width={LOGO.box.w + 2 * BRUSH.width}
          height={LOGO.box.h + 2 * BRUSH.width}
        >
          {BRUSH.strokes.map((d, i) => (
            <path
              key={i}
              d={d}
              data-stroke="brush"
              stroke="#fff"
              strokeWidth={BRUSH.width}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </mask>
      </defs>
      <g stroke={GREEN} strokeLinecap="round" strokeLinejoin="round">
        <g strokeWidth={PEN}>
          <path d={WORD} data-stroke="word" />
          <path d={DOT} data-stroke="dot" />
        </g>
        {/* Bigger and on a finer nib than the word — see `AT_PLACE`. The nib
            is divided by the scale so what lands on the page is `pen`. */}
        <g transform={AT_TRANSFORM} strokeWidth={AT_PLACE.pen / AT_PLACE.scale}>
          {AT.map((d, i) => (
            <path key={i} d={d} data-stroke="at" />
          ))}
        </g>
      </g>
      <g transform={LOGO.transform}>
        <path d={LOGO.d} fill={RED} mask={`url(#${brushId})`} />
      </g>
    </svg>
  );
}
