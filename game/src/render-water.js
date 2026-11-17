import { TERRACES, BLOOM_COLORS, INK } from './palette.js';
import { hash2 } from './rng.js';
import { armsOf, isChannel } from './tiles.js';
import { tileCenter } from './render-terrace.js';
import { FINALE } from './salt.js';

const pOf=l=>TERRACES[({Dawn:0,Noon:1,Dusk:2})[l.terrace]??0];
const wetColor=(ctx,x,y,white=false)=>{const g=ctx.createLinearGradient(x,y-32,x,y+32);g.addColorStop(0,white?'#fffef1':'#b4fff0');g.addColorStop(.5,white?'#f7fbec':'#39d9e5');g.addColorStop(1,white?'#dfe9dd':'#138bc4');return g;};
function armsStroke(ctx,x,y,arms,width,stroke){ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=width;ctx.strokeStyle=stroke;const ends=[[x,y-43],[x+43,y],[x,y+43],[x-43,y]];[1,2,4,8].forEach((d,k)=>{if(arms&d){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(...ends[k]);ctx.stroke();}});ctx.beginPath();ctx.arc(x,y,width/2,0,Math.PI*2);ctx.fillStyle=stroke;ctx.fill();}
export function drawWater(ctx,level,sim,view={}){
 const p=pOf(level),seed=(view.seed??level.id??0)|0;
 for(const i of sim.wet){const t=sim.tileAt(i);if(!t||(!isChannel(t.kind)&&t.kind!=='S'))continue;const {x,y}=tileCenter(i),arms=armsOf(t),salt=level.id===12&&i===FINALE.saltSpring.tile, base=wetColor(ctx,x,y,salt), fresh=view.fresh?.has(i);
  armsStroke(ctx,x,y,arms,fresh?24:17,'rgba(24,87,100,.38)');armsStroke(ctx,x,y,arms,fresh?17:12,base);armsStroke(ctx,x,y,arms,3,salt?'rgba(255,255,255,.9)':'rgba(221,255,250,.88)');
  for(let k=0;k<4;k++){const a=hash2(i,k,seed)*Math.PI*2,d=13+hash2(k,i,seed+2)*29,s=.45+.45*Math.sin((view.phase??0)*Math.PI*2+k);ctx.globalAlpha=.38+s*.55;ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*d-3,y+Math.sin(a)*d);ctx.lineTo(x+Math.cos(a)*d+3,y+Math.sin(a)*d);ctx.moveTo(x+Math.cos(a)*d,y+Math.sin(a)*d-3);ctx.lineTo(x+Math.cos(a)*d,y+Math.sin(a)*d+3);ctx.stroke();}ctx.globalAlpha=1;
  if(fresh){const g=ctx.createRadialGradient(x,y,9,x,y,46);g.addColorStop(0,'rgba(125,255,246,.4)');g.addColorStop(1,'rgba(67,236,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,46,0,Math.PI*2);ctx.fill();armsStroke(ctx,x,y,arms,22,'rgba(100,255,243,.23)');}
 }
 for(let i=0;i<48;i++){const t=sim.tileAt(i);if(t?.kind==='G'&&sim.wet.has(i)&&!sim.bloomed.includes(t.gardenId)){const {x,y}=tileCenter(i);ctx.strokeStyle='rgba(66,235,225,.9)';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y+8,37,23,0,0,Math.PI*2);ctx.stroke();}}
}
function leaf(ctx,x,y,angle,size,color){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(0,0,size,size*.4,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(37,94,57,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-size*.7,0);ctx.lineTo(size*.7,0);ctx.stroke();ctx.restore();}
function flower(ctx,x,y,s,color,seed){const light='#fff1c5';for(let j=0;j<6;j++){const a=j*Math.PI/3,px=x+Math.cos(a)*s*.55,py=y+Math.sin(a)*s*.55;ctx.save();ctx.translate(px,py);ctx.rotate(a);ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(0,0,s*.37,s*.7,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=light;ctx.globalAlpha=.68;ctx.beginPath();ctx.ellipse(0,-s*.3,s*.19,s*.25,0,0,Math.PI*2);ctx.fill();ctx.restore();}ctx.globalAlpha=1;ctx.fillStyle='#f9c743';ctx.beginPath();ctx.arc(x,y,s*.28,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff2a5';ctx.beginPath();ctx.arc(x-s*.07,y-s*.08,s*.09,0,Math.PI*2);ctx.fill();}
export function drawBlooms(ctx,level,sim,view={}){
 const seed=(view.seed??level.id??0)|0, call=view.callingId;
 for(let i=0;i<48;i++){const t=sim.tileAt(i);if(t?.kind!=='G')continue;const gid=t.gardenId,{x,y}=tileCenter(i),col=BLOOM_COLORS[gid%BLOOM_COLORS.length],bloomed=sim.bloomed.includes(gid);
  ctx.strokeStyle='#477d48';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y+5);ctx.quadraticCurveTo(x+2,y-10,x,y-22);ctx.stroke();leaf(ctx,x-8,y-7,-2.7,10,'#4c9b54');leaf(ctx,x+9,y-13,-.5,9,'#68ad4d');
  if(level.id===12&&gid===FINALE.saltHeartGarden){if(bloomed){ctx.save();ctx.translate(x,y-27);ctx.scale(1,.85);ctx.fillStyle='#ffb79e';ctx.strokeStyle='#ffe5a5';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,17);ctx.bezierCurveTo(-29,-2,-13,-24,0,-8);ctx.bezierCurveTo(13,-24,29,-2,0,17);ctx.fill();ctx.stroke();ctx.restore();}else{ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x,y-17);ctx.bezierCurveTo(x-22,y-33,x-13,y-49,x,y-34);ctx.bezierCurveTo(x+13,y-49,x+22,y-33,x,y-17);ctx.stroke();}}
  else if(bloomed){const n=8+Math.floor(hash2(i,gid,seed)*4);for(let k=0;k<n;k++){const a=hash2(i,k,level.id)*Math.PI*2,d=hash2(k,i,level.id+3)*15,s=8+hash2(i,k,seed+5)*4;flower(ctx,x+Math.cos(a)*d,y-27+Math.sin(a)*d,s,col,seed+k);}}
  else{ctx.fillStyle='#39794b';ctx.strokeStyle='#39794b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y-17);ctx.lineTo(x,y-34);ctx.stroke();leaf(ctx,x-7,y-24,-2.7,8,'#57964c');leaf(ctx,x+7,y-29,-.4,7,'#73aa4e');ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,y-39,7,12,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(80,38,83,.38)';ctx.beginPath();ctx.ellipse(x-3,y-40,3,8,-.25,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffd77d';ctx.beginPath();ctx.arc(x+2,y-41,2,0,Math.PI*2);ctx.fill();}
  if(gid===call){const phase=view.phase??0,pulse=1+Math.sin(phase*Math.PI*2)*.06;ctx.strokeStyle='rgba(255,206,78,.88)';ctx.lineWidth=4;ctx.beginPath();ctx.arc(x,y+7,43*pulse,0,Math.PI*2);ctx.stroke();ctx.fillStyle='rgba(255,218,112,.16)';ctx.beginPath();ctx.arc(x,y+7,39*pulse,0,Math.PI*2);ctx.fill();const n=(level.callOrder??[]).indexOf(gid)+1;ctx.fillStyle='#fffdf5';ctx.beginPath();ctx.arc(x+35,y-31,12,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#e3ad42';ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle=INK;ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(n),x+35,y-31);}
 }
}
