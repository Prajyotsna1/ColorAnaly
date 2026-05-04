/**
 * Smart Recommendations Engine
 * Handles HSL conversions, dynamic color generation, and smart replacements.
 */

/**
 * Converts Hex to HSL
 */
export function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d; break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h *= 60;
    if (h < 0) h += 360;
  }

  return { h, s: s * 100, l: l * 100 };
}

/**
 * Converts HSL to Hex
 */
export function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
}

/**
 * Generates a dynamic "Harmony" palette based on detected skin tone
 */
export function generateDynamicPalette(baseHex, undertone) {
  const { h, s, l } = hexToHsl(baseHex);
  const normalizedUndertone = undertone.toLowerCase();

  let hueShift = 0;
  let satBoost = 0;

  if (normalizedUndertone.includes('warm')) {
    hueShift = +15;
    satBoost = +10;
  } else if (normalizedUndertone.includes('cool')) {
    hueShift = -15;
    satBoost = +10;
  } else if (normalizedUndertone.includes('olive')) {
    hueShift = +25;
    satBoost = -5;
  }

  return [
    { name: 'Your Core Tone', hex: baseHex },
    { name: 'Harmony 1', hex: hslToHex(h + hueShift, s + satBoost, l + 10) },
    { name: 'Harmony 2', hex: hslToHex(h + hueShift + 30, s + 5, l - 10) },
    { name: 'Contrast', hex: hslToHex((h + 180) % 360, s - 10, l + 20) },
    { name: 'Shadow', hex: hslToHex(h, s, l - 20) },
  ];
}

/**
 * Smart Replacement Generator
 * Automatically finds a "better" version of a color to avoid.
 */
export function generateBetterColor(avoidHex, undertone) {
  const { h, s, l } = hexToHsl(avoidHex);
  let newHue = h;
  const ut = undertone.toLowerCase();

  if (ut.includes('warm')) newHue = (h + 20) % 360;
  else if (ut.includes('cool')) newHue = (h - 20 + 360) % 360;
  else if (ut === 'olive') newHue = (h + 40) % 360;

  // Make it more muted and sophisticated
  return hslToHex(newHue, s * 0.7, l);
}

/**
 * Explanation Engine
 */
export function explainColorChoice(undertone, colorName) {
  const ut = undertone.toLowerCase();
  
  if (ut.includes('warm-olive') || ut.includes('olive')) {
    return "This shade neutralizes the green cast in olive skin while adding vibrancy.";
  }
  if (ut.includes('neutral-warm')) {
    return "This color creates a bridge between your warm and neutral characteristics.";
  }
  if (ut.includes('neutral-cool')) {
    return "This muted tone complements your cool lean without overpowering your neutrality.";
  }
  if (ut.includes('warm')) {
    return "This golden-base shade enhances the natural warmth and radiance of your skin.";
  }
  if (ut.includes('cool')) {
    return "This blue-base shade highlights the crisp, clear undertones of your complexion.";
  }
  
  return "This balanced tone harmonizes perfectly with your neutral complexion.";
}
