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
    // assets for the same reason.
    files: [
      "src/components/sections/**/*.tsx",
      "src/components/mobile/**/*.tsx",
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
