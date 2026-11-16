import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSearchController } from '../../src/search/createSearchController';

const countryResponse = {
  name: 'Spain',
  flag: '🇪🇸',
  capital: 'Madrid',
  region: 'Europe',
  population: 47350000,
  languages: [{ name: 'Spanish' }],
};

describe('search race condition', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('should abort an outdated request and display only the latest result', async () => {
    vi.useFakeTimers();

    let firstSignal: AbortSignal | undefined;

    const fetchMock = vi.fn(
      (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const url = String(input);
        const signal = init?.signal as AbortSignal;

        if (url.endsWith('/sp')) {
          firstSignal = signal;

          return new Promise((_resolve, reject) => {
            signal.addEventListener('abort', () => reject(signal.reason), {
              once: true,
            });
          });
        }

        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => [countryResponse],
        } as Response);
      },
    );

    vi.stubGlobal('fetch', fetchMock);

    const onStateChange = vi.fn();
    const controller = createSearchController(onStateChange);

    // Start the first search.
    controller.handleInput('sp');

    await vi.advanceTimersByTimeAsync(300);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(firstSignal?.aborted).toBe(false);

    // Start a new search. The first request must be cancelled immediately.
    controller.handleInput('spain');

    expect(firstSignal?.aborted).toBe(true);

    // Allow the second debounced request to execute.
    await vi.advanceTimersByTimeAsync(300);

    expect(fetchMock).toHaveBeenCalledTimes(2);

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://countries.dev/name/spain',
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    );

    // Only the latest search result should be displayed.
    expect(onStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        status: 'success',
        query: 'spain',
        countries: [
          expect.objectContaining({
            name: 'Spain',
          }),
        ],
      }),
    );

    // The outdated request must never publish a successful result.
    expect(
      onStateChange.mock.calls.some(
        ([state]) => state.status === 'success' && state.query === 'sp',
      ),
    ).toBe(false);
  });
});
