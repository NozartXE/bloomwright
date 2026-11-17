import { LEVELS } from './levels.js';
import { createGame } from './game-state.js';
import { FINALE } from './salt.js';
import { drawTerraceBase, drawTiles } from './render-terrace.js';
import { drawWater, drawBlooms } from './render-water.js';

export function chipRect(i, y0 = 478, rowHeight = 52) {
  return { x: 308 + (i % 6) * 112, y: y0 + Math.floor(i / 6) * rowHeight, w: 104, h: 40 };
}
let board = null;
function titleBoard() {
  if (board) return board;
  const g = createGame();
  g.startLevel(11);
  const level = LEVELS[11];
  for (const [i, rot] of Object.entries(level.solution.turns)) g.sim.setRotation(+i, rot);
  for (const i of level.solution.patches) g.sim.applyClay(i);
  g.release();
  for (let n = 0; n < 40 && g.screen === 'playing'; n++) {
    g.stepOnce();
    if (g.finaleCracked) g.sim.applyClay(FINALE.crackTile);
  }
  board = { level: g.level, sim: g.sim };
  return board;
}
function chips(ctx, progress, variant = 'light', y0 = 478, rowHeight = 52) {
  const light = variant === 'light';
  for (let i = 0; i < 12; i++) {
    const r = chipRect(i, y0, rowHeight);
    ctx.fillStyle = light ? 'rgba(255,243,208,.17)' : 'rgba(49,91,59,.08)';
    ctx.beginPath(); ctx.roundRect(r.x, r.y, r.w, r.h, 8); ctx.fill();
    ctx.strokeStyle = light ? 'rgba(255,237,195,.6)' : '#315b3b'; ctx.stroke();
    ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const stars = '★'.repeat(progress[i + 1] ?? 0) || '·';
    ctx.fillStyle = light ? '#fff1c9' : '#315b3b'; ctx.textAlign = 'left'; ctx.fillText(`${i + 1}`, r.x + 18, r.y + r.h / 2);
    ctx.fillStyle = light ? '#fff1c9' : '#d69c2f'; ctx.textAlign = 'right'; ctx.fillText(stars, r.x + r.w - 16, r.y + r.h / 2);
  }
}
export function drawTitle(ctx, game, view = {}) {
  const b = titleBoard();
  drawTerraceBase(ctx, b.level, view); drawTiles(ctx, b.level, b.sim, view); drawWater(ctx, b.level, b.sim, view); drawBlooms(ctx, b.level, b.sim, view);
  ctx.fillStyle = 'rgba(13,48,34,.55)'; ctx.fillRect(0, 130, 1280, 600);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowColor = '#06190e'; ctx.shadowBlur = 16; ctx.fillStyle = '#fff1ca'; ctx.font = 'bold 92px Georgia,serif'; ctx.fillText('BLOOMWRIGHT', 640, 225); ctx.shadowBlur = 0;
  ctx.font = '19px Georgia,serif';
  ['Nia, keeper of the Last Spring, turns the carved channels to wake twelve gardens', 'in harmony — before Vessk, the Salt Duchess, salts them all dry.'].forEach((t, i) => ctx.fillText(t, 640, 305 + i * 28));
  ctx.font = '17px Georgia,serif'; ctx.fillText('Turn the channels · Release the spring · Bloom in the order the gardens call', 640, 388);
  ctx.font = '15px sans-serif'; ctx.fillText('Click a tile to turn it — click a crack to patch it — R restarts', 640, 422);
  chips(ctx, game.progress, 'light', 478);
  ctx.globalAlpha = .65 + .35 * Math.sin((view.phase ?? 0) * Math.PI * 2); ctx.font = 'bold 22px Georgia,serif'; ctx.fillText('CLICK OR PRESS ENTER TO PLAY', 640, 690); ctx.globalAlpha = 1;
}
export const RESULT_BUTTONS = [{ id: 'again', x: 324, y: 636, w: 190, h: 54 }, { id: 'next', x: 545, y: 636, w: 190, h: 54 }, { id: 'gardens', x: 766, y: 636, w: 190, h: 54 }];
export function hitResultButton(x, y) { return RESULT_BUTTONS.find(b => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h)?.id ?? null; }
export function drawResults(ctx, g) {
  ctx.fillStyle = 'rgba(8,23,18,.72)'; ctx.fillRect(0, 0, 1280, 800); ctx.fillStyle = '#f6e8c8'; ctx.beginPath(); ctx.roundRect(260, 185, 760, 430, 24); ctx.fill();
  ctx.textAlign = 'center'; ctx.fillStyle = '#315b3b'; ctx.font = 'bold 39px Georgia,serif'; ctx.fillText(g.screen === 'won' ? (g.level.id === 12 ? 'THE GREAT GARDEN BLOOMS!' : `${g.level.name.toUpperCase()} BLOOMS!`) : 'THE SUN TAKES THE GARDEN', 640, 236);
  ctx.font = '18px Georgia,serif'; if (g.level.id === 12 && g.screen === 'won') ctx.fillText('Vessk is washed away — the terraces run sweet.', 640, 275); else if (g.screen === 'lost') ctx.fillText('The blooms that woke keep their colour. Try again — the spring remembers.', 640, 275);
  ctx.font = '20px sans-serif'; ctx.fillText(`Score ${g.score}     Best harmony x${g.harmony.best}     Daylight used ${g.sim.stepsUsed} of ${g.level.sun}`, 640, 325);
  const earned = g.screen === 'won' ? Math.max(0, Math.min(3, g.progress[g.level.id] ?? 0)) : 0;
  ctx.font = '48px Georgia,serif'; ctx.fillStyle = '#d69c2f'; ctx.fillText(Array.from({ length: 3 }, (_, i) => i < earned ? '✿' : '·').join('  '), 640, 390);
  chips(ctx, g.progress, 'dark', 452, 56);
  ctx.font = 'bold 15px sans-serif'; ctx.fillStyle = '#315b3b'; ctx.fillText('PRESS R — OR CLICK — TO PLAY AGAIN', 640, 578);
  RESULT_BUTTONS.forEach(b => { ctx.fillStyle = '#326746'; ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 12); ctx.fill(); ctx.fillStyle = '#fff4d5'; ctx.font = 'bold 15px sans-serif'; ctx.fillText(b.id === 'again' ? 'PLAY AGAIN' : b.id === 'next' ? 'NEXT GARDEN' : 'ALL GARDENS', b.x + b.w / 2, b.y + b.h / 2); });
}
