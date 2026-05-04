import { useState, useEffect } from 'react';
import { hexToHsl, hslToHex } from '../utils/smartRecommendations';

/**
 * Custom Color Picker Component
 * Premium, interactive sliders for manual color selection.
 */
export default function CustomPicker({ initialColor, onChange }) {
  const [hex, setHex] = useState(initialColor || '#00A86B');
  const [hsl, setHsl] = useState({ h: 160, s: 100, l: 33 });

  useEffect(() => {
    if (initialColor) {
      setHex(initialColor);
      setHsl(hexToHsl(initialColor));
    }
  }, [initialColor]);

  const handleHueChange = (h) => {
    const newHsl = { ...hsl, h: parseInt(h) };
    setHsl(newHsl);
    const newHex = hslToHex(newHsl.h, newHsl.s, newHsl.l);
    setHex(newHex);
    onChange(newHex);
  };

  const handleSatChange = (s) => {
    const newHsl = { ...hsl, s: parseInt(s) };
    setHsl(newHsl);
    const newHex = hslToHex(newHsl.h, newHsl.s, newHsl.l);
    setHex(newHex);
    onChange(newHex);
  };

  const handleLightChange = (l) => {
    const newHsl = { ...hsl, l: parseInt(l) };
    setHsl(newHsl);
    const newHex = hslToHex(newHsl.h, newHsl.s, newHsl.l);
    setHex(newHex);
    onChange(newHex);
  };

  const handleHexInput = (val) => {
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      setHex(val);
      setHsl(hexToHsl(val));
      onChange(val);
    } else {
      setHex(val);
    }
  };

  return (
    <div className="custom-picker">
      <div className="picker-preview" style={{ backgroundColor: hex }}>
        <span className="picker-hex-display">{hex}</span>
      </div>

      <div className="picker-sliders">
        <div className="picker-slider-group">
          <div className="slider-label">Hue</div>
          <input
            type="range"
            min="0"
            max="360"
            value={hsl.h}
            onChange={(e) => handleHueChange(e.target.value)}
            className="hue-slider"
          />
        </div>

        <div className="picker-slider-group">
          <div className="slider-label">Saturation</div>
          <input
            type="range"
            min="0"
            max="100"
            value={hsl.s}
            onChange={(e) => handleSatChange(e.target.value)}
            style={{
              background: `linear-gradient(to right, ${hslToHex(hsl.h, 0, hsl.l)}, ${hslToHex(hsl.h, 100, hsl.l)})`
            }}
          />
        </div>

        <div className="picker-slider-group">
          <div className="slider-label">Lightness</div>
          <input
            type="range"
            min="0"
            max="100"
            value={hsl.l}
            onChange={(e) => handleLightChange(e.target.value)}
            style={{
              background: `linear-gradient(to right, #000, ${hslToHex(hsl.h, hsl.s, 50)}, #fff)`
            }}
          />
        </div>

        <div className="picker-input-row">
          <div className="hex-input-wrapper">
            <span>HEX</span>
            <input 
              type="text" 
              value={hex} 
              onChange={(e) => handleHexInput(e.target.value)}
              placeholder="#000000"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
