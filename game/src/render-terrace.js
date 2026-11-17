import { TERRACES, INK } from './palette.js';
import { hash2 } from './rng.js';
import { armsOf, isChannel, isCracked } from './tiles.js';

export const VIEW = { W: 1280, H: 800, gridX: 48, gridY: 112, tile: 96, cols: 8, rows: 6, panelX: 840, panelW: 392 };
const idx = i => ({ x: VIEW.gridX + (i % 8) * 96, y: VIEW.gridY + Math.floor(i / 8) * 96, w: 96, h: 96 });
export function cellRect(i) { return idx(i); }
export function tileCenter(i) { const r = idx(i); return { x: r.x + 48, y: r.y + 48 }; }
export function tileAtPoint(x, y) { const c = Math.floor((x - 48) / 96), r = Math.floor((y - 112) / 96); return c >= 0 && c < 8 && r >= 0 && r < 6 ? r * 8 + c : -1; }
const terrace = level => TERRACES[({ Dawn: 0, Noon: 1, Dusk: 2 })[level.terrace] ?? 0];
const seedOf = (level, view) => (view?.seed ?? level.id ?? 0) | 0;
const color = (ctx, colors, x, y, radius) => { const g = ctx.createRadialGradient(x - radius * .35, y - radius * .4, 2, x, y, radius); g.addColorStop(0, colors[2]); g.addColorStop(.55, colors[0]); g.addColorStop(1, colors[1]); return g; };
function blob(ctx, x, y, r, fill, n = 8, seed = 0) { ctx.beginPath(); for (let k=0;k<n;k++){const a=k*Math.PI*2/n, wob=.76+hash2(k,Math.floor(x+y),seed)*.42, px=x+Math.cos(a)*r*wob, py=y+Math.sin(a)*r*wob; k?ctx.lineTo(px,py):ctx.moveTo(px,py);} ctx.closePath(); ctx.fillStyle=fill; ctx.fill(); }
function foliage(ctx, x, y, seed, palette) { for(let j=0;j<7;j++){const a=hash2(j,seed,9)*Math.PI*2, d=hash2(j,seed,10)*34, r=9+hash2(j,seed,11)*15; blob(ctx,x+Math.cos(a)*d,y+Math.sin(a)*d,r,palette[j%palette.length],7,seed+j); } }

