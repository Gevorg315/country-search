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

const createResponse = (countries: unknown[], status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => countries,
});

describe('createSearchController', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('should not send a request for an empty query', () => {
    vi.useFakeTimers();

    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const onStateChange = vi.fn();
    const controller = createSearchController(onStateChange);

    controller.handleInput('');

    expect(fetchMock).not.toHaveBeenCalled();
    expect(onStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'idle' }),
    );
  });

  it('should search after the debounce delay', async () => {
    vi.useFakeTimers();

    const fetchMock = vi
      .fn()
      .mockResolvedValue(createResponse([countryResponse]));

    vi.stubGlobal('fetch', fetchMock);

    const onStateChange = vi.fn();
    const controller = createSearchController(onStateChange);

    controller.handleInput('spain');

    expect(fetchMock).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(300);

    expect(fetchMock).toHaveBeenCalledOnce();

    expect(fetchMock).toHaveBeenCalledWith(
      'https://countries.dev/name/spain',
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    );

    expect(onStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        status: 'success',
        query: 'spain',
        countries: [
          expect.objectContaining({
            name: 'Spain',
            capital: 'Madrid',
            languages: ['Spanish'],
          }),
        ],
      }),
    );
  });

  it('should show empty state when no countries are found', async () => {
    vi.useFakeTimers();

    const fetchMock = vi.fn().mockResolvedValue(createResponse([], 404));

    vi.stubGlobal('fetch', fetchMock);

    const onStateChange = vi.fn();
    const controller = createSearchController(onStateChange);

    controller.handleInput('unknowncountry');

    await vi.advanceTimersByTimeAsync(300);

    expect(onStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        status: 'empty',
        countries: [],
      }),
    );
  });

  it('should show an error and retry the last query', async () => {
    vi.useFakeTimers();

    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Network error'))
      .mockResolvedValueOnce(createResponse([countryResponse]));

    vi.stubGlobal('fetch', fetchMock);

    const onStateChange = vi.fn();
    const controller = createSearchController(onStateChange);

    controller.handleInput('spain');

    await vi.advanceTimersByTimeAsync(300);

    expect(onStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        status: 'error',
        query: 'spain',
      }),
    );

    await controller.retry();

    expect(fetchMock).toHaveBeenCalledTimes(2);

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://countries.dev/name/spain',
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    );

    expect(onStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        status: 'success',
        query: 'spain',
      }),
    );
  });
});
