/**
 * The booth's eyes: MediaPipe's face landmarker and selfie segmenter, fetched
 * from a CDN the first time somebody actually asks for them.
 *
 * Nothing here loads on page load, and nothing here is in the bundle. The
 * models are a few megabytes between them and the overwhelming majority of
 * people who open `/memories` want to take a photograph, not wear sunglasses —
 * so the whole of this file is dormant until the AR panel is opened, and the
 * booth is fully usable if it never wakes up. Every entry point returns `null`
 * rather than throwing, and every caller is written to carry on without it.
 *
 * It is loaded as a module script appended to the head rather than as an
 * `import()`, because this is a bundled app and a bare `import()` of an
 * absolute URL is a thing bundlers have opinions about. A `<script type=
 * "module">` has no opinions: the browser fetches it, and if it cannot, the
 * timeout below is the answer. That timeout is the whole error handling — an
 * inline module's `onerror` does not fire for a failure *inside* it, so waiting
 * is the only signal there is.
 *
 * ------------------------------------------------------------------ geometry
 *
 * Landmarks come back normalised per axis, which is the one thing about them
 * that is inconvenient: on a 4:3 frame an x of 0.1 and a y of 0.1 are different
 * distances, so nothing can be measured or rotated without dividing the aspect
 * back out first. `readFaces` does that once, and everything downstream — this
 * file, `ar.ts`, `ArStage`, `paint.ts` — works in one isotropic space where
 * both axes are fractions of the frame's *width*. So `y` runs 0 to h/w rather
 * than 0 to 1, a distance is a distance, and an angle is an angle.
 */

/** Structural stand-ins for the CDN module. There are no types to import — the
 *  package is never resolved at build time — so this is the shape we use, and
 *  nothing beyond it is touched. */
type Landmark = { x: number; y: number; z: number };

export type FaceLandmarkerLike = {
  detectForVideo: (
    source: CanvasImageSource,
    timestamp: number,
  ) => { faceLandmarks?: Landmark[][] };
  close?: () => void;
};

type MaskLike = {
  getAsUint8Array: () => Uint8Array;
  width: number;
  height: number;
  close?: () => void;
};

export type SegmenterLike = {
  segmentForVideo: (
    source: CanvasImageSource,
    timestamp: number,
    callback: (result: { categoryMask?: MaskLike | null }) => void,
  ) => void;
  close?: () => void;
};

type VisionModule = {
  FilesetResolver: { forVisionTasks: (base: string) => Promise<unknown> };
  FaceLandmarker: {
    createFromOptions: (fileset: unknown, options: unknown) => Promise<FaceLandmarkerLike>;
  };
  ImageSegmenter: {
    createFromOptions: (fileset: unknown, options: unknown) => Promise<SegmenterLike>;
  };
};

/** Pinned, not floating. A range would mean the booth's behaviour changed
 *  under us on a morning nobody deployed anything. Pinned to a version that
 *  exists, too: the 0.10 line skips from .21 straight to .32, and a pin into
 *  that gap is a 404 the panel can only report as "face tracking unavailable". */
