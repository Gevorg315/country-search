import { describe, expect, it } from 'vitest';
import { HttpError } from '../../src/api/searchCountries';
import { classifySearchError } from '../../src/utils/searchError';

describe('classifySearchError', () => {
  it('should identify AbortError', () => {
    const error = new DOMException('Request aborted', 'AbortError');

    expect(classifySearchError(error)).toBe('aborted');
  });

  it('should identify TimeoutError', () => {
    const error = new DOMException('Request timed out', 'TimeoutError');

    expect(classifySearchError(error)).toBe('timeout');
  });

  it('should identify HttpError', () => {
    const error = new HttpError(500);

    expect(classifySearchError(error)).toBe('http');
  });

  it('should identify unexpected errors', () => {
    const error = new TypeError('Network error');

    expect(classifySearchError(error)).toBe('unknown');
  });
});
