import { mapCountryResponse } from '../api/mapCountryResponse';
import { searchCountries } from '../api/searchCountries';
import type { CountryCard } from '../types/country';
import { createRequestSignal } from '../utils/createRequestSignal';
import { debounce } from '../utils/debounce';
import { classifySearchError } from '../utils/searchError';

export type SearchStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export interface SearchState {
  status: SearchStatus;
  query: string;
  countries: CountryCard[];
  error: string | null;
}

interface SearchController {
  handleInput: (query: string) => void;
  retry: () => Promise<void>;
  destroy: () => void;
}

const DEBOUNCE_DELAY = 300;
const REQUEST_TIMEOUT = 10000;

export const createSearchController = (
  onStateChange: (state: SearchState) => void,
): SearchController => {
  let currentController: AbortController | null = null;
  let lastQuery = '';

  const updateState = (
    status: SearchStatus,
    query: string,
    countries: CountryCard[] = [],
    error: string | null = null,
  ): void => {
    onStateChange({ status, query, countries, error });
  };

  const performSearch = async (query: string): Promise<void> => {
    const controller = new AbortController();
    currentController = controller;

    updateState('loading', query);

    try {
      const signal = createRequestSignal(controller.signal, REQUEST_TIMEOUT);

      const rawCountries = await searchCountries(query, signal);

      if (controller.signal.aborted) {
        return;
      }

      const countries = rawCountries.map(mapCountryResponse);

      if (countries.length === 0) {
        updateState('empty', query);
        return;
      }

      updateState('success', query, countries);
    } catch (error) {
      const errorType = classifySearchError(error);

      if (errorType === 'aborted') {
        return;
      }

      const message =
        errorType === 'timeout'
          ? 'The request timed out. Please try again.'
          : 'Something went wrong. Please try again.';

      updateState('error', query, [], message);
    }
  };

  const debouncedSearch = debounce((query: string): void => {
    void performSearch(query);
  }, DEBOUNCE_DELAY);

  const handleInput = (query: string): void => {
    lastQuery = query.trim();

    currentController?.abort();
    currentController = null;

    if (!lastQuery) {
      updateState('idle', '');
      return;
    }

    updateState('loading', lastQuery);
    debouncedSearch(lastQuery);
  };

  const retry = async (): Promise<void> => {
    if (!lastQuery) {
      return;
    }

    currentController?.abort();
    currentController = null;

    await performSearch(lastQuery);
  };

  const destroy = (): void => {
    currentController?.abort();
    currentController = null;
  };

  return {
    handleInput,
    retry,
    destroy,
  };
};
