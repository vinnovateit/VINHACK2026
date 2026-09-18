import dns from "node:dns";
import fs from "node:fs";
import https from "node:https";
import path from "node:path";

dns.setDefaultResultOrder("ipv4first");

const SCRIPTS = {
  "Anek Tamil": "வின்ஹேக்",
  "Anek Devanagari": "विनहैक",
  "Anek Bangla": "ভিনহ্যাক",
  "Anek Gujarati": "વિનહેક",
  "Anek Telugu": "విన్‌హ్యాక్",
  "Anek Kannada": "ವಿನ್‌ಹ್ಯಾಕ್",
  "Anek Malayalam": "വിൻഹാക്ക്",
  "Noto Nastaliq Urdu": "ون ہیک",
};




const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

function getBuffer(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: HEADERS }, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return resolve(getBuffer(res.headers.location));
        }
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

async function compressFonts() {
  const chunksDir = path.resolve(".next/static/chunks");
  if (!fs.existsSync(chunksDir)) return;

  const cssFiles = fs.readdirSync(chunksDir).filter((f) => f.endsWith(".css"));

  for (const file of cssFiles) {
    const cssPath = path.join(chunksDir, file);
    const css = fs.readFileSync(cssPath, "utf8");

    const pattern =
      /@font-face\{font-family:([^;]+);[^}]*src:url\(\.\.\/media\/([^)]+)\)[^}]*unicode-range:([^}]+)\}/g;

    let match;
    while ((match = pattern.exec(css)) !== null) {
      const [, family, fontFile, urange] = match;
      if (SCRIPTS[family] && !urange.includes("U+??") && !urange.includes("U+100-2BA")) {
        const targetPath = path.resolve(".next/static/media", fontFile);
        if (!fs.existsSync(targetPath)) continue;

        const text = SCRIPTS[family];
        const gUrl = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@700&text=${encodeURIComponent(text)}`;

        try {
          const cssBuf = await getBuffer(gUrl);
          const gCss = cssBuf.toString("utf8");
          const m = /url\((https:\/\/[^)]+)\)/.exec(gCss);
          if (m) {
            const fontBuf = await getBuffer(m[1]);
            fs.writeFileSync(targetPath, fontBuf);
            console.log(`Compressed ${family} -> ${fontBuf.length} bytes (glyphs: ${text})`);
          }
        } catch (err) {
          console.warn(`Failed compressing ${family}:`, err.message);
        }
      }
    }
  }
}

compressFonts();
