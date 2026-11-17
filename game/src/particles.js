import { makeRng } from './rng.js';

export class Particles {
  constructor() { this.list = []; }
  burst(x, y, opts = {}) {
    const { colors = ['#fff'], count = 12, seed = 0, kind = 'sparkle' } = opts;
    const rng = makeRng(seed);
    for (let i = 0; i < count; i++) {
      const angle = rng.next() * Math.PI * 2, speed = 0.6 + rng.next() * 2.8;
      this.list.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - (kind === 'petal' ? 1.1 : 0), angle: rng.next() * Math.PI * 2, spin: (rng.next() - .5) * .16, size: 2 + rng.next() * 4, life: 28 + Math.floor(rng.next() * 35), maxLife: 0, color: colors[rng.int(colors.length)] ?? '#fff', kind, age: 0, flutter: rng.next() * Math.PI * 2 });
      this.list[this.list.length - 1].maxLife = this.list[this.list.length - 1].life;
    }
  }
  step() {
    for (const p of this.list) { p.age++; p.life--; p.x += p.vx; p.y += p.vy; p.angle += p.spin; if (p.kind === 'petal') { p.vy += .055; p.x += Math.sin(p.age * .18 + p.flutter) * .7; p.vx *= .985; } else if (p.kind === 'salt') { p.vy = Math.abs(p.vy) * .35 + .12; p.vx *= .98; } else { p.vx *= .97; p.vy *= .97; } }
    this.list = this.list.filter(p => p.life > 0);
  }
  draw(ctx) {
    ctx.save();
    for (const p of this.list) { const a = Math.max(0, p.life / p.maxLife); ctx.globalAlpha = a; ctx.fillStyle = p.color; ctx.strokeStyle = p.color;
      if (p.kind === 'sparkle') { const s = p.size; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(p.x-s,p.y);ctx.lineTo(p.x+s,p.y);ctx.moveTo(p.x,p.y-s);ctx.lineTo(p.x,p.y+s);ctx.stroke();ctx.beginPath();ctx.arc(p.x,p.y,Math.max(.7,s*.22),0,Math.PI*2);ctx.fill(); }
      else { ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.beginPath();ctx.ellipse(0,0,p.size*(p.kind==='petal'?1.35:.68),p.size*(p.kind==='petal'?.62:1.25),0,0,Math.PI*2);ctx.fill();if(p.kind==='petal'){ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(-p.size,0);ctx.lineTo(p.size,0);ctx.stroke();}ctx.restore(); }
    }
    ctx.restore(); ctx.globalAlpha = 1;
  }
  clear() { this.list.length = 0; }
}
