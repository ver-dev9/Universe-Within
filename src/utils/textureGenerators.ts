import * as THREE from 'three';
import { getEarthMaps } from './earthMaps';

// Cache textures to avoid redundant canvas renders
const textureCache: Record<string, THREE.CanvasTexture> = {};

/**
 * Creates high-detail procedural planetary textures using HTML5 Canvas 2D
 */
export function getPlanetTexture(planetId: string): THREE.CanvasTexture {
  if (textureCache[planetId]) {
    return textureCache[planetId];
  }

  // Earth uses the noise-based map set (continents, clouds, city lights) since v2.
  if (planetId === 'earth' || planetId === 'earth-clouds' || planetId === 'earth-night') {
    const maps = getEarthMaps();
    const t = planetId === 'earth' ? maps.day : planetId === 'earth-clouds' ? maps.clouds : maps.night;
    textureCache[planetId] = t;
    return t;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  const w = canvas.width;
  const h = canvas.height;

  switch (planetId) {
    case 'sun': {
      // Solar photosphere granulation & turbulence
      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, '#FF4500');
      gradient.addColorStop(0.3, '#FFA500');
      gradient.addColorStop(0.5, '#FFD700');
      gradient.addColorStop(0.7, '#FFA500');
      gradient.addColorStop(1, '#FF4500');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Solar granules / convection cells
      for (let i = 0; i < 2500; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 2 + Math.random() * 8;
        const alpha = 0.15 + Math.random() * 0.35;
        ctx.fillStyle = Math.random() > 0.4 ? `rgba(255, 255, 220, ${alpha})` : `rgba(200, 40, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Solar flare filaments
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 3;
      for (let j = 0; j < 40; j++) {
        ctx.beginPath();
        const startX = Math.random() * w;
        const startY = Math.random() * h;
        ctx.moveTo(startX, startY);
        ctx.bezierCurveTo(
          startX + (Math.random() - 0.5) * 100,
          startY + (Math.random() - 0.5) * 50,
          startX + (Math.random() - 0.5) * 150,
          startY + (Math.random() - 0.5) * 70,
          startX + (Math.random() - 0.5) * 200,
          startY + (Math.random() - 0.5) * 90
        );
        ctx.stroke();
      }
      break;
    }

    case 'mercury': {
      // Dark rocky basalt with cratered ejecta
      ctx.fillStyle = '#616161';
      ctx.fillRect(0, 0, w, h);

      // Craters & impact scars
      for (let i = 0; i < 900; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 1 + Math.random() * 14;
        // Crater rim
        ctx.strokeStyle = 'rgba(220, 220, 220, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();

        // Crater interior shadow
        ctx.fillStyle = 'rgba(30, 30, 30, 0.4)';
        ctx.beginPath();
        ctx.arc(x + 0.5, y + 0.5, r * 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Crater central peak
        if (r > 8) {
          ctx.fillStyle = 'rgba(240, 240, 240, 0.5)';
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }

    case 'venus': {
      // Opaque, creamy-yellowish sulfuric acid swirls
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#C9A35F');
      grad.addColorStop(0.2, '#E8CA8C');
      grad.addColorStop(0.4, '#F3DCA7');
      grad.addColorStop(0.6, '#DFBD78');
      grad.addColorStop(0.8, '#CE9F55');
      grad.addColorStop(1, '#B0833C');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Super-rotating atmospheric streak clouds
      ctx.lineWidth = 8;
      for (let i = 0; i < 300; i++) {
        const y = Math.random() * h;
        const alpha = 0.1 + Math.random() * 0.2;
        ctx.strokeStyle = Math.random() > 0.5 ? `rgba(255, 248, 220, ${alpha})` : `rgba(160, 110, 40, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(w * 0.25, y + Math.sin(y) * 20, w * 0.75, y - Math.sin(y) * 20, w, y);
        ctx.stroke();
      }
      break;
    }

    case 'earth': {
      // Realistic ocean background
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, h);
      oceanGrad.addColorStop(0, '#0F2C59');
      oceanGrad.addColorStop(0.5, '#0B3B73');
      oceanGrad.addColorStop(1, '#082547');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, w, h);

      // Continental landmasses
      ctx.fillStyle = '#2D6A4F';
      const continents = [
        { x: 0.18 * w, y: 0.32 * h, rx: 70, ry: 45, angle: -0.2 }, // North America
        { x: 0.28 * w, y: 0.65 * h, rx: 45, ry: 75, angle: 0.3 },  // South America
        { x: 0.52 * w, y: 0.35 * h, rx: 65, ry: 40, angle: 0.1 },  // Europe
        { x: 0.53 * w, y: 0.55 * h, rx: 60, ry: 70, angle: 0 },    // Africa
        { x: 0.72 * w, y: 0.32 * h, rx: 95, ry: 50, angle: 0.1 },  // Asia
        { x: 0.82 * w, y: 0.68 * h, rx: 45, ry: 35, angle: 0 },    // Australia
      ];

      continents.forEach(c => {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, c.rx, c.ry, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mountain terrain & deserts inside continent
        ctx.fillStyle = '#B08968';
        ctx.beginPath();
        ctx.ellipse(c.rx * 0.1, 0, c.rx * 0.5, c.ry * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Polar ice caps
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, w, 22);
      ctx.fillRect(0, h - 25, w, 25);

      // Dynamic cloud cover vortices
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (let i = 0; i < 400; i++) {
        const cx = Math.random() * w;
        const cy = 30 + Math.random() * (h - 60);
        const cr = 8 + Math.random() * 25;
        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'earth-clouds': {
      // Standalone transparent cloud sphere texture
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      for (let i = 0; i < 650; i++) {
        const x = Math.random() * w;
        const y = 30 + Math.random() * (h - 60);
        const r = 6 + Math.random() * 22;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'earth-night': {
      // Nighttime city illumination lights
      ctx.fillStyle = '#01040A';
      ctx.fillRect(0, 0, w, h);

      // Glowing urban agglomerations
      ctx.fillStyle = '#FFDD66';
      for (let i = 0; i < 1500; i++) {
        const x = Math.random() * w;
        const y = 0.2 * h + Math.random() * 0.6 * h;
        const r = 0.5 + Math.random() * 2.5;
        const a = 0.3 + Math.random() * 0.7;
        ctx.fillStyle = `rgba(255, 220, 110, ${a})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'mars': {
      // Rust-colored oxidized basalt with dark volcanic provinces
      const marsGrad = ctx.createLinearGradient(0, 0, 0, h);
      marsGrad.addColorStop(0, '#B84524');
      marsGrad.addColorStop(0.5, '#CC5533');
      marsGrad.addColorStop(1, '#9C3619');
      ctx.fillStyle = marsGrad;
      ctx.fillRect(0, 0, w, h);

      // Dark volcanic provinces (Syrtis Major, Acidalia Planitia)
      ctx.fillStyle = 'rgba(60, 25, 15, 0.45)';
      for (let i = 0; i < 80; i++) {
        const x = Math.random() * w;
        const y = 0.3 * h + Math.random() * 0.4 * h;
        const r = 15 + Math.random() * 45;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Olympus Mons and Tharsis volcanoes
      ctx.fillStyle = 'rgba(230, 140, 100, 0.6)';
      ctx.beginPath();
      ctx.arc(0.28 * w, 0.42 * h, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#551A08';
      ctx.beginPath();
      ctx.arc(0.28 * w, 0.42 * h, 6, 0, Math.PI * 2);
      ctx.fill();

      // Polar ice caps (dry ice + water ice)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, w, 18);
      ctx.fillRect(0, h - 16, w, 16);
      break;
    }

    case 'jupiter': {
      // Dynamic counter-rotating atmospheric bands
      const bands = [
        '#A56839', '#D9A066', '#EED8AE', '#9E5B28', '#D39C6B',
        '#EFE5CD', '#8E4A1E', '#C68B52', '#EBD29F', '#A35D2A'
      ];
      const bandHeight = h / bands.length;
      bands.forEach((color, idx) => {
        ctx.fillStyle = color;
        ctx.fillRect(0, idx * bandHeight, w, bandHeight);
      });

      // Zonal jet-stream eddies and turbulent curl ripples
      // v2: fewer, finer eddies so the belt/zone structure stays legible.
      for (let j = 0; j < 140; j++) {
        const y = Math.random() * h;
        ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.12)' : 'rgba(80, 30, 10, 0.16)';
        ctx.lineWidth = 1 + Math.random() * 2.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= w; x += 16) {
          ctx.lineTo(x, y + Math.sin((x / w) * Math.PI * 16 + j) * 3);
        }
        ctx.stroke();
      }

      // The Great Red Spot (anticyclonic oval vortex)
      const grsX = 0.62 * w;
      const grsY = 0.65 * h;
      ctx.save();
      ctx.translate(grsX, grsY);
      ctx.rotate(-0.08);

      // Outer turbulence ring
      ctx.fillStyle = 'rgba(160, 50, 20, 0.85)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 48, 28, 0, 0, Math.PI * 2);
      ctx.fill();

      // Inner core
      ctx.fillStyle = '#C83214';
      ctx.beginPath();
      ctx.ellipse(0, 0, 32, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eye of storm
      ctx.fillStyle = '#E88B6E';
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }

    case 'saturn': {
      // Golden butterscotch atmospheric belts
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#997E54');
      grad.addColorStop(0.2, '#CFBA8D');
      grad.addColorStop(0.4, '#E5D6AD');
      grad.addColorStop(0.6, '#DFCB9B');
      grad.addColorStop(0.8, '#BD9E6B');
      grad.addColorStop(1, '#8A6D41');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle atmospheric streaks
      for (let i = 0; i < 200; i++) {
        const y = Math.random() * h;
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 + Math.random() * 0.15})`;
        ctx.lineWidth = 2 + Math.random() * 4;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      break;
    }

    case 'uranus': {
      // Pale aquamarine-cyan methane haze
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#5BB4B4');
      grad.addColorStop(0.3, '#75D8D8');
      grad.addColorStop(0.7, '#67CCCC');
      grad.addColorStop(1, '#479E9E');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Methane absorption atmospheric gradient
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      for (let i = 0; i < 40; i++) {
        const y = Math.random() * h;
        ctx.fillRect(0, y, w, 6);
      }
      break;
    }

    case 'neptune': {
      // Deep cobalt-azure with methane ice cloud ripples
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#1E4399');
      grad.addColorStop(0.4, '#2B5FE2');
      grad.addColorStop(0.7, '#3871FA');
      grad.addColorStop(1, '#15317E');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Great Dark Spot
      ctx.fillStyle = 'rgba(10, 25, 70, 0.7)';
      ctx.beginPath();
      ctx.ellipse(0.45 * w, 0.38 * h, 36, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Supersonic bright white methane cirrus cloud streaks
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      for (let i = 0; i < 35; i++) {
        const sx = Math.random() * w;
        const sy = 0.2 * h + Math.random() * 0.6 * h;
        const sw = 40 + Math.random() * 120;
        ctx.fillRect(sx, sy, sw, 2.5);
      }
      break;
    }

    case 'moon': {
      // Lunar regolith and maria (seas)
      ctx.fillStyle = '#8A8D91';
      ctx.fillRect(0, 0, w, h);

      // Dark basaltic lunar maria
      ctx.fillStyle = '#4D5054';
      const maria = [
        { x: 0.35 * w, y: 0.35 * h, r: 65 }, // Mare Imbrium
        { x: 0.55 * w, y: 0.40 * h, r: 50 }, // Mare Serenitatis
        { x: 0.68 * w, y: 0.45 * h, r: 45 }, // Mare Tranquillitatis
        { x: 0.25 * w, y: 0.55 * h, r: 75 }, // Oceanus Procellarum
      ];
      maria.forEach(m => {
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Bright impact craters & ray systems (e.g. Tycho, Copernicus)
      for (let i = 0; i < 450; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 1 + Math.random() * 8;
        ctx.fillStyle = 'rgba(230, 230, 230, 0.4)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    default:
      ctx.fillStyle = '#888888';
      ctx.fillRect(0, 0, w, h);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  textureCache[planetId] = texture;
  return texture;
}

/**
 * Creates high-detail transparency ring texture for Saturn
 */
export function getSaturnRingTexture(): THREE.CanvasTexture {
  if (textureCache['saturn-ring']) {
    return textureCache['saturn-ring'];
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
  // Transparent inner boundary
  grad.addColorStop(0.0, 'rgba(0,0,0,0)');
  // D ring (faint)
  grad.addColorStop(0.1, 'rgba(180, 160, 120, 0.15)');
  // C ring
  grad.addColorStop(0.2, 'rgba(200, 180, 140, 0.4)');
  grad.addColorStop(0.35, 'rgba(215, 195, 150, 0.6)');
  // B ring (brightest & densest)
  grad.addColorStop(0.4, 'rgba(240, 220, 175, 0.95)');
  grad.addColorStop(0.65, 'rgba(250, 230, 185, 0.92)');
  // Cassini Division (dark gap)
  grad.addColorStop(0.68, 'rgba(0, 0, 0, 0.05)');
  grad.addColorStop(0.72, 'rgba(0, 0, 0, 0.05)');
  // A ring
  grad.addColorStop(0.75, 'rgba(230, 210, 165, 0.85)');
  // Encke division
  grad.addColorStop(0.86, 'rgba(0, 0, 0, 0.1)');
  grad.addColorStop(0.88, 'rgba(220, 200, 155, 0.7)');
  // Outer boundary
  grad.addColorStop(0.95, 'rgba(180, 160, 120, 0.3)');
  grad.addColorStop(1.0, 'rgba(0,0,0,0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  textureCache['saturn-ring'] = texture;
  return texture;
}
