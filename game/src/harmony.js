export function createHarmony(callOrder) {
  const state = { chain: 0, best: 0, score: 0, nextIndex: 0 };
  const bloomed = new Set();
  state.expected = () => callOrder.find(id => !bloomed.has(id)) ?? -1;
  state.onBloom = id => {
    const expected = state.expected();
    let points;
    if (id === expected) {
      state.chain = Math.min(state.chain + 1, 9);
      points = 100 * state.chain;
      state.nextIndex++;
    } else { points = 40; state.chain = 0; }
    bloomed.add(id); state.best = Math.max(state.best, state.chain); state.score += points;
    return points;
  };
  return state;
}

export function starsFor({ won, stepsUsed, sun, bestChain, gardenCount }) {
  return won ? 1 + (stepsUsed <= Math.floor(sun * .8) ? 1 : 0) + (bestChain >= gardenCount ? 1 : 0) : 0;
}
