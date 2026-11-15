export class HttpError extends Error {
  constructor(public readonly status: number) {
    super(`HTTP error: ${status}`);
    this.name = 'HttpError';
  }
}

export const searchCountries = async (
  query: string,
  signal: AbortSignal,
): Promise<unknown[]> => {
  const url = `https://countries.dev/name/${encodeURIComponent(query)}`;

  const response = await fetch(url, { signal });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new HttpError(response.status);
  }

  return (await response.json()) as unknown[];
};
