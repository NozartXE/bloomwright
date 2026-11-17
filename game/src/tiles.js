export const DIRS = Object.freeze({ N: 1, E: 2, S: 4, W: 8 });
export const OPPOSITE = Object.freeze({ 1: 4, 2: 8, 4: 1, 8: 2 });

export const KIND_ARMS = Object.freeze({
  '.': 0, S: 0, G: 0, '=': 10, L: 3, T: 11, '+': 15, '#': 0,
  c: 10, l: 3, t: 11,
});

export function isChannel(kind) { return ['=', 'L', 'T', '+', 'c', 'l', 't'].includes(kind); }
export function isCracked(kind) { return ['c', 'l', 't'].includes(kind); }
export function soundKind(kind) { return ({ c: '=', l: 'L', t: 'T' })[kind] ?? kind; }
export function rotateArms(arms, turns = 0) {
  const n = ((turns % 4) + 4) % 4;
  for (let i = 0; i < n; i++) arms = ((arms << 1) & 15) | ((arms >> 3) & 1);
  return arms;
}
export function armsOf(tile) {
  if (tile.kind === 'S') return rotateArms(DIRS.N, tile.rot ?? 0);
  return rotateArms(KIND_ARMS[tile.kind] ?? 0, tile.rot ?? 0);
}