export function drawTerraceBase(ctx, level, view = {}) {
  const p=terrace(level), seed=seedOf(level,view);
  ctx.save(); ctx.fillStyle=color(ctx,p.tile,610,400,850); ctx.fillRect(0,0,1280,800);
  const sky=ctx.createLinearGradient(0,0,0,112); sky.addColorStop(0,p.sky[0]);sky.addColorStop(.62,p.sky[1]);sky.addColorStop(1,p.sky[2]);ctx.fillStyle=sky;ctx.fillRect(0,0,1280,112);
  const glow=ctx.createRadialGradient(640,85,5,640,85,600);glow.addColorStop(0,'rgba(255,245,195,.38)');glow.addColorStop(1,'rgba(255,245,195,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,1280,112);
  // Soft decorative edge beds.
  for(let j=0;j<34;j++){let x=hash2(j,0,seed)*1280,y=hash2(j,1,seed)*54+745;foliage(ctx,x,y,seed+j,p.foliage);}
  for(let j=0;j<13;j++){let x=hash2(j,2,seed)*40,y=hash2(j,3,seed)*780;foliage(ctx,x,y,seed+j+61,p.foliage);}
  // Hundreds of deterministic fine-grain flecks across the plaza.
  for(let j=0;j<1800;j++){const x=hash2(j,13,seed)*1280,y=hash2(j,17,seed)*800,r=.55+hash2(j,19,seed)*.85;ctx.globalAlpha=.08+hash2(j,23,seed)*.15;ctx.fillStyle=hash2(j,29,seed)>.5?'#fff5d8':'#7b5144';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
  // Grid bed and individually bevelled slabs.
  for(let i=0;i<48;i++){const r=idx(i), t=level.rows[Math.floor(i/8)][i%8];ctx.fillStyle='rgba(86,51,46,.12)';ctx.fillRect(r.x+3,r.y+4,91,91);const g=ctx.createLinearGradient(r.x,r.y,r.x+96,r.y+96);g.addColorStop(0,'#edbf89');g.addColorStop(.52,p.tile[0]);g.addColorStop(1,p.tile[1]);ctx.fillStyle=g;ctx.fillRect(r.x+1,r.y+1,93,93);ctx.strokeStyle='rgba(255,239,194,.75)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(r.x+2,r.y+94);ctx.lineTo(r.x+2,r.y+2);ctx.lineTo(r.x+94,r.y+2);ctx.stroke();ctx.strokeStyle='rgba(93,55,49,.38)';ctx.beginPath();ctx.moveTo(r.x+94,r.y+2);ctx.lineTo(r.x+94,r.y+94);ctx.lineTo(r.x+2,r.y+94);ctx.stroke();
    if(t==='.'||t==='S'||isChannel(t)||t==='G') {ctx.fillStyle='rgba(255,238,197,.1)';ctx.fillRect(r.x+7,r.y+7,82,82);}
    if(t==='.') { for(let k=0;k<10;k++){const x=r.x+hash2(i,k,seed)*90+3,y=r.y+hash2(k,i,seed+1)*90+3;ctx.fillStyle='rgba(110,72,55,.10)';ctx.fillRect(x,y,1,1);} }
    if(t==='#'){ctx.fillStyle='#77736d';ctx.beginPath();ctx.moveTo(r.x+19,r.y+70);ctx.lineTo(r.x+17,r.y+42);ctx.lineTo(r.x+34,r.y+20);ctx.lineTo(r.x+66,r.y+16);ctx.lineTo(r.x+82,r.y+39);ctx.lineTo(r.x+78,r.y+70);ctx.lineTo(r.x+57,r.y+82);ctx.lineTo(r.x+30,r.y+79);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(255,255,255,.18)';ctx.beginPath();ctx.moveTo(r.x+20,r.y+42);ctx.lineTo(r.x+36,r.y+21);ctx.lineTo(r.x+65,r.y+18);ctx.lineTo(r.x+49,r.y+43);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(40,43,44,.25)';ctx.stroke();}
    if(t==='=') {ctx.strokeStyle='rgba(79,45,38,.17)';ctx.lineWidth=1;for(let k=0;k<5;k++){ctx.beginPath();ctx.moveTo(r.x+14,r.y+25+k*12);ctx.lineTo(r.x+82,r.y+25+k*12);ctx.stroke();}}
  }
  ctx.restore();
}

function armsPath(ctx,cx,cy,arms, inset=0) { const ends=[[cx,cy-47+inset],[cx+47-inset,cy],[cx,cy+47-inset],[cx-47+inset,cy]];[1,2,4,8].forEach((d,k)=>{if(arms&d){ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(...ends[k]);ctx.stroke();}}); }
export function drawTiles(ctx, level, sim, view = {}) {
 const p=terrace(level), seed=seedOf(level,view);
 for(let i=0;i<48;i++){const t=sim.tileAt(i),r=idx(i),c=tileCenter(i);if(!t)continue;
  if(isChannel(t.kind)||t.kind==='S') {const a=armsOf(t);ctx.lineCap='round';ctx.lineWidth=19;ctx.strokeStyle='#855346';armsPath(ctx,c.x,c.y,a);ctx.beginPath();ctx.arc(c.x,c.y,9.5,0,Math.PI*2);ctx.fillStyle='#855346';ctx.fill();ctx.lineWidth=10;ctx.strokeStyle='#d2a070';armsPath(ctx,c.x,c.y,a);ctx.beginPath();ctx.arc(c.x,c.y,5,0,Math.PI*2);ctx.fillStyle='#d2a070';ctx.fill();}
  if(t.kind==='S'){ctx.save();ctx.translate(c.x,c.y);ctx.strokeStyle='#a94f31';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,20,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#f1b16b';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,15,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#b95b37';ctx.fillRect(-11,-10,22,20);ctx.fillStyle='#e58b53';ctx.fillRect(-8,-11,16,17);ctx.rotate((t.rot??0)*Math.PI/2-Math.PI/2);ctx.fillStyle='#8f402d';ctx.beginPath();ctx.moveTo(-8,-12);ctx.lineTo(8,-12);ctx.lineTo(0,-34);ctx.closePath();ctx.fill();ctx.restore();}
  if(isCracked(t.kind)&&!t.patched){ctx.strokeStyle='#513a3d';ctx.lineWidth=3;ctx.lineJoin='miter';ctx.beginPath();ctx.moveTo(r.x+19,r.y+25);ctx.lineTo(r.x+37,r.y+37);ctx.lineTo(r.x+31,r.y+51);ctx.lineTo(r.x+53,r.y+57);ctx.lineTo(r.x+47,r.y+75);ctx.moveTo(r.x+37,r.y+37);ctx.lineTo(r.x+59,r.y+26);ctx.lineTo(r.x+72,r.y+35);ctx.stroke();}
  if(t.patched){ctx.fillStyle='#c97954';ctx.beginPath();ctx.ellipse(c.x+4,c.y+5,18,12,-.25,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#edaa76';ctx.lineWidth=2;ctx.stroke();}
  if(t.crusted){ctx.fillStyle='#f8f3e7';ctx.strokeStyle='#d9d6d0';ctx.lineWidth=1.5;ctx.beginPath();for(let k=0;k<11;k++){let a=k*Math.PI*2/11,rr=19+hash2(i,k,seed)*14,x=c.x+Math.cos(a)*rr,y=c.y+Math.sin(a)*rr;k?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.fill();ctx.stroke();for(let k=0;k<5;k++){const x=c.x+(hash2(i,k,seed+3)-.5)*42,y=c.y+(hash2(i,k,seed+4)-.5)*42;ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-4,y);ctx.lineTo(x+4,y);ctx.moveTo(x,y-4);ctx.lineTo(x,y+4);ctx.stroke();}}
  if(t.kind==='G'){ctx.fillStyle=p.soil;ctx.beginPath();ctx.ellipse(c.x,c.y+8,31,18,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(216,172,113,.6)';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(c.x,c.y+8,34,21,0,0,Math.PI*2);ctx.stroke();for(let k=0;k<8;k++){const a=k*Math.PI/4,x=c.x+Math.cos(a)*33,y=c.y+8+Math.sin(a)*19;ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle=p.foliage[k%3];ctx.beginPath();ctx.ellipse(0,0,8,3,0,0,Math.PI*2);ctx.fill();ctx.restore();}}
 }
}
