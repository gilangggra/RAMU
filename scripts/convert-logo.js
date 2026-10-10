const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputPath = 'C:/Users/Gilang Ramadan/.gemini/antigravity-ide/brain/7426e5de-de5f-477b-bacd-5bb51e5d49c3/.user_uploaded/media_1791622806237.jpg';

async function generateAllAssets() {
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Let's create an RGBA buffer for dark version (transparent bg)
  // and another for white version (transparent bg, black arc -> white arc)
  const darkBuffer = Buffer.alloc(width * height * 4);
  const whiteBuffer = Buffer.alloc(width * height * 4);

  const BLUE_R = 103, BLUE_G = 194, BLUE_B = 241;
  const BLACK_R = 26, BLACK_G = 26, BLACK_B = 28;

  for (let i = 0; i < width * height; i++) {
    const srcIdx = i * channels;
    const dstIdx = i * 4;

    const r = data[srcIdx];
    const g = data[srcIdx + 1];
    const b = data[srcIdx + 2];

    // Background white check
    if (r >= 253 && g >= 253 && b >= 253) {
      darkBuffer[dstIdx] = 0;
      darkBuffer[dstIdx + 1] = 0;
      darkBuffer[dstIdx + 2] = 0;
      darkBuffer[dstIdx + 3] = 0;

      whiteBuffer[dstIdx] = 0;
      whiteBuffer[dstIdx + 1] = 0;
      whiteBuffer[dstIdx + 2] = 0;
      whiteBuffer[dstIdx + 3] = 0;
      continue;
    }

    const isBlue = (b > r + 30) && (g > r + 15);

    if (isBlue) {
      const alpha = Math.min(255, Math.max(0, Math.round(((255 - r) / (255 - BLUE_R)) * 255)));

      darkBuffer[dstIdx] = BLUE_R;
      darkBuffer[dstIdx + 1] = BLUE_G;
      darkBuffer[dstIdx + 2] = BLUE_B;
      darkBuffer[dstIdx + 3] = alpha;

      whiteBuffer[dstIdx] = BLUE_R;
      whiteBuffer[dstIdx + 1] = BLUE_G;
      whiteBuffer[dstIdx + 2] = BLUE_B;
      whiteBuffer[dstIdx + 3] = alpha;
    } else {
      const gray = (r + g + b) / 3;
      const alpha = Math.min(255, Math.max(0, Math.round(((255 - gray) / (255 - 28)) * 255)));

      darkBuffer[dstIdx] = BLACK_R;
      darkBuffer[dstIdx + 1] = BLACK_G;
      darkBuffer[dstIdx + 2] = BLACK_B;
      darkBuffer[dstIdx + 3] = alpha;

      whiteBuffer[dstIdx] = 255;
      whiteBuffer[dstIdx + 1] = 255;
      whiteBuffer[dstIdx + 2] = 255;
      whiteBuffer[dstIdx + 3] = alpha;
    }
  }

  // Find tight bounding box of non-transparent pixels
  let minX = width, maxX = 0, minY = height, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (darkBuffer[idx + 3] > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const bboxW = maxX - minX + 1;
  const bboxH = maxY - minY + 1;
  const size = Math.max(bboxW, bboxH);
  const pad = Math.round(size * 0.04); // 4% subtle breathing room
  const targetSize = size + pad * 2;
  const centerX = Math.round((minX + maxX) / 2);
  const centerY = Math.round((minY + maxY) / 2);
  
  const cropLeft = Math.max(0, centerX - Math.round(targetSize / 2));
  const cropTop = Math.max(0, centerY - Math.round(targetSize / 2));
  const cropW = Math.min(width - cropLeft, targetSize);
  const cropH = Math.min(height - cropTop, targetSize);

  const publicDir = path.resolve(__dirname, '../public');

  // 1. Dark transparent PNG
  const darkPngBuf = await sharp(darkBuffer, { raw: { width, height, channels: 4 } })
    .extract({ left: cropLeft, top: cropTop, width: cropW, height: cropH })
    .resize(512, 512)
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'ramu-logo-transparent.png'), darkPngBuf);

  // 2. White transparent PNG
  const whitePngBuf = await sharp(whiteBuffer, { raw: { width, height, channels: 4 } })
    .extract({ left: cropLeft, top: cropTop, width: cropW, height: cropH })
    .resize(512, 512)
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'ramu-logo-white.png'), whitePngBuf);

  // 3. General logo PNG
  fs.writeFileSync(path.join(publicDir, 'ramu-logo.png'), darkPngBuf);

  // 4. SVG Favicon & SVG Mark with crisp embedded high-res PNG
  const b64Dark = darkPngBuf.toString('base64');
  const faviconSvg = `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <image href="data:image/png;base64,${b64Dark}" x="2" y="2" width="60" height="60" preserveAspectRatio="xMidYMid meet" />
</svg>
`;
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg);
  fs.writeFileSync(path.join(publicDir, 'ramu-mark.svg'), faviconSvg);

  // 5. Full Horizontal Logo SVG with Wordmark & Subtitle
  const fullLogoSvg = `<svg width="240" height="64" viewBox="0 0 240 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Brand Mark -->
  <image href="data:image/png;base64,${b64Dark}" x="0" y="2" width="60" height="60" preserveAspectRatio="xMidYMid meet" />
  <!-- Wordmark -->
  <text x="70" y="38" font-family="Plus Jakarta Sans, Inter, -apple-system, sans-serif" font-size="32" font-weight="900" letter-spacing="0.12em" fill="#18181B">RAMU</text>
  <!-- Subtitle -->
  <text x="71" y="54" font-family="Plus Jakarta Sans, Inter, -apple-system, sans-serif" font-size="8.5" font-weight="700" letter-spacing="0.22em" fill="#71717A">PLATFORM INDUSTRI KREATIF</text>
</svg>
`;
  fs.writeFileSync(path.join(publicDir, 'ramu-logo.svg'), fullLogoSvg);

  console.log('Successfully updated all public logo assets (PNG, SVG, Favicon)!');
}

generateAllAssets().catch(console.error);
