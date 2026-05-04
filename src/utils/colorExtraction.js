/**
 * Color Extraction using Canvas API
 * 
 * Pipeline:
 *  1. Sample pixels from each skin region (cheek L, cheek R, forehead, nose bridge)
 *  2. Filter shadows & highlights per region
 *  3. Average each region independently (so each contributes equally)
 *  4. Combine region averages → dominant color
 *  5. Optional k-means refinement on all pixels
 */

/**
 * Extract dominant skin color from an image using specified skin regions.
 * @param {HTMLImageElement} imageElement
 * @param {Object} skinRegions - { leftCheek, rightCheek, forehead, noseBridge }
 * @returns {Object} - { dominantRGB, dominantHSV, dominantHSL, dominantHex, ... }
 */
export function extractSkinColor(imageElement, skinRegions) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  canvas.width = imageElement.naturalWidth || imageElement.width;
  canvas.height = imageElement.naturalHeight || imageElement.height;
  ctx.drawImage(imageElement, 0, 0);

  /* -------- Step 1: Per-region sampling + averaging -------- */
  const regionAverages = [];
  let allFilteredPixels = [];

  // Weight each region (cheeks > forehead > nose — cheeks are most reliable)
  const weights = {
    leftCheek: 1.2,
    rightCheek: 1.2,
    forehead: 0.9,
    noseBridge: 0.7,
  };

  Object.entries(skinRegions).forEach(([regionName, region]) => {
    const pixels = sampleRegion(ctx, region);
    const filtered = filterOutliers(pixels);

    if (filtered.length > 0) {
      const avg = averageColor(filtered);
      const weight = weights[regionName] || 1;
      regionAverages.push({ color: avg, weight });
      allFilteredPixels = allFilteredPixels.concat(filtered);
    }
  });

  if (regionAverages.length === 0 || allFilteredPixels.length === 0) {
    return null;
  }

  /* -------- Step 2: Weighted combination of region averages -------- 
   * This is MORE STABLE than raw k-means because:
   * - Each region contributes equally (not biased by pixel count)
   * - Shadow/highlight filtering is per-region
   * - Averaging cancels localized lighting artifacts
   */
  const totalWeight = regionAverages.reduce((sum, ra) => sum + ra.weight, 0);
  const dominant = {
    r: Math.round(regionAverages.reduce((sum, ra) => sum + ra.color.r * ra.weight, 0) / totalWeight),
    g: Math.round(regionAverages.reduce((sum, ra) => sum + ra.color.g * ra.weight, 0) / totalWeight),
    b: Math.round(regionAverages.reduce((sum, ra) => sum + ra.color.b * ra.weight, 0) / totalWeight),
  };

  /* -------- Step 3: K-means refinement (optional cross-check) --------
   * We still run k-means on all pixels to get the largest cluster center.
   * If it's close to our weighted average, we trust the average (more stable).
   * If it's very different, something may be off — we can log a warning.
   */
  const kMeansResult = kMeansDominant(allFilteredPixels, 3);
  const drift = colorDistance(dominant, kMeansResult);

  // Use K-Means when drift is low (means clusters are stable and agree with average)
  // Otherwise prefer weighted average as it's more resilient to per-region outliers
  const finalColor = drift < 15 ? kMeansResult : dominant;

  // Convert to all formats
  const hsv = rgbToHsv(finalColor.r, finalColor.g, finalColor.b);
  const hex = rgbToHex(finalColor.r, finalColor.g, finalColor.b);
  const hsl = rgbToHsl(finalColor.r, finalColor.g, finalColor.b);

  return {
    dominantRGB: finalColor,
    dominantHSV: hsv,
    dominantHSL: hsl,
    dominantHex: hex,
    sampleCount: allFilteredPixels.length,
    regionCount: regionAverages.length,
    kMeansDrift: Math.round(drift),
    allSamples: allFilteredPixels.slice(0, 100),
  };
}

/**
 * Sample RGB pixels from a rectangular region on the canvas.
 */
function sampleRegion(ctx, region) {
  const { x, y, width, height } = region;

  if (width <= 0 || height <= 0) return [];

  // Clamp values
  const sx = Math.max(0, x);
  const sy = Math.max(0, y);
  const sw = Math.max(1, width);
  const sh = Math.max(1, height);

  try {
    const imageData = ctx.getImageData(sx, sy, sw, sh);
    const data = imageData.data;
    const pixels = [];

    // Sample every 2nd pixel for performance
    for (let i = 0; i < data.length; i += 8) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a > 200) {
        // Only opaque pixels
        pixels.push({ r, g, b });
      }
    }

    return pixels;
  } catch {
    return [];
  }
}

