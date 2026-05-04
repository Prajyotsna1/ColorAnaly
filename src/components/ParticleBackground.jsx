import { useEffect } from 'react';

export default function ParticleBackground() {
  useEffect(() => {
    if (!window.particlesJS) return;

    // 🔥 Destroy previous instance (prevents duplication)
    if (window.pJSDom && window.pJSDom.length > 0) {
      window.pJSDom.forEach(p => p.pJS.fn.vendors.destroypJS());
      window.pJSDom = [];
    }

    window.particlesJS('particles-js', {
      particles: {
        number: {
          value: 60,
          density: { enable: true, value_area: 900 }
        },
        color: { value: "#20D3B2" },
        shape: { type: "circle" },
        opacity: {
          value: 0.18,
          random: true
        },
        size: {
          value: 2.5,
          random: true
        },
        line_linked: {
          enable: true,
          distance: 140,
          color: "#20D3B2",
          opacity: 0.2,
          width: 1
        },
        move: {
          enable: true,
          speed: 2,
          direction: "none",
          random: false,
          straight: false,
          out_mode: "out",
          bounce: false
        }
      },

      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: {
            enable: true,
            mode: "grab"
          },
          onclick: {
            enable: true,
            mode: "push"
          },
          resize: true
        },
        modes: {
          grab: {
            distance: 140,
            line_linked: { opacity: 0.8 }
          },
          push: {
            particles_nb: 6
          }
        }
      },

      retina_detect: true
    });

    // Cleanup on unmount
    return () => {
      if (window.pJSDom && window.pJSDom.length > 0) {
        window.pJSDom.forEach(p => p.pJS.fn.vendors.destroypJS());
        window.pJSDom = [];
      }
    };
  }, []);

  return (
    <div
      id="particles-js"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,              // ✅ FIX: behind content
        pointerEvents: 'none',  // ✅ FIX: don't block clicks
      }}
    />
  );
}