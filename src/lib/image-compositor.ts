import sharp from 'sharp';
import path from 'path';

// A4 ratio roughly. 1024x1792 is close to 9:16.
// We will use 1024x1792 as base.

export async function compositeCard(
    baseImageBuffer: Buffer,
    date: string, // YYYY-MM-DD
    maker: string,
    model: string,
    usage: string | undefined,
    isHolo: boolean
): Promise<Buffer> {
    const width = 1024;
    const height = 1792;

    // Verify date format
    const [y, m, d] = date.split('-').map(Number);
    const dateTextMain = `${m}がつ ${d}にち`;
    const carTextMain = `${maker} ${model}`;
    const carTextSub = usage ? `(${usage})` : '';

    // SVG for Text Overlay
    // We place date at the top, car info at the bottom.
    // Use a semi-transparent gradient or block behind text for readability.
    const svgOverlay = `
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="gradTop" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(255,255,255);stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:rgb(255,255,255);stop-opacity:0" />
        </linearGradient>
        <linearGradient id="gradBottom" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(255,255,255);stop-opacity:0" />
          <stop offset="100%" style="stop-color:rgb(255,255,255);stop-opacity:0.9" />
        </linearGradient>
      </defs>
      
      <!-- Top Gradient Background for Date -->
      <rect x="0" y="0" width="${width}" height="300" fill="url(#gradTop)" />
      
      <!-- Date Text -->
      <text x="50%" y="180" font-family="sans-serif" font-weight="bold" font-size="140" fill="#333" text-anchor="middle">
        ${dateTextMain}
      </text>

      <!-- Bottom Gradient Background for Info -->
      <rect x="0" y="${height - 400}" width="${width}" height="400" fill="url(#gradBottom)" />
      
      <!-- Car Info -->
      <text x="50%" y="${height - 180}" font-family="sans-serif" font-weight="bold" font-size="80" fill="#333" text-anchor="middle">
        ${carTextMain}
      </text>
      <text x="50%" y="${height - 80}" font-family="sans-serif" font-size="60" fill="#555" text-anchor="middle">
        ${carTextSub}
      </text>
    </svg>
  `;

    let pipeline = sharp(baseImageBuffer)
        .resize(width, height) // Ensure size
        .composite([
            { input: Buffer.from(svgOverlay), top: 0, left: 0 },
        ]);

    if (isHolo) {
        // Generate a simple holographic overlay effect
        // We can simulate this with a semi-transparent rainbow gradient overlay
        // Ideally we would have a 'holo.png' texture, but we can generate one via SVG or just simple color manipulation is hard in sharp alone without texture.
        // Let's use an SVG overlay with blend mode 'overlay' or 'color-dodge'.

        // Simple rainbow gradient
        const holoOverlay = `
      <svg width="${width}" height="${height}">
        <defs>
          <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color: #ff0000; stop-opacity: 0.3" />
            <stop offset="20%" style="stop-color: #ffff00; stop-opacity: 0.3" />
            <stop offset="40%" style="stop-color: #00ff00; stop-opacity: 0.3" />
            <stop offset="60%" style="stop-color: #00ffff; stop-opacity: 0.3" />
            <stop offset="80%" style="stop-color: #0000ff; stop-opacity: 0.3" />
            <stop offset="100%" style="stop-color: #ff00ff; stop-opacity: 0.3" />
          </linearGradient>
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
                <feFuncA type="linear" slope="0.3" /> 
            </feComponentTransfer>
          </filter>
        </defs>
        <rect x="0" y="0" width="${width}" height="${height}" fill="url(#rainbow)" style="mix-blend-mode: overlay;" />
        <rect x="0" y="0" width="${width}" height="${height}" filter="url(#noise)" style="mix-blend-mode: screen;" />
      </svg>
    `;

        // Note: Sharp support for SVG filters and complex blend modes in SVG input might be limited compared to browser,
        // but basic gradients work. Sharp's own .composite supports blend modes.
        // Better to create a buffer from SVG and composite it with blend mode.

        const holoBuffer = await sharp(Buffer.from(holoOverlay)).toBuffer();

        pipeline = pipeline.composite([
            { input: Buffer.from(svgOverlay), top: 0, left: 0 }, // Re-add text on top of Holo? No, holo should be ON TOP of image but UNDER text?
            // Let's re-order.
        ]);

        // Re-construct pipeline since we want:
        // Base -> Holo -> Text
        pipeline = sharp(baseImageBuffer).resize(width, height);

        pipeline = pipeline.composite([
            { input: holoBuffer, blend: 'overlay' }, // or 'soft-light'
            { input: Buffer.from(svgOverlay) } // Text on top, normal blend
        ]);
    }

    return pipeline.png().toBuffer();
}
