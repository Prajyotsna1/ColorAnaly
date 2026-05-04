/**
 * Color Recommendations Database v5 (Ultimate Edition)
 * Maps each undertone + skin depth to highly detailed, balanced color palettes.
 * Features: Staples, Accents, Universal Colors, and specialized Hybrid support.
 */

const universalColors = [
  { name: 'True Red', hex: '#CC3333' },
  { name: 'Soft Navy', hex: '#2C3E6B' },
  { name: 'Medium Teal', hex: '#008B8B' },
  { name: 'Pure White', hex: '#FFFFFF' },
];

const palettes = {
  warm: {
    Light: {
      bestColors: [
        { name: 'Peach', hex: '#FFCBA4' }, { name: 'Warm Coral', hex: '#E8735A' },
        { name: 'Golden Yellow', hex: '#FFD700' }, { name: 'Apricot', hex: '#FBCEB1' },
        { name: 'Marigold', hex: '#EAA221' }, { name: 'Honey', hex: '#E3A857' },
        { name: 'Ivory', hex: '#FFFFF0' }, { name: 'Cream', hex: '#FFFDD0' },
        { name: 'Light Camel', hex: '#C19A6B' }, { name: 'Sage Green', hex: '#9CAF88' },
        { name: 'Aquamarine', hex: '#7FFFD4' }, { name: 'Clear Gold', hex: '#E6BE8A' },
        { name: 'Light Tomato', hex: '#F05E5E' }, { name: 'Champagne', hex: '#F7E7CE' },
        { name: 'Warm Beige', hex: '#F5F5DC' },
      ],
      clothingSuggestions: ['Clear, bright colors like peach and marigold make your skin glow.', 'Warm-toned denims and light camel coats look excellent.'],
    },
    Deep: {
      bestColors: [
        { name: 'Rust', hex: '#B7410E' }, { name: 'Mustard', hex: '#D4A017' },
        { name: 'Terracotta', hex: '#C85A3E' }, { name: 'Burnt Orange', hex: '#CC5500' },
        { name: 'Olive Green', hex: '#6B8E23' }, { name: 'Golden Brown', hex: '#996515' },
        { name: 'Chocolate', hex: '#5C3317' }, { name: 'Rich Teal', hex: '#008080' },
        { name: 'Deep Burgundy', hex: '#800020' }, { name: 'Forest Green', hex: '#228B22' },
        { name: 'Amber', hex: '#FFBF00' }, { name: 'Brick Red', hex: '#CB4154' },
        { name: 'Espresso', hex: '#3E2723' }, { name: 'Deep Camel', hex: '#966919' },
        { name: 'Burnt Sienna', hex: '#A0522D' },
      ],
      clothingSuggestions: ['Rich, earthy tones like mustard and rust complement your depth.', 'Deep warm neutrals like chocolate brown outperform black for you.'],
    },
    common: {
      avoidColors: [
        { name: 'Icy Pink', hex: '#F7C6D5', reason: 'Clashes with warm undertones' },
        { name: 'Cool Grey', hex: '#9E9E9E', reason: 'Drains warmth from your complexion' },
        { name: 'Stark White', hex: '#FFFFFF', reason: 'Too harsh; try ivory instead' },
        { name: 'Electric Blue', hex: '#0000FF', reason: 'Too cool-toned, creates a harsh contrast' },
        { name: 'Icy Lavender', hex: '#E6E6FA', reason: 'Too "cold" for your golden skin' },
      ],
      metals: ['Gold', 'Rose Gold', 'Copper'],
      metalHexes: ['#FFD700', '#B76E79', '#B87333'],
    }
  },

  neutralWarm: {
    Light: {
      bestColors: [
        { name: 'Soft Peach', hex: '#FFDAB9' }, { name: 'Soft Coral', hex: '#E8866A' },
        { name: 'Warm Taupe', hex: '#B09A7E' }, { name: 'Sage Green', hex: '#9CAF88' },
        { name: 'Champagne', hex: '#F7E7CE' }, { name: 'Dusty Rose', hex: '#C9A0A0' },
        { name: 'Muted Gold', hex: '#D4A574' }, { name: 'Jade Green', hex: '#00A86B' },
        { name: 'Ivory', hex: '#FFFFF0' }, { name: 'Warm Beige', hex: '#F5F5DC' },
        { name: 'Camel', hex: '#C19A6B' }, { name: 'Cream', hex: '#FDF5E6' },
        { name: 'Stone Gray', hex: '#928E85' }, { name: 'Dusty Coral', hex: '#E8866A' },
        { name: 'Clay', hex: '#CC7E5D' },
      ],
      clothingSuggestions: ['You suit both warm and cool neutrals — lean towards camel and soft sage.', 'Mix warm and cool pieces for a sophisticated, balanced look.'],
    },
    Deep: {
      bestColors: [
        { name: 'Terracotta', hex: '#C85A3E' }, { name: 'Muted Rust', hex: '#B7410E' },
        { name: 'Olive Green', hex: '#6B8E23' }, { name: 'Warm Teal', hex: '#008080' },
        { name: 'Soft Amber', hex: '#D4A574' }, { name: 'Dusty Coral', hex: '#E8866A' },
        { name: 'Deep Khaki', hex: '#BDB76B' }, { name: 'Berry Red', hex: '#991919' },
        { name: 'Chocolate', hex: '#5C3317' }, { name: 'Deep Teal', hex: '#006666' },
        { name: 'Deep Camel', hex: '#966919' }, { name: 'Golden Brown', hex: '#996515' },
        { name: 'Espresso', hex: '#3E2723' }, { name: 'Ash Brown', hex: '#665D1E' },
        { name: 'Warm Beige', hex: '#F5F5DC' },
      ],
      clothingSuggestions: ['Rich, muted earth tones complement your subtle warmth.', 'Warm berry and deep teal are your best accent colors.'],
    },
    common: {
      avoidColors: [
        { name: 'Neon Yellow', hex: '#CCFF00', reason: 'Too intense for balanced skin' },
        { name: 'Icy Blue', hex: '#C6E7FF', reason: 'Too cool for your warm-balanced edge' },
      ],
      metals: ['Gold', 'Rose Gold', 'Silver'],
      metalHexes: ['#FFD700', '#B76E79', '#C0C0C0'],
    }
  },

  neutralCool: {
    Light: {
      bestColors: [
        { name: 'Lavender', hex: '#E6E6FA' }, { name: 'Soft Blue', hex: '#87CEEB' },
        { name: 'Mauve', hex: '#C292A1' }, { name: 'Cool Taupe', hex: '#8E8D8A' },
        { name: 'Dusty Rose', hex: '#C9A0A0' }, { name: 'Soft Navy', hex: '#394D6D' },
        { name: 'Muted Teal', hex: '#367588' }, { name: 'Silver Gray', hex: '#C0C0C0' },
        { name: 'Soft White', hex: '#F0EDE8' }, { name: 'Pewter Blue', hex: '#6C8CA7' },
        { name: 'Rose Quartz', hex: '#F7CAC9' }, { name: 'Icy Mint', hex: '#F0FFF0' },
        { name: 'Cool Beige', hex: '#DCDCDC' }, { name: 'Slate Blue', hex: '#6A7B8B' },
        { name: 'Periwinkle', hex: '#CCCCFF' },
      ],
      clothingSuggestions: ['Muted, cool-toned colors like lavender and dusty blue are very harmonious.', 'True white suits you well; avoid yellowed creams.'],
    },
    Deep: {
      bestColors: [
        { name: 'Plum', hex: '#8E4585' }, { name: 'Slate Blue', hex: '#6A7FDB' },
        { name: 'Berry', hex: '#A3446A' }, { name: 'Cool Teal', hex: '#367588' },
        { name: 'Charcoal', hex: '#36454F' }, { name: 'Midnight Navy', hex: '#1B2A4A' },
        { name: 'Deep Burgundy', hex: '#6E2C3A' }, { name: 'Pine Green', hex: '#01796F' },
        { name: 'Royal Blue', hex: '#4169E1' }, { name: 'Muted Rose', hex: '#B08D8D' },
        { name: 'Pewter', hex: '#8E9196' }, { name: 'Steel Gray', hex: '#708090' },
        { name: 'Black', hex: '#000000' }, { name: 'Cool Espresso', hex: '#2B2321' },
        { name: 'Dark Slate', hex: '#2F4F4F' },
      ],
      clothingSuggestions: ['Rich, cool-muted tones are your strength — nothing too bright or vivid.', 'Black and charcoal are excellent staples for your complexion.'],
    },
    common: {
      avoidColors: [
        { name: 'Bright Orange', hex: '#FF8C00', reason: 'Too warm and saturated' },
        { name: 'Golden Yellow', hex: '#FFD700', reason: 'Warmth clashes with your cool edge' },
      ],
      metals: ['Silver', 'White Gold', 'Rose Gold'],
      metalHexes: ['#C0C0C0', '#E8E8E8', '#B76E79'],
    }
  },

  olive: {
    Light: {
      bestColors: [
        { name: 'Muted Sage', hex: '#87A878' }, { name: 'Soft Teal', hex: '#5F9EA0' },
        { name: 'Warm Taupe', hex: '#B09A7E' }, { name: 'Moss Green', hex: '#8A9A5B' },
        { name: 'Dusty Plum', hex: '#9E7B8A' }, { name: 'Cool Forest', hex: '#2D5A3D' },
        { name: 'Stone Gray', hex: '#6D7B82' }, { name: 'Eucalyptus', hex: '#5F8A6E' },
        { name: 'Khaki', hex: '#C3B091' }, { name: 'Muted Camel', hex: '#C19A6B' },
        { name: 'Antique Gold', hex: '#C5B358' }, { name: 'Ash Brown', hex: '#665D1E' },
        { name: 'Olive Gray', hex: '#808069' }, { name: 'Pale Mustard', hex: '#E1AD01' },
        { name: 'Muted Rose', hex: '#B08D8D' },
      ],
      clothingSuggestions: ['Sophisticated, muted tones are your strength.', 'Cool greens and dusty berries harmonize with your olive base.'],
    },
    Deep: {
      bestColors: [
        { name: 'Deep Olive', hex: '#556B2F' }, { name: 'Emerald', hex: '#046A38' },
        { name: 'Rust', hex: '#A0522D' }, { name: 'Burnt Sienna', hex: '#A0522D' },
        { name: 'Chocolate', hex: '#5C3317' }, { name: 'Deep Burgundy', hex: '#722F37' },
        { name: 'Deep Teal', hex: '#0D7377' }, { name: 'Midnight Blue', hex: '#0A1E3E' },
        { name: 'Charcoal', hex: '#36454F' }, { name: 'Army Green', hex: '#4B5320' },
        { name: 'Deep Amber', hex: '#FFBF00' }, { name: 'Chestnut', hex: '#74512D' },
        { name: 'Pewter', hex: '#8E9196' }, { name: 'Deep Plum', hex: '#311432' },
        { name: 'Dark Mahogany', hex: '#420C09' },
      ],
      clothingSuggestions: ['Rich, saturated earth tones complement the natural depth of olive skin.', 'Jewel tones like emerald and deep ruby are striking.'],
    },
    common: {
      avoidColors: [
        { name: 'Pastel Pink', hex: '#FFD1DC', reason: 'Highlights green tones harshly' },
        { name: 'Neon Green', hex: '#39FF14', reason: 'Amplifies green cast unnaturally' },
        { name: 'Baby Blue', hex: '#89CFF0', reason: 'Washes out olive complexions' },
      ],
      metals: ['Gold', 'Antique Bronze', 'Copper'],
      metalHexes: ['#FFD700', '#816C2E', '#B87333'],
    }
  },

  cool: {
    Light: {
      bestColors: [
        { name: 'Soft Lavender', hex: '#E6E6FA' }, { name: 'Sky Blue', hex: '#87CEEB' },
        { name: 'Powder Pink', hex: '#FFB2D1' }, { name: 'Mint Green', hex: '#98FF98' },
        { name: 'Silver Grey', hex: '#C0C0C0' }, { name: 'Soft Navy', hex: '#2C3E6B' },
        { name: 'Icy Blue', hex: '#AFDBF5' }, { name: 'Pale Mauve', hex: '#DDA0DD' },
        { name: 'Cool White', hex: '#F0F8FF' }, { name: 'Light Gray', hex: '#D3D3D3' },
        { name: 'Soft Turquoise', hex: '#AFEEEE' }, { name: 'Rose Water', hex: '#F4C2C2' },
      ],
      clothingSuggestions: ['Muted, cool pastels look very harmonious on you.'],
    },
    Deep: {
      bestColors: [
        { name: 'Royal Blue', hex: '#4169E1' }, { name: 'Emerald', hex: '#50C878' },
        { name: 'Deep Plum', hex: '#5C3A6E' }, { name: 'Burgundy', hex: '#800020' },
        { name: 'True Black', hex: '#000000' }, { name: 'Stark White', hex: '#FFFFFF' },
        { name: 'Midnight Navy', hex: '#191970' }, { name: 'Crimson', hex: '#DC143C' },
        { name: 'Electric Blue', hex: '#0000FF' }, { name: 'Silver', hex: '#C0C0C0' },
        { name: 'Pine Green', hex: '#01796F' }, { name: 'Charcoal', hex: '#36454F' },
      ],
      clothingSuggestions: ['Deep, high-contrast jewel tones are your power colors.'],
    },
    common: {
      avoidColors: [
        { name: 'Orange', hex: '#FF8C00', reason: 'Warm undertone clashes' },
        { name: 'Golden Yellow', hex: '#FFD700', reason: 'Too warm and sallow-making' },
      ],
      metals: ['Silver', 'Platinum'],
      metalHexes: ['#C0C0C0', '#E5E4E2'],
    }
  },

  neutral: {
    Light: {
      bestColors: [
        { name: 'Soft Sage', hex: '#9CAF88' }, { name: 'Dusty Rose', hex: '#C9A0A0' },
        { name: 'Jade Green', hex: '#00A86B' }, { name: 'Warm Taupe', hex: '#B09A7E' },
        { name: 'Ivory', hex: '#FFFFF0' }, { name: 'Stone Gray', hex: '#A2A2A1' },
        { name: 'Soft Navy', hex: '#4682B4' }, { name: 'Muted Coral', hex: '#E9967A' },
        { name: 'Sky Blue', hex: '#87CEEB' }, { name: 'Taupe Beige', hex: '#D2B48C' },
        { name: 'Off-White', hex: '#FAF9F6' }, { name: 'Muted Teal', hex: '#40826D' },
      ],
    },
    Deep: {
      bestColors: [
        { name: 'Deep Teal', hex: '#006666' }, { name: 'Charcoal', hex: '#36454F' },
        { name: 'True Red', hex: '#CC3333' }, { name: 'Navy Blue', hex: '#1B2A4A' },
        { name: 'Muted Copper', hex: '#B87333' }, { name: 'Deep Plum', hex: '#5C3A6E' },
        { name: 'Espresso', hex: '#3E2723' }, { name: 'Forest Green', hex: '#228B22' },
        { name: 'Pewter', hex: '#8E9196' }, { name: 'Dark Burgundy', hex: '#722F37' },
        { name: 'Ash Brown', hex: '#665D1E' }, { name: 'Deep Navy', hex: '#000080' },
      ],
    },
    common: {
      avoidColors: [
        { name: 'Neon Yellow', hex: '#CCFF00', reason: 'Too intense' },
        { name: 'Neon Orange', hex: '#FF6700', reason: 'Overpowering for neutral skin' },
      ],
      metals: ['Silver', 'Gold', 'Mixed'],
      metalHexes: ['#C0C0C0', '#FFD700', '#CDB87E'],
    }
  }
};

