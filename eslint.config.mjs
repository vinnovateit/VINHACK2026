import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // The section components are a direct translation of the Figma frame: every
    // asset is an exported icon or illustration rendered into a box whose exact
    // pixel size comes from the design. `next/image` adds nothing for these
    // (they are overwhelmingly SVGs, which it does not optimise) and would only
    // obscure the 1:1 mapping back to the Figma nodes.
    //
    // The mobile layout draws the same exported assets — the stickers and the
    // receipt come through whole, at their Figma sizes — so it is the same
    // assets for the same reason. `hero/` is the pieces the two layouts share:
    // the same Figma nodes again, lifted out so the phone's hero and the
    // collage's draw one copy of each.
    //
    // The memory-card studio is the same assets again, and has a second reason:
    // every one of them is also drawn into a canvas at its natural size to make
    // the file the visitor saves, so the preview has to be the same bytes at
    // the same size. A loader between the two would be a way for what is on
    // screen and what is exported to disagree.
    files: [
      "src/components/sections/**/*.tsx",
      "src/components/hero/**/*.tsx",
      "src/components/mobile/**/*.tsx",
      "src/components/memories/**/*.tsx",
    ],
    rules: { "@next/next/no-img-element": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
