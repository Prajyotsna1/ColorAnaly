/**
 * Undertone Classifier v2 — Improved with brightness normalization
 * 
 * Key improvements over v1:
 *  - RGB normalization (divide by max channel) removes lighting dependency
 *  - Neutral-Warm and Neutral-Cool hybrid categories
 *  - Olive detection with green-dominance guard
 *  - Better skin depth using HSL lightness
 *  - Manual adjustment support via adjustAndReclassify()
 * 
 * Categories (8 total):
 *  - Warm          : Strong golden/yellow undertones
 *  - Cool          : Pink/blue undertones
 *  - Neutral       : Balanced, no bias
 *  - Neutral-Warm  : Slightly warm-leaning neutral
 *  - Neutral-Cool  : Slightly cool-leaning neutral
 *  - Olive         : Green tint (classic olive)
 *  - Warm Olive    : Olive base + warm lean
 *  - Cool Olive    : Olive base + cool/ashy lean
 */

/**
 * Classify the skin undertone from extracted color data.
 * @param {Object} colorData - Output from extractSkinColor()
 * @returns {Object} Classification result
 */
export function classifyUndertone(colorData) {
  const { dominantRGB, dominantHSV, dominantHSL } = colorData;
  return runClassifier(dominantRGB, dominantHSV, dominantHSL, colorData.dominantHex);
}

/**
 * Re-classify with a warm/cool manual adjustment.
 * adjustment: positive = warmer, negative = cooler (range: -30 to +30)
 */
export function adjustAndReclassify(colorData, adjustment) {
  const { r, g, b } = colorData.dominantRGB;

  // Shift red up and blue down for warmer, vice-versa for cooler
  // Adjustment dampened by 0.5 for more precise, natural control
  const adjR = Math.min(255, Math.max(0, r + adjustment * 0.5));
  const adjB = Math.min(255, Math.max(0, b - adjustment * 0.5));
  const adjG = g; 

  const adjustedRGB = { r: Math.round(adjR), g: Math.round(adjG), b: Math.round(adjB) };
  const adjustedHSV = rgbToHsvInternal(adjR, adjG, adjB);
  const adjustedHSL = rgbToHslInternal(adjR, adjG, adjB);
  const adjustedHex = rgbToHexInternal(adjR, adjG, adjB);

  return runClassifier(adjustedRGB, adjustedHSV, adjustedHSL, adjustedHex);
}

/* ═══════════════════════════════════════════
   CORE CLASSIFIER ENGINE
   ═══════════════════════════════════════════ */

