import { LEVELS } from './levels.js';
import { createFlowSim } from './flow-sim.js';
import { createHarmony, starsFor } from './harmony.js';
import { FINALE } from './salt.js';
export const STEP_MS = 260;
const gardenCount = level => level.rows.join('').split('G').length - 1;
export function createGame() {
  const game = { screen:'title', levelIndex:0, level:null, sim:null, harmony:null, flowing:false, paused:false, muted:false, cursor:0, message:'', banner:null, events:[], progress:{}, phase:1, flipStep:0, crackStep:0, score:0, freshTiles:new Set(), accumulator:0, finaleCracked:false };
  game.startLevel = i => { i=Math.max(0,Math.min(LEVELS.length-1,Math.trunc(i))); game.levelIndex=i; game.level=LEVELS[i]; game.sim=createFlowSim(game.level); game.harmony=createHarmony(game.level.callOrder); game.screen='playing';game.flowing=false;game.paused=false;game.message=game.level.note;game.phase=1;game.flipStep=0;game.crackStep=0;game.finaleCracked=false;game.banner=null;game.accumulator=0;game.freshTiles=new Set();game.score=0;game.events=[]; };
  game.rotateAt = i => { if(game.screen!=='playing')return false;const t=game.sim.tileAt(i);if(!t)return false;if(['c','l','t'].includes(t.kind)&&!t.patched&&game.sim.clayLeft>0)return game.patchAt(i);if(!game.sim.setRotation(i,((t.rot??0)+1)%4))return false;game.events.push({type:'rotate',index:i});game.message='Channel turned.';return true; };
  game.patchAt = i => {if(game.screen!=='playing'||!game.sim.applyClay(i))return false;game.events.push({type:'patch',index:i});game.message=`Clay seals the crack — ${game.sim.clayLeft} left`;return true;};
  game.release = () => {if(game.screen!=='playing')return false;game.flowing=true;game.events.push({type:'release'});return true;};
  game.stepOnce = () => {
    if(game.screen!=='playing')return [];
    const finale=game.levelIndex===FINALE.levelIndex, before=new Set(game.sim.wet);
    if(finale) for(const entry of FINALE.crustSchedule) if(entry.step===game.sim.stepsUsed+1){game.sim.crust(entry.tile);game.events.push({type:'crust',index:entry.tile});game.message='Vessk salts a stone shut.';}
    const stepEvents=game.sim.step(); game.freshTiles=new Set([...game.sim.wet].filter(i=>!before.has(i)));
    for(const e of stepEvents){if(e.type==='bloom'){const expected=game.harmony.expected(),points=game.harmony.onBloom(e.gardenId);game.score=game.harmony.score;const call=game.level.callOrder.indexOf(e.gardenId)+1;const name=finale&&e.gardenId===FINALE.saltHeartGarden?'The Salt Heart':`Garden ${call}`;game.events.push({type:'bloom',gardenId:e.gardenId,points,expected});game.message=`${name} blooms! Harmony x${game.harmony.chain}`;}else if(e.type==='wash'){game.events.push(e);game.message='Salt washes clean.';}}
    if(finale&&game.phase===1&&game.sim.bloomed.length>=FINALE.royalFirst){game.phase=2;game.sim.addSpring(FINALE.saltSpring.tile,FINALE.saltSpring.rot);game.flipStep=game.sim.stepsUsed;game.crackStep=game.flipStep+FINALE.crackAfterPhase2Steps;game.banner={text:'PHASE II — VESSK SALTS THE SPRING'};game.events.push({type:'phase2'});game.message='Her salt spring opens in the east — wash the Salt Heart!';}
    if(finale&&game.phase===2&&!game.finaleCracked&&game.crackStep===game.sim.stepsUsed){game.sim.crack(FINALE.crackTile);game.finaleCracked=true;game.events.push({type:'crack'});game.banner={text:'VESSK CRACKS THE CHANNEL'};game.message='The main channel splits! Patch it with clay or re-route.';}
    if(game.sim.won){game.screen='won';game.flowing=false;const stars=starsFor({won:true,stepsUsed:game.sim.stepsUsed,sun:game.level.sun,bestChain:game.harmony.best,gardenCount:gardenCount(game.level)});game.progress[game.level.id]=Math.max(game.progress[game.level.id]??0,stars);game.events.push({type:'win',stars});}else if(game.sim.stepsUsed>=game.level.sun){game.screen='lost';game.flowing=false;game.events.push({type:'lose'});}
    return stepEvents;
  };
  game.update=dt=>{if(game.screen!=='playing'||!game.flowing||game.paused)return;game.accumulator+=dt;while(game.accumulator>=STEP_MS&&game.screen==='playing'){game.accumulator-=STEP_MS;game.stepOnce();}};
  game.restart=()=>game.startLevel(game.levelIndex);game.nextLevel=()=>game.startLevel(Math.min(game.levelIndex+1,11));game.toTitle=()=>{game.screen='title';game.flowing=false;};game.drainEvents=()=>{const e=game.events;game.events=[];return e;};
  return game;
}