const VERSION = "0.10.21";
const BUNDLE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}`;
/** Named rather than left to the CDN's entry-point guessing, which for this
 *  package points at a wasm loader rather than the ES module. */
const MODULE = `${BUNDLE}/vision_bundle.mjs`;
const WASM = `${BUNDLE}/wasm`;
const FACE_MODEL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const SEG_MODEL =
  "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite";

/** Long enough for a bad hall wifi to finish, short enough that the panel says
 *  so rather than spinning at somebody for a minute. */
const TIMEOUT = 20000;
const READY = "vinhack:vision-ready";

/** How many faces are tracked at once. A booth is a group photo more often
 *  than not, and the cost of the extra three is small next to the cost of
 *  telling four people only one of them gets sunglasses. */
export const MAX_FACES = 4;

let moduleOnce: Promise<VisionModule | null> | null = null;

function loadModule(): Promise<VisionModule | null> {
  if (moduleOnce) return moduleOnce;
  moduleOnce = new Promise<VisionModule | null>((resolve) => {
    if (typeof document === "undefined") {
      resolve(null);
      return;
    }
    const holder = window as unknown as { __vinhackVision?: VisionModule };
    if (holder.__vinhackVision) {
      resolve(holder.__vinhackVision);
      return;
    }

    let settled = false;
    const finish = (value: VisionModule | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };
    const timer = setTimeout(() => finish(null), TIMEOUT);

    window.addEventListener(READY, () => finish(holder.__vinhackVision ?? null), {
      once: true,
    });

    const tag = document.createElement("script");
    tag.type = "module";
    // Built rather than written out, so the URL and the event name cannot drift
    // from the constants above.
    tag.textContent = [
      `import * as vision from ${JSON.stringify(MODULE)};`,
      `window.__vinhackVision = vision;`,
      `window.dispatchEvent(new Event(${JSON.stringify(READY)}));`,
    ].join("\n");
    tag.onerror = () => finish(null);
    document.head.append(tag);
  });
  return moduleOnce;
}

let filesetOnce: Promise<unknown> | null = null;

function loadFileset() {
  if (filesetOnce) return filesetOnce;
  filesetOnce = loadModule().then((vision) =>
    vision ? vision.FilesetResolver.forVisionTasks(WASM).catch(() => null) : null,
  );
  return filesetOnce;
}

let facesOnce: Promise<FaceLandmarkerLike | null> | null = null;

/** The face landmarker, or `null` if anything at all went wrong getting it. */
export function loadFaces(): Promise<FaceLandmarkerLike | null> {
  if (facesOnce) return facesOnce;
  facesOnce = (async () => {
    const [vision, fileset] = await Promise.all([loadModule(), loadFileset()]);
    if (!vision || !fileset) return null;
    return vision.FaceLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: FACE_MODEL, delegate: "GPU" },
      runningMode: "VIDEO",
      numFaces: MAX_FACES,
    }).catch(() => null);
  })();
  return facesOnce;
}

let segmenterOnce: Promise<SegmenterLike | null> | null = null;

/** The selfie segmenter, or `null`. Only ever asked for by a scene backdrop —
 *  the frames do not need it and never wait on it. */
export function loadSegmenter(): Promise<SegmenterLike | null> {
  if (segmenterOnce) return segmenterOnce;
  segmenterOnce = (async () => {
    const [vision, fileset] = await Promise.all([loadModule(), loadFileset()]);
    if (!vision || !fileset) return null;
    return vision.ImageSegmenter.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: SEG_MODEL, delegate: "GPU" },
      runningMode: "VIDEO",
      outputCategoryMask: true,
      outputConfidenceMasks: false,
    }).catch(() => null);
  })();
  return segmenterOnce;
}

/* ------------------------------------------------------------------ faces */

/** A point on the frame, in fractions of the frame's *width* on both axes —
 *  see the note at the top. */
export type Point = { x: number; y: number };

/**
 * One face, reduced to the five things a prop can hang off and the two numbers
 * that size and turn it. The 478 landmarks are not carried around: a pair of
 * sunglasses needs to know where the eyes are, how far apart they are, and
 * which way up the head is, and every one of the props is placed from exactly
 * that.
 */
export type Face = {
  /** Midway between the eye centres — where glasses sit. */
  eyes: Point;
  /** The top of the forehead, which the hats go above. */
  brow: Point;
  nose: Point;
  mouth: Point;
  chin: Point;
  /** Between the eye centres, as a fraction of the frame width. Every prop is
   *  sized as a multiple of this, so somebody at the back of the group gets
   *  sunglasses that fit them rather than sunglasses that fit the front row. */
  span: number;
  /** Head roll, in degrees clockwise. */
  roll: number;
};

/** The landmarks each anchor is read off. MediaPipe's canonical face, and the
 *  only place in the codebase that knows these numbers. */
const LM = {
  eyeLeftOuter: 33,
  eyeLeftInner: 133,
  eyeRightInner: 362,
  eyeRightOuter: 263,
  brow: 10,
  nose: 1,
  mouth: 13,
  chin: 152,
} as const;

/** Faces smaller than this fraction of the frame are dropped. Below it the
 *  landmarks are mostly noise, and sunglasses jittering on somebody in the far
 *  background are worse than no sunglasses on them. */
const MIN_SPAN = 0.035;

/**
 * Read the frame and reduce every face in it.
 *
 * `frame` is the source's own pixel size, and it is needed for one reason: to
 * divide the aspect out of the y axis so the space is isotropic.
 */
export function readFaces(
  landmarker: FaceLandmarkerLike,
  source: CanvasImageSource,
  timestamp: number,
  frame: { w: number; h: number },
): Face[] {
  let result;
  try {
    result = landmarker.detectForVideo(source, timestamp);
  } catch {
    return [];
  }
  const all = result?.faceLandmarks;
  if (!all?.length) return [];

  // One number, applied to every y: MediaPipe normalises the axes separately,
  // and everything downstream needs them in the same unit.
  const tall = frame.h / frame.w;
  const at = (marks: Landmark[], index: number): Point => ({
    x: marks[index].x,
    y: marks[index].y * tall,
  });
  const mid = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

  const faces: Face[] = [];
  for (const marks of all) {
    if (!marks || marks.length <= LM.chin) continue;
    const left = mid(at(marks, LM.eyeLeftOuter), at(marks, LM.eyeLeftInner));
    const right = mid(at(marks, LM.eyeRightInner), at(marks, LM.eyeRightOuter));
    const dx = right.x - left.x;
    const dy = right.y - left.y;
    const span = Math.hypot(dx, dy);
    if (!(span > MIN_SPAN)) continue;
    faces.push({
      eyes: mid(left, right),
      brow: at(marks, LM.brow),
      nose: at(marks, LM.nose),
      mouth: at(marks, LM.mouth),
      chin: at(marks, LM.chin),
      span,
      roll: (Math.atan2(dy, dx) * 180) / Math.PI,
    });
  }
  return faces;
}

/**
 * The same face seen in a mirror.
 *
 * The preview is mirrored — that is the frame you posed against, and
 * `useCamera` explains why — but the landmarks are read off the unmirrored
 * video. So every prop placed from them has to be flipped into the picture the
 * viewer is actually looking at: x reflects about the frame's centre line and
 * the roll reverses with it. Nothing else changes, because a reflection is the
 * only thing that has happened.
 */
export function mirrorFace(face: Face): Face {
  const flip = (p: Point): Point => ({ x: 1 - p.x, y: p.y });
  return {
    eyes: flip(face.eyes),
    brow: flip(face.brow),
    nose: flip(face.nose),
    mouth: flip(face.mouth),
    chin: flip(face.chin),
    span: face.span,
    roll: -face.roll,
  };
}

/* -------------------------------------------------------------- the mask */

/**
 * The segmenter's answer, turned into an alpha mask: opaque where the person
 * is, clear where the room is.
 *
 * Which label means "person" is not assumed. The selfie segmenter has been
 * documented both ways round at different times and there is no reason to bet
 * the whole effect on remembering which — so the four corners of the frame
 * vote, whatever they agree on is the room, and everything else is the person.
 * A corner of a selfie is the wall behind you in essentially every photograph
 * anybody has taken in a photo booth, and where it is not the worst case is one
 * inverted frame rather than a broken feature.
 *
 * Returned as a canvas rather than an ImageData so the caller can draw it
 * scaled — the mask is small, the model works at 256 square, and the bilinear
 * stretch on the way up is what keeps the edge off looking like a staircase.
 */
export function maskCanvas(mask: MaskLike): HTMLCanvasElement | null {
  const { width, height } = mask;
  if (!width || !height) return null;
  let data: Uint8Array;
  try {
    data = mask.getAsUint8Array();
  } catch {
    return null;
  }
  if (data.length < width * height) return null;

  const corner = (x: number, y: number) => data[y * width + x];
  const votes = [
    corner(0, 0),
    corner(width - 1, 0),
    corner(0, height - 1),
    corner(width - 1, height - 1),
  ];
  const tally = new Map<number, number>();
  for (const vote of votes) tally.set(vote, (tally.get(vote) ?? 0) + 1);
  let room = votes[0];
  let best = 0;
  for (const [value, count] of tally) {
    if (count > best) {
      best = count;
      room = value;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const image = ctx.createImageData(width, height);
  const pixels = image.data;
  for (let i = 0; i < data.length; i += 1) {
    pixels[i * 4 + 3] = data[i] === room ? 0 : 255;
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

/** One segmentation, as a canvas. The task hands its result to a callback and
 *  reuses the buffer behind it the moment that callback returns, so the mask is
 *  copied out inside the callback and never escapes it. The callback is
 *  synchronous in VIDEO mode, which is why this can return rather than
 *  resolve. */
export function segment(
  segmenter: SegmenterLike,
  source: CanvasImageSource,
  timestamp: number,
): HTMLCanvasElement | null {
  let out: HTMLCanvasElement | null = null;
  try {
    segmenter.segmentForVideo(source, timestamp, (result) => {
      const mask = result?.categoryMask;
      if (!mask) return;
      out = maskCanvas(mask);
      mask.close?.();
    });
  } catch {
    return null;
  }
  return out;
}