/**
 * Get specialized recommendations based on both undertone AND skin depth.
 */
export function getRecommendations(undertone, depth) {
  const normalizedKey = undertone.replace(/-([a-z])/g, (g) => g[1].toUpperCase()).toLowerCase();
  const palette = palettes[normalizedKey] || palettes[undertone] || palettes['neutral'];
  
  const isLight = (depth === 'Fair' || depth === 'Light');
  const intensity = isLight ? 'Light' : 'Deep';
  
  const specialized = palette[intensity] || palette['Deep'] || palette['Light'];
  const common = palette.common || {};

  // Mix in universal colors to ensure full lists
  const bestColors = [...(specialized.bestColors || [])];
  if (bestColors.length < 12) {
    bestColors.push(...universalColors.filter(uc => !bestColors.some(bc => bc.hex === uc.hex)));
  }

  return {
    bestColors: bestColors.slice(0, 18), // Provide up to 18 colors
    avoidColors: common.avoidColors || [],
    metals: common.metals || ['Silver', 'Gold'],
    metalHexes: common.metalHexes || ['#C0C0C0', '#FFD700'],
    clothingSuggestions: specialized.clothingSuggestions || ['Stick to muted, balanced tones for a harmonious look.'],
    makeupSuggestions: ['Neutral tones often work best for your balanced profile.'],
    accessorySuggestions: ['Mix textures like leather and metal to add depth to your look.']
  };
}

export default palettes;
