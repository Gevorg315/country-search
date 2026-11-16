export const createRequestSignal = (
  userSignal: AbortSignal,
  timeoutMs: number,
): AbortSignal => {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);

  return AbortSignal.any([userSignal, timeoutSignal]);
};
