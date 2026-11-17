import assert from 'node:assert/strict';
import { createFlowSim } from '../game/src/flow-sim.js';
import { LEVELS } from '../game/src/levels.js';
import { FINALE } from '../game/src/salt.js';

let failed = false;

for (const level of LEVELS) {
  let gardens = 0;
  try {
    gardens = [...level.rows.join('')].filter(tile => tile === 'G').length;
    assert.equal(gardens, level.callOrder.length, 'garden count mismatch');
    assert.deepEqual([...level.callOrder].sort((a, b) => a - b), Array.from({ length: gardens }, (_, i) => i), 'callOrder is not a permutation');

    const finale = level.id === 12;
    const scrambled = createFlowSim(level);
    for (let guard = 0; guard < 60 && !scrambled.won && !scrambled.stalled; guard++) {
      const step = scrambled.stepsUsed + 1;
      if (finale) for (const item of FINALE.crustSchedule) if (item.step === step) scrambled.crust(item.tile);
      scrambled.step();
    }
    assert.equal(scrambled.won, false, 'scrambled layout is already won');

    const sim = createFlowSim(level);
    for (const [tile, rot] of Object.entries(level.solution.turns)) assert.equal(sim.setRotation(Number(tile), rot), true, `turn ${tile} rejected`);
    for (const tile of level.solution.patches) assert.equal(sim.applyClay(tile), true, `patch ${tile} rejected`);

    const bloomStep = new Map();
    let phase2Step = null;
    let crackStep = null;
    let applyPhase2PatchesNext = false;
    let phase2PatchesApplied = !finale;
    const limit = level.sun + 30;
    for (let guard = 0; guard < limit && !sim.won && !sim.stalled; guard++) {
      const nextStep = sim.stepsUsed + 1;
      if (finale) for (const item of FINALE.crustSchedule) if (item.step === nextStep) sim.crust(item.tile);
      const events = sim.step();
      for (const event of events) if (event.type === 'bloom') bloomStep.set(event.gardenId, sim.stepsUsed);

      if (finale && phase2Step === null && sim.bloomed.length >= FINALE.royalFirst) {
        phase2Step = sim.stepsUsed;
        for (const [tile, rot] of Object.entries(level.solution.phase2.turns)) assert.equal(sim.setRotation(Number(tile), rot), true, `phase 2 turn ${tile} rejected`);
        assert.equal(sim.addSpring(FINALE.saltSpring.tile, FINALE.saltSpring.rot), true, 'salt spring rejected');
      }
      if (finale && phase2Step !== null && crackStep === null && sim.stepsUsed === phase2Step + FINALE.crackAfterPhase2Steps) {
        assert.equal(sim.crack(FINALE.crackTile), true, 'scripted crack rejected');
        crackStep = sim.stepsUsed;
        applyPhase2PatchesNext = true;
      } else if (finale && applyPhase2PatchesNext) {
        for (const tile of level.solution.phase2.patches) assert.equal(sim.applyClay(tile), true, `phase 2 patch ${tile} rejected`);
        phase2PatchesApplied = true;
        applyPhase2PatchesNext = false;
      }
    }
    assert.equal(sim.won, true, `not won (${sim.bloomed.length}/${gardens}, stalled=${sim.stalled})`);
    assert.ok(sim.stepsUsed <= level.sun, `sun exhausted (${sim.stepsUsed}/${level.sun})`);
    assert.equal(bloomStep.size, gardens, 'not every garden has a recorded bloom step');
    assert.deepEqual([...bloomStep.keys()].sort((a, b) => bloomStep.get(a) - bloomStep.get(b) || a - b), level.callOrder, 'callOrder does not match bloom order');
    if (finale) assert.equal(phase2PatchesApplied, true, 'phase 2 patches were not applied');
    console.log(`L${level.id} ${level.name} | ${gardens} gardens | solution ${sim.stepsUsed}/${level.sun} steps | PASS`);
  } catch (error) {
    failed = true;
    console.log(`L${level.id} ${level.name} | ${gardens} gardens | FAIL: ${error.message}`);
  }
}

if (failed) process.exitCode = 1;
