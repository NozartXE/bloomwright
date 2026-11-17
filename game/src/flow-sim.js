import { DIRS, KIND_ARMS, OPPOSITE, armsOf, isChannel, isCracked, soundKind } from './tiles.js';

const COLS = 8, ROWS = 6;
const DELTAS = { [DIRS.N]: -COLS, [DIRS.E]: 1, [DIRS.S]: COLS, [DIRS.W]: -1 };
const directions = [DIRS.N, DIRS.E, DIRS.S, DIRS.W];
const inBounds = (i) => Number.isInteger(i) && i >= 0 && i < COLS * ROWS;

export function createFlowSim(level) {
  if (!level || !Array.isArray(level.rows) || level.rows.length !== ROWS || level.rows.some(r => typeof r !== 'string' || r.length !== COLS)) throw new TypeError('level.rows must contain 6 strings of 8 characters');
  const salt = new Set(level.salt ?? []);
  const callOrder = [...(level.callOrder ?? [])];
  const tiles = [];
  let gardenId = 0;
  for (let i = 0; i < COLS * ROWS; i++) {
    const kind = level.rows[Math.floor(i / COLS)][i % COLS];
    if (!(kind in KIND_ARMS)) throw new TypeError(`unknown tile kind ${kind}`);
    tiles.push({ kind, rot: ((level.rot?.[i] ?? 0) % 4 + 4) % 4, crusted: salt.has(i), patched: false, gardenId: kind === 'G' ? gardenId++ : null });
  }
  const wet = new Set(tiles.map((t, i) => t.kind === 'S' ? i : -1).filter(i => i >= 0));
  const bloomed = [];
  const bloomSet = new Set();
  let stepsUsed = 0, clayLeft = Math.max(0, Math.floor(level.clay ?? 0));
  let won = gardenId === 0, stalled = false;

  function tileAt(i) { return inBounds(i) ? tiles[i] : undefined; }
  function effectiveArms(tile) { return armsOf({ ...tile, kind: isCracked(tile.kind) && tile.patched ? soundKind(tile.kind) : tile.kind }); }
  function canEmit(tile) { return tile.kind === 'S' || isChannel(tile.kind) && (!isCracked(tile.kind) || tile.patched); }
  function setRotation(i, turns) {
    const t = tileAt(i);
    if (!t || !(isChannel(t.kind) || t.kind === 'S') || wet.has(i) || t.crusted) return false;
    t.rot = ((Math.trunc(turns) % 4) + 4) % 4;
    return true;
  }
  function applyClay(i) {
    const t = tileAt(i);
    if (!t || !isCracked(t.kind) || t.patched || clayLeft <= 0) return false;
    t.patched = true; clayLeft--; return true;
  }
  function crust(i) { const t = tileAt(i); if (!t) return false; t.crusted = true; return true; }
  function crack(i) {
    const t = tileAt(i);
    if (!t || !isChannel(t.kind) || isCracked(t.kind)) return false;
    t.kind = ({ '=': 'c', L: 'l', T: 't' })[t.kind] ?? t.kind;
    t.patched = false; return isCracked(t.kind);
  }
  function addSpring(i, rot = 0) {
    const t = tileAt(i); if (!t || wet.has(i) || t.kind === 'G' || t.kind === '#') return false;
    t.kind = 'S'; t.rot = ((Math.trunc(rot) % 4) + 4) % 4; t.crusted = false; t.patched = false; wet.add(i); return true;
  }
  function step() {
    if (won) return [];
    const events = [], targets = new Set();
    for (const from of wet) {
      const source = tiles[from];
      if (!canEmit(source) || source.kind === 'G') continue;
      const arms = effectiveArms(source);
      for (const dir of directions) {
        if (!(arms & dir)) continue;
        const to = from + DELTAS[dir];
        if (!inBounds(to) || (dir === DIRS.E && from % COLS === COLS - 1) || (dir === DIRS.W && from % COLS === 0)) continue;
        const target = tiles[to];
        if (wet.has(to) || target.kind === '.' || target.kind === '#' || target.kind === 'S') continue;
        if (target.kind !== 'G' && !(effectiveArms(target) & OPPOSITE[dir])) continue;
        targets.add(to);
      }
    }
    // A crust washes on contact, then accepts water in this same simultaneous step.
    for (const i of targets) if (tiles[i].crusted) { tiles[i].crusted = false; events.push({ type: 'wash', index: i }); }
    for (const i of targets) {
      wet.add(i);
      const t = tiles[i]; events.push({ type: 'wet', index: i });
      if (t.kind === 'G' && !bloomSet.has(t.gardenId)) {
        bloomSet.add(t.gardenId); bloomed.push(t.gardenId); events.push({ type: 'bloom', index: i, gardenId: t.gardenId, callIndex: callOrder.indexOf(t.gardenId) });
      }
    }
    stepsUsed++;
    won = bloomed.length === gardenId;
    stalled = targets.size === 0 && !won;
    if (stalled) events.push({ type: 'stall', step: stepsUsed });
    return events;
  }
  return { setRotation, applyClay, crust, crack, addSpring, step, wet, bloomed, bloomOrder: bloomed, tileAt, get clayLeft() { return clayLeft; }, get stepsUsed() { return stepsUsed; }, get won() { return won; }, get stalled() { return stalled; }, sun: level.sun ?? 0 };
}
