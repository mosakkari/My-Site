import type {ReactNode} from 'react';

// Visuel genere (aucune image externe, aucun droit a verifier) : une « carte auto-organisatrice »,
// grille de neurones dont la taille et la couleur suivent un champ lisse. Unique pour chaque `seed`.

// Palette du bandeau d'accueil ; celle des cartes est deduite de la couleur du type (charte dans shared.ts).
const PALETTES: Record<string, string[]> = {
  hero: ['#0b2a4a', '#14507a', '#1c7c8c', '#a5f3fc'],
};

const mix = (a: number[], b: number[], t: number): string =>
  '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('');

/** 4 teintes (sombre -> clair) a partir d'une couleur de base. */
function paletteFrom(base: string): string[] {
  const c = [1, 3, 5].map((i) => parseInt(base.slice(i, i + 2), 16));
  return [mix(c, [0, 0, 0], 0.7), mix(c, [0, 0, 0], 0.3), base, mix(c, [255, 255, 255], 0.72)];
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hex = (c: string): number[] => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));

function colorAt(palette: string[], t: number): string {
  const x = Math.min(0.9999, Math.max(0, t)) * (palette.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  const a = hex(palette[i]);
  const b = hex(palette[i + 1]);
  return `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * f)).join(',')})`;
}

type Props = {seed: string; type?: string; color?: string; cols?: number; rows?: number; className?: string};

export default function CardArt({seed, type = 'nouvelle', color, cols = 20, rows = 11, className}: Props): ReactNode {
  const palette = color ? paletteFrom(color) : PALETTES[type] ?? PALETTES.hero;
  const rand = rng(hash(seed + '|' + type));
  const blobs = Array.from({length: 4}, () => ({x: rand() * cols, y: rand() * rows, r: 2.5 + rand() * 4, w: 0.5 + rand() * 0.6}));
  const phase = rand() * Math.PI * 2;

  const dots: ReactNode[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col + (row % 2 ? 0.5 : 0);
      const y = row * 0.866;
      let v = 0;
      for (const b of blobs) {
        const d2 = ((x - b.x) ** 2 + (row - b.y) ** 2) / (2 * b.r * b.r);
        v += b.w * Math.exp(-d2);
      }
      v = Math.min(1, v * 0.8 + 0.08 * (1 + Math.sin(x * 0.7 + phase) * Math.cos(row * 0.9)));
      dots.push(<circle key={`${row}-${col}`} cx={x + 0.5} cy={y + 0.55} r={0.16 + 0.34 * v} fill={colorAt(palette, v)} />);
    }
  }

  return (
    <svg
      className={className}
      viewBox={`0 0 ${cols + 0.5} ${(rows - 1) * 0.866 + 1.1}`}
      preserveAspectRatio="xMidYMid slice"
      width="100%"
      height="100%"
      aria-hidden="true"
      focusable="false">
      <rect width="100%" height="100%" fill={palette[0]} />
      {dots}
    </svg>
  );
}
