import { AU_M, C_M_S, LY_M } from '../../data/labData';

const nf = (digits: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: digits, minimumFractionDigits: 0 });

/** 3 significant figures, with thousands separators for big numbers. */
export function sig(n: number, digits = 3): string {
  if (!isFinite(n)) return '—';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e6 || abs < 1e-3) return sci(n, digits);
  const p = Number(n.toPrecision(digits));
  return nf(6).format(p);
}

const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };

/** Scientific notation with superscript exponent, e.g. 3.83 × 10²⁶. */
export function sci(n: number, digits = 3): string {
  if (n === 0) return '0';
  const [m, e] = n.toExponential(digits - 1).split('e');
  const exp = String(Number(e)).split('').map((c) => SUP[c] ?? c).join('');
  return `${m} × 10${exp}`;
}

/** Human scale for a large number: 4.3 million, 6.5 billion. */
export function words(n: number, digits = 3): string {
  const abs = Math.abs(n);
  if (abs >= 1e12) return `${sig(n / 1e12, digits)} trillion`;
  if (abs >= 1e9) return `${sig(n / 1e9, digits)} billion`;
  if (abs >= 1e6) return `${sig(n / 1e6, digits)} million`;
  return sig(n, digits);
}

/** Pick a readable unit for a distance in metres. */
export function formatDistance(m: number): string {
  if (m < 1e9) return `${words(m / 1000)} km`;
  if (m < 0.1 * LY_M) return `${words(m / AU_M)} au`;
  return `${words(m / LY_M)} light-years`;
}

/** Light-travel time for a distance in metres, in the most natural unit. */
export function lightTime(m: number): string {
  const s = m / C_M_S;
  if (s < 120) return `${sig(s)} s`;
  if (s < 7200) return `${sig(s / 60)} min`;
  if (s < 172_800) return `${sig(s / 3600)} h`;
  const days = s / 86_400;
  if (days < 730) return `${sig(days)} days`;
  return `${words(days / 365.25)} years`;
}

export const formatKm = (km: number) => `${nf(0).format(Math.round(km))} km`;
