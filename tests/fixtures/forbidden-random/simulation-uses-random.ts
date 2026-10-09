export const forbiddenSimulationRandomness = () => ({
  sample: Math.random(),
  id: globalThis.crypto.randomUUID(),
});
