import { afterEach, describe, expect, it, vi } from 'vitest';
import { HttpError, searchCountries } from '../../src/api/searchCountries';

describe('searchCountries', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should fetch countries by query and return the response data', async () => {
    const countries = [
      {
        name: 'Spain',
        capital: 'Madrid',
      },
    ];

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(countries), {
        status: 200,
      }),
    );

    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();

    const result = await searchCountries('Spain', controller.signal);

    expect(fetchMock).toHaveBeenCalledWith('https://countries.dev/name/Spain', {
      signal: controller.signal,
    });

    expect(result).toEqual(countries);
  });

  it('should encode the search query in the URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
      }),
    );

    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();

    await searchCountries('United States', controller.signal);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://countries.dev/name/United%20States',
      {
        signal: controller.signal,
      },
    );
  });

  it('should return an empty array when no countries are found', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 404,
      }),
    );

    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();

    const result = await searchCountries('UnknownCountry', controller.signal);

    expect(result).toEqual([]);
  });

  it('should throw HttpError for unsuccessful responses other than 404', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 500,
        statusText: 'Internal Server Error',
      }),
    );

    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();

    await expect(
      searchCountries('Spain', controller.signal),
    ).rejects.toBeInstanceOf(HttpError);

    await expect(
      searchCountries('Spain', controller.signal),
    ).rejects.toMatchObject({
      status: 500,
    });
  });
});
