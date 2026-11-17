export const FINALE = {
  levelIndex: 11,
  royalFirst: 4,
  crustSchedule: [{ step: 5, tile: 10 }, { step: 8, tile: 22 }, { step: 12, tile: 31 }],
  saltSpring: { tile: 7, rot: 3 },
  crackAfterPhase2Steps: 2,
  crackTile: 45,
  saltHeartGarden: 5,
};

export function finalePhase(bloomedCount) {
  return bloomedCount >= FINALE.royalFirst ? 2 : 1;
}