function runClassifier(dominantRGB, dominantHSV, dominantHSL, dominantHex) {
  const { r, g, b } = dominantRGB;
  const { h, s, v } = dominantHSV;

  /* -------- LIGHTING PREPROCESSING (White Balance Correction) --------
   * If warm indoor lighting is detected, we preemptively scale down R and G
   * to compensate for the yellow cast before normalization.
   */
  const lighting = detectLightingQuality(dominantRGB, dominantHSV);
  let correctedR = r;
  let correctedG = g;
  let correctedB = b;

  if (lighting.status === 'caution') {
    correctedR *= 0.95; // Reduce red bias
    correctedG *= 0.98; // Reduce yellow/green bias
    correctedB *= 1.05; // Slightly boost blue to counter yellow
  }

  /* -------- NORMALIZATION -------- */
  const maxCh = Math.max(correctedR, correctedG, correctedB) || 1;
  const rN = correctedR / maxCh;
  const gN = correctedG / maxCh;
  const bN = correctedB / maxCh;

  // Normalized ratios
  const nTotal = rN + gN + bN || 1;
  const rRatio = rN / nTotal;
  const gRatio = gN / nTotal;
  const bRatio = bN / nTotal;

  // Normalized differences
  const rMinusB = rN - bN;
  const rMinusG = rN - gN;
  const gMinusB = gN - bN;

  // Normalized spread
  const spread = Math.max(rN, gN, bN) - Math.min(rN, gN, bN);
  const absoluteSpread = Math.max(correctedR, correctedG, correctedB) - Math.min(correctedR, correctedG, correctedB);

  /* -------- SKIN DEPTH (HSL lightness-based) -------- */
  const lightness = dominantHSL.l;
  let depth;
  if (lightness >= 78) depth = 'Fair';
  else if (lightness >= 62) depth = 'Light';
  else if (lightness >= 48) depth = 'Medium';
  else if (lightness >= 30) depth = 'Medium Deep';
  else depth = 'Deep';

  /* -------- SCORE BASE TYPES -------- */
  const scores = {
    warm: scoreWarm(rRatio, gRatio, bRatio, rMinusB, rMinusG, spread, h, s, lightness, absoluteSpread),
    cool: scoreCool(rRatio, gRatio, bRatio, rMinusB, spread, h, s, lightness, absoluteSpread),
    neutral: scoreNeutral(rRatio, gRatio, bRatio, rMinusB, rMinusG, gMinusB, spread, lightness, absoluteSpread),
    olive: scoreOlive(rRatio, gRatio, bRatio, gMinusB, rMinusG, spread, h, s),
    warmOlive: scoreWarmOlive(rRatio, gRatio, bRatio, gMinusB, rMinusG, rMinusB, h, s),
    coolOlive: scoreCoolOlive(rRatio, gRatio, bRatio, gMinusB, rMinusB, spread, s),
  };

  /* -------- FIND TOP SCORES -------- */
  const entries = Object.entries(scores);
  entries.sort((a, b) => b[1] - a[1]);

  let [topType, topScore] = entries[0];
  const [secondType, secondScore] = entries[1];

  /* -------- LIGHTING PENALTY & TIE-BREAKERS -------- */
  // If lighting is warm and result is barely 'warm', favor neutral/hybrid
  if (lighting.status === 'caution' && topType === 'warm') {
    topScore -= 25; // Increased penalty for warm lighting
  }

  // Detect highlights/overexposure highlights
  if (dominantHSV.v > 85 && dominantHSV.s < 25 && topType === 'warm') {
    topScore -= 15; 
  }

  /* -------- TIE-BREAKER: WARM VS OLIVE -------- */
  if (topType.toLowerCase().includes('olive') && scores.warm > topScore - 12) {
    topType = 'warm';
    topScore = scores.warm;
  }

  /* -------- HYBRID DETECTION (Neutral-Warm / Neutral-Cool) --------
   * High-sensitivity hybrid detection (0.55) to favor 'Neutral-Warm' in balanced cases
   */
  /* -------- HYBRID DETECTION (Neutral-Warm / Neutral-Cool) --------
   * High-sensitivity hybrid detection to favor 'Neutral-Warm' in balanced cases.
   * If Neutral wins but Warm or WarmOlive is a close second, it's Neutral-Warm.
   */
  const baseThreshold = lighting.status === 'caution' ? 0.52 : 0.65;
  
  console.log(`Undertone Scores [Lighting: ${lighting.label}]:`);
  console.table(scores);

  const isWarmSignal = (type) => type === 'warm' || type === 'warmOlive';
  const isCoolSignal = (type) => type === 'cool' || type === 'coolOlive';

  if (topType === 'neutral' || topType === 'warm') {
    if (isWarmSignal(secondType) && secondScore > topScore * baseThreshold) {
      topType = 'neutralWarm';
    } else if (isCoolSignal(secondType) && secondScore > topScore * baseThreshold) {
      topType = 'neutralCool';
    }
  } else if (isWarmSignal(topType) && secondType === 'neutral' && secondScore > topScore * baseThreshold) {
    topType = 'neutralWarm';
  } else if (isCoolSignal(topType) && secondType === 'neutral' && secondScore > topScore * baseThreshold) {
    topType = 'neutralCool';
  }

  // FINAL SAFETY: Slight warmth override
  if (
    topType === 'neutral' &&
    (scores.warm > scores.cool) &&
    scores.warm > 18 &&
    scores.warm > scores.neutral * 0.75
  ) {
    topType = 'neutralWarm';
    topScore = scores.warm; // ✅ FIX: update score
  }

  /* -------- CONFIDENCE -------- */
  const totalScore = entries.reduce((sum, [, s]) => sum + s, 0) || 1;
  let confidence = Math.min(0.92, topScore / totalScore + (topScore - secondScore) / 80);
  confidence = Math.max(0.40, confidence);

  if (topType === 'neutralWarm' || topType === 'neutralCool') {
    confidence = Math.min(confidence, 0.75);
  }


  /* -------- LABELS -------- */
  const undertoneLabels = {
    warm: 'Warm',
    cool: 'Cool',
    neutral: 'Neutral',
    neutralWarm: 'Neutral-Warm',
    neutralCool: 'Neutral-Cool',
    olive: 'Olive',
    warmOlive: 'Warm Olive',
    coolOlive: 'Cool Olive',
  };

  return {
    undertone: undertoneLabels[topType] || 'Neutral',
    undertoneKey: topType,
    confidence: Math.round(confidence * 100) / 100,
    skinDepth: depth,
    dominantHex,
    dominantRGB,
    dominantHSV,
    dominantHSL,
    scores,
    details: {
      hue: h,
      saturation: s,
      value: v,
      lightness,
      rRatio: Math.round(rRatio * 1000) / 1000,
      gRatio: Math.round(gRatio * 1000) / 1000,
      bRatio: Math.round(bRatio * 1000) / 1000,
      spread: Math.round(spread * 1000) / 1000,
      rMinusB: Math.round(rMinusB * 1000) / 1000,
      gMinusB: Math.round(gMinusB * 1000) / 1000,
    },
    lighting,
  };
}