/**
 * Filter out pixels that are too dark (shadows) or too bright (highlights/glare).
 * Also filter non-skin tones.
 */
function filterOutliers(pixels) {
  return pixels.filter((p) => {
    const brightness = (p.r + p.g + p.b) / 3;

    // Remove very dark (< 5) and very bright (> 248)
    // Threshold lowered to 5 to ensure truly deep skin isn't filtered out as 'shadow'
    if (brightness < 5 || brightness > 248) return false;

    // Basic skin tone filter: red channel should generally be highest
    // for most skin tones. However, for very dark skin, the channels 
    // often converge or green/blue can be relatively high due to melanin.
    if (brightness > 45) {
      if (p.r < p.b - 15) return false; // clearly blue/purple = not skin
      if (p.r < p.g - 25) return false; // relaxed from -15 to -25 for olive/deep tones
    }

    return true;
  });
}

/**
 * Simple k-means clustering to find dominant color.
 * @param {Array} pixels - Array of {r, g, b}
 * @param {number} k - Number of clusters
 * @returns {{r, g, b}} - The dominant cluster center
 */
function kMeansDominant(pixels, k) {
  if (pixels.length === 0) {
    return { r: 180, g: 140, b: 110 }; // fallback
  }

  if (pixels.length < k) {
    // Average all
    return averageColor(pixels);
  }

  // Initialize centroids by picking evenly spaced pixels
  let centroids = [];
  const step = Math.floor(pixels.length / k);
  for (let i = 0; i < k; i++) {
    centroids.push({ ...pixels[i * step] });
  }

  // Run 10 iterations of k-means
  for (let iter = 0; iter < 10; iter++) {
    const clusters = Array.from({ length: k }, () => []);

    // Assign each pixel to nearest centroid
    pixels.forEach((pixel) => {
      let minDist = Infinity;
      let nearest = 0;

      centroids.forEach((c, i) => {
        const dist = colorDistance(pixel, c);
        if (dist < minDist) {
          minDist = dist;
          nearest = i;
        }
      });

      clusters[nearest].push(pixel);
    });

    // Update centroids
    centroids = clusters.map((cluster, i) =>
      cluster.length > 0 ? averageColor(cluster) : centroids[i]
    );
  }

  // Return the centroid of the largest cluster
  const clusterSizes = centroids.map((_, i) => {
    let count = 0;
    pixels.forEach((pixel) => {
      let minDist = Infinity;
      let nearest = 0;
      centroids.forEach((c, j) => {
        const dist = colorDistance(pixel, c);
        if (dist < minDist) {
          minDist = dist;
          nearest = j;
        }
      });
      if (nearest === i) count++;
    });
    return count;
  });

  const largestIdx = clusterSizes.indexOf(Math.max(...clusterSizes));
  return centroids[largestIdx];
}

/**
 * Euclidean distance between two colors.
 */
function colorDistance(a, b) {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

/**
 * Average color of a set of pixels.
 */
function averageColor(pixels) {
  const sum = pixels.reduce(
    (acc, p) => ({ r: acc.r + p.r, g: acc.g + p.g, b: acc.b + p.b }),
    { r: 0, g: 0, b: 0 }
  );
  return {
    r: Math.round(sum.r / pixels.length),
    g: Math.round(sum.g / pixels.length),
    b: Math.round(sum.b / pixels.length),
  };
}

/* ═══════════════════════════════════════════
   COLOR SPACE CONVERSIONS
   ═══════════════════════════════════════════ */

/**
 * RGB to HSV conversion.
 */
export function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : Math.round((delta / max) * 100);
  const v = Math.round(max * 100);

  return { h, s, v };
}

/**
 * RGB to HSL conversion.
 */
export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0,
    s = 0;

  if (max !== min) {
    const delta = max - min;
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    if (max === r) h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / delta + 2) / 6;
    else h = ((r - g) / delta + 4) / 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * RGB to hex string.
 */
export function rgbToHex(r, g, b) {
  const toHex = (c) => Math.round(c).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}
