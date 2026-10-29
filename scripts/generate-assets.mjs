import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const assetsDir = path.join(root, "assets");
const storeDir = path.join(root, "store", "assets");

const brand = {
  ink: "#131614",
  cream: "#F2EFE7",
  lime: "#D9FF63",
  muted: "#9AA09A",
};

const arrowPaths = `
  <path d="M154 208h206m-48-50 50 50-50 50" fill="none" stroke="${brand.ink}" stroke-width="29" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M358 304H152m48 50-50-50 50-50" fill="none" stroke="${brand.ink}" stroke-width="29" stroke-linecap="round" stroke-linejoin="round"/>
`;

function fullIconSvg() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <rect width="512" height="512" fill="${brand.ink}"/>
      <circle cx="256" cy="256" r="176" fill="${brand.lime}"/>
      ${arrowPaths}
    </svg>
  `;
}

function foregroundSvg() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
      <g transform="translate(512 512) scale(1.8) translate(-256 -256)">
        <circle cx="256" cy="256" r="176" fill="${brand.lime}"/>
        ${arrowPaths}
      </g>
    </svg>
  `;
}

function featureGraphicSvg() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
      <rect width="1024" height="500" fill="${brand.ink}"/>
      <circle cx="232" cy="250" r="132" fill="${brand.lime}"/>
      <g transform="translate(232 250) scale(0.75) translate(-256 -256)">
        ${arrowPaths}
      </g>
      <text x="420" y="215" fill="${brand.cream}" font-family="Georgia, 'Times New Roman', serif" font-size="76" font-weight="700">Da$Nomad</text>
      <text x="422" y="278" fill="${brand.lime}" font-family="Georgia, 'Times New Roman', serif" font-size="40" font-style="italic">Every currency,</text>
      <text x="422" y="328" fill="${brand.lime}" font-family="Georgia, 'Times New Roman', serif" font-size="40" font-style="italic">one glance.</text>
      <text x="422" y="390" fill="${brand.muted}" font-family="Arial, Helvetica, sans-serif" font-size="20" letter-spacing="2">LIVE RATES  ·  LOCAL CURRENCY  ·  WORLD CLOCKS</text>
    </svg>
  `;
}

async function render(svg, width, height) {
  return sharp(Buffer.from(svg)).resize(width, height).png().toBuffer();
}

async function main() {
  await mkdir(storeDir, { recursive: true });

  const iconOnly = await render(fullIconSvg(), 1024, 1024);
  const foreground = await render(foregroundSvg(), 1024, 1024);
  const background = await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: brand.ink },
  }).png().toBuffer();

  await sharp(iconOnly).toFile(path.join(assetsDir, "icon-only.png"));
  await sharp(foreground).toFile(path.join(assetsDir, "icon-foreground.png"));
  await sharp(background).toFile(path.join(assetsDir, "icon-background.png"));

  const splashIcon = await sharp(foreground)
    .resize(800, 800, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  for (const [name, color] of [["splash.png", brand.cream], ["splash-dark.png", brand.ink]]) {
    await sharp({ create: { width: 2732, height: 2732, channels: 4, background: color } })
      .composite([{ input: splashIcon, gravity: "center" }])
      .png()
      .toFile(path.join(assetsDir, name));
  }

  await sharp(iconOnly).toFile(path.join(storeDir, "icon-1024.png"));
  await sharp(iconOnly).resize(512, 512).toFile(path.join(storeDir, "icon-512.png"));
  await sharp(Buffer.from(featureGraphicSvg())).png().toFile(path.join(storeDir, "feature-graphic.png"));

  const source = await readFile(path.join(assetsDir, "icon.svg"));
  await sharp(source).resize(512, 512).png().toFile(path.join(storeDir, "icon-source-512.png"));

  console.log("Generated native icon/splash sources and store graphics.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