/**
 * Detect lighting conditions that might impact analysis accuracy.
 */
function detectLightingQuality(rgb, hsv) {
  const { r, g, b } = rgb;
  const { h, s, v } = hsv;

  // Poor lighting: total darkness
  if (v < 28) {
    return { status: 'poor', label: 'Low Lighting', warning: 'Low lighting detected. Analysis may be less accurate.', icon: '🌑' };
  }
  
  // Warm Lighting: Yellowish tint (Hue 18-55, moderate saturation)
  // Threshold lowered to 18 to catch warmer indoor casts (incandescent)
  if (s > 12 && h >= 18 && h < 55) {
    return { status: 'caution', label: 'Warm Lighting', warning: 'Warm indoor lighting detected. Compensating for yellow cast...', icon: '💡' };
  }

  // Artificial Highlight: Very bright points can wash out color
  if (v > 92 && s < 10) {
    return { status: 'caution', label: 'High Glare', warning: 'Overexposure detected. Analysis may favor neutral tones.', icon: '📸' };
  }

  return { status: 'good', label: 'Good Lighting', warning: null, icon: '✅' };
}

/* ═══════════════════════════════════════════
   SCORING FUNCTIONS (normalized 0-1 inputs)
   Each returns 0-100 score
   ═══════════════════════════════════════════ */

function scoreWarm(rRatio, gRatio, bRatio, rMinusB, rMinusG, spread, h, s, lightness, absoluteSpread) {
  let score = 0;
  const isDeep = lightness < 40;
  
  // KEY WARM INDICATOR: Red significantly over Blue
  // Thresholds increased to reduce over-triggering
  if (rMinusB > 0.32) score += 20; // Was 0.26
  else if (rMinusB > 0.20) score += 14; // Was 0.18
  else if (rMinusB > 0.12) score += 5; // Was 0.10

  // Absolute difference check
  if (isDeep) {
    if (absoluteSpread > 55) score += 15; // Was 45
    else if (absoluteSpread < 30) score -= 15; // Was 25
  } else {
    if (absoluteSpread > 75) score += 15; // Was 65
  }

  // Red ratio high (Strictness increased)
  if (rRatio > 0.44) score += 10;
  else if (rRatio > 0.40) score += 5;

  // Hue in warm zone
  if (h >= 28 && h <= 45) score += 12;
  else if (h >= 18 && h <= 55) score += 6;

  // Saturation (vividness check)
  if (s >= 40 && s <= 65) score += 10;
  else if (s >= 30) score += 5;

  // Penalize green/blue dominance
  if (gRatio > rRatio) score -= 25;
  if (bRatio > 0.32) score -= 25;
  
  // Penalize low spread
  if (spread < 0.15) score -= 15;

  return Math.max(0, Math.min(100, score));
}

