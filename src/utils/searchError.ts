import { HttpError } from '../api/searchCountries';

export type SearchErrorType = 'aborted' | 'timeout' | 'http' | 'unknown';

export const classifySearchError = (error: unknown): SearchErrorType => {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return 'aborted';
  }

  if (error instanceof DOMException && error.name === 'TimeoutError') {
    return 'timeout';
  }

  if (error instanceof HttpError) {
    return 'http';
  }

  return 'unknown';
};
