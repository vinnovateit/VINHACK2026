import type { Metadata } from "next";
import MemoriesStudio from "@/components/memories/MemoriesStudio";
import { MEMORIES } from "@/content/site";

export const metadata: Metadata = {
  title: `${MEMORIES.heading} — VinHack 2026`,
  description:
    "Make a VinHack 2026 memory card: take a photo, pick a line, add stickers from the site, and save the picture.",
};

/**
 * Reached from the shutter on the attendee pass and from nowhere else — it is
 * in no nav and nothing links to it but that button.
 *
 * A photobooth in two screens, both of them `MemoriesStudio`: the title, the
 * words and the loose stickers; then the studio, where the camera sits in the
 * card's own photo window and the filters, the stickers and the line are all on
 * the page around it. The camera is never opened by arriving here — it is two
 * presses in, and the whole page works without ever giving it one.
 *
 * The page is one client component. Unlike `/`, it is not the collage: there is
 * no fixed 1280 canvas and no second mobile tree, because the card is the only
 * thing on it that has a fixed size and it carries its own scaling.
 */
export default function MemoriesPage() {
  return <MemoriesStudio />;
}