function scoreCool(rRatio, gRatio, bRatio, rMinusB, spread, h, s, lightness, absoluteSpread) {
  let score = 0;
  const isDeep = lightness < 40;

  // Blue close to or exceeding red
  // For deep skin, we look for very narrow Red-Blue gap
  if (rMinusB < 0.04) score += 30;
  else if (rMinusB < 0.09) score += 15;

  // Blue ratio
  if (bRatio > 0.34) score += 15;
  else if (bRatio > 0.32) score += 8;

  // Absolute check for deep skin
  if (isDeep && absoluteSpread < 15) {
    score += 15; // dark skin often leans cool/neutral if channels are tight
  }

  // Pink/Rose indicators
  if (rRatio > gRatio && bRatio > gRatio - 0.03) score += 15;

  // Hue in cool/pink range
  if (h >= 320 || (h >= 0 && h <= 15)) score += 12;
  else if (h >= 290 || h <= 25) score += 6;

  // Penalize warm indicators
  if (rMinusB > 0.20) score -= 25;
  if (h > 30 && h < 60) score -= 15;

  return Math.max(0, Math.min(100, score));
}

function scoreNeutral(rRatio, gRatio, bRatio, rMinusB, rMinusG, gMinusB, spread, lightness, absoluteSpread) {
  let score = 0;
  const isDeep = lightness < 45;

  // LOW SPREAD is the #1 neutral indicator
  // Requirements loosened for deeper skin
  if (absoluteSpread < 25) score += 28;
  else if (absoluteSpread < 45) score += 20;
  else if (absoluteSpread < 60) score += 10;

  if (spread < 0.15) score += 20;
  else if (spread < 0.22) score += 10;

  // Ratios close to 0.333
  const avgDev = (
    Math.abs(rRatio - 0.333) +
    Math.abs(gRatio - 0.333) +
    Math.abs(bRatio - 0.333)
  ) / 3;

  if (avgDev < 0.05) score += 25; // Was 0.03
  else if (avgDev < 0.10) score += 15; // Was 0.06

  // Small channel differences
  // Threshold increased to 0.18 to allow for 'Neutral-Warm' balanced skin
  if (Math.abs(rMinusB) < 0.18 && Math.abs(rMinusG) < 0.18) {
    score += 20;
  }

  // Deep skin bias: if it's very dark and balanced, it's likely neutral/cool-leaning
  if (isDeep && absoluteSpread < 45) score += 15; // Was 35

  return Math.max(0, Math.min(100, score));
}

function scoreOlive(rRatio, gRatio, bRatio, gMinusB, rMinusG, spread, h, s) {
  let score = 0;

  // STRICT GREEN DOMINANCE: Green must be clearly ahead of the next highest channel
  const nextMax = Math.max(rRatio, bRatio);
  const greenDominance = gRatio - nextMax;
  
  if (greenDominance > 0.03) score += 25;
  else if (gRatio > rRatio && gRatio > bRatio) score += 10;

  // Green elevated relative to blue
  if (gMinusB > 0.08) score += 15;
  if (gMinusB > 0.12) score += 8;

  // Hue in yellow-green range
  if (h >= 55 && h <= 110) score += 18;
  else if (h >= 35 && h <= 130) score += 8;

  // Mutedness check: Olive skin is inherently muted (grey-green cast)
  // Vivid skin (s > 45) is likely NOT olive
  if (s < 35) score += 10;
  else if (s > 50) score -= 20;

  // Green close to red (not dominated by red)
  if (Math.abs(rMinusG) < 0.06) score += 8;

  // Penalize if red is clearly dominant
  if (rMinusG > 0.12) score -= 15;

  return Math.max(0, Math.min(100, score));
}

