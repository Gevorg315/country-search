import { describe, expect, it, vi } from 'vitest';
import { debounce } from '../../src/utils/debounce';

describe('debounce', () => {
  it('should delay the function call', () => {
    vi.useFakeTimers();

    const callback = vi.fn();
    const debouncedCallback = debounce(callback, 300);

    debouncedCallback();

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(299);

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(callback).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('should reset the timer when called again', () => {
    vi.useFakeTimers();

    const callback = vi.fn();
    const debouncedCallback = debounce(callback, 300);

    debouncedCallback();

    vi.advanceTimersByTime(200);

    debouncedCallback();

    vi.advanceTimersByTime(299);

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(callback).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('should use the latest arguments', () => {
    vi.useFakeTimers();

    const callback = vi.fn();
    const debouncedCallback = debounce(callback, 300);

    debouncedCallback('sp');
    debouncedCallback('spa');
    debouncedCallback('spain');

    vi.advanceTimersByTime(300);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('spain');

    vi.useRealTimers();
  });
});