function scoreWarmOlive(rRatio, gRatio, bRatio, gMinusB, rMinusG, rMinusB, h, s) {
  let score = 0;

  // Olive base: green elevated over blue
  if (gMinusB > 0.05) score += 12;
  if (gRatio > 0.33) score += 8;

  // Warm lean: hue 30-85° (warm-olive zone)
  if (h >= 30 && h <= 85) score += 18;
  else if (h >= 20 && h <= 100) score += 8;

  // Red slightly dominant but green close
  if (rMinusG > 0.03 && rMinusG < 0.14) score += 15;

  // Warm indicator: R > B clearly
  if (rMinusB > 0.12) score += 12;

  // Penalize no green
  if (gMinusB < 0.03) score -= 10;

  // Penalize no warmth
  if (rMinusG < 0) score -= 8;

  return Math.max(0, Math.min(100, score));
}

function scoreCoolOlive(rRatio, gRatio, bRatio, gMinusB, rMinusB, spread, s) {
  let score = 0;

  // Olive base: green elevated
  if (gMinusB > 0.03) score += 12;
  if (gRatio > 0.33) score += 8;

  // Cool lean: low saturation (grey/ashy)
  if (s < 18) score += 20;
  else if (s < 28) score += 12;

  // Low spread (muted, grey overlay)
  if (spread < 0.15) score += 12;

  // Slight green tint
  if (gMinusB > 0.02 && gMinusB < 0.12) score += 8;

  // Not strongly warm
  if (rMinusB < 0.10) score += 8;

  // Penalize vivid saturation
  if (s > 35) score -= 15;

  return Math.max(0, Math.min(100, score));
}

/* ═══════════════════════════════════════════
   HELPER: color conversions (internal)
   ═══════════════════════════════════════════ */

function rgbToHsvInternal(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  return { h, s: Math.round((max === 0 ? 0 : d / max) * 100), v: Math.round(max * 100) };
}

function rgbToHslInternal(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToHexInternal(r, g, b) {
  const toHex = (c) => Math.round(c).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/* ═══════════════════════════════════════════
   PUBLIC: Emoji & Description helpers
   ═══════════════════════════════════════════ */

/**
 * Get an emoji for the undertone type.
 */
export function getUndertoneEmoji(undertone) {
  const emojiMap = {
    Warm: '☀️',
    Cool: '❄️',
    Neutral: '⚖️',
    'Neutral-Warm': '🌤️',
    'Neutral-Cool': '🌥️',
    Olive: '🌿',
    'Warm Olive': '🌿',
    'Cool Olive': '🍃',
  };
  return emojiMap[undertone] || '🎨';
}

/**
 * Get a short description for the undertone.
 */
export function getUndertoneDescription(undertone) {
  const descriptions = {
    Warm: 'Your skin has warm, golden-yellow undertones. You likely look great in earthy, rich hues.',
    Cool: 'Your skin has cool, pink-blue undertones. Jewel tones and icy shades complement you beautifully.',
    Neutral: 'Your skin has a balanced mix of warm and cool undertones. You can pull off a wide range of colors.',
    'Neutral-Warm': 'Your skin is mostly neutral with a subtle warm lean — you have incredible versatility with a golden edge.',
    'Neutral-Cool': 'Your skin is mostly neutral with a subtle cool lean — most colors work, with a slight pink-cool affinity.',
    Olive: 'Your skin has a distinctive green-tinged undertone. You shine in rich, earthy, and muted colors.',
    'Warm Olive': 'Your skin has an olive base with warm, golden leanings. Think golden greens and warm earth tones.',
    'Cool Olive': 'Your skin has an olive base with cool, ashy leanings. Muted, sophisticated tones work best for you.',
  };
  return descriptions[undertone] || 'Your unique skin tone has been analyzed.';
}
