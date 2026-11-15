import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRequestSignal } from '../../src/utils/createRequestSignal';

describe('createRequestSignal', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a signal with the specified timeout', () => {
    const timeoutController = new AbortController();

    const timeoutSpy = vi
      .spyOn(AbortSignal, 'timeout')
      .mockReturnValue(timeoutController.signal);

    const userController = new AbortController();

    const signal = createRequestSignal(userController.signal, 5000);

    expect(timeoutSpy).toHaveBeenCalledWith(5000);
    expect(signal.aborted).toBe(false);
  });

  it('should abort when the user cancels the request', () => {
    const timeoutController = new AbortController();

    vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeoutController.signal);

    const userController = new AbortController();

    const signal = createRequestSignal(userController.signal, 5000);

    userController.abort();

    expect(signal.aborted).toBe(true);
    expect(signal.reason.name).toBe('AbortError');
  });

  it('should abort with TimeoutError when the timeout expires', () => {
    const timeoutController = new AbortController();

    vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeoutController.signal);

    const userController = new AbortController();

    const signal = createRequestSignal(userController.signal, 5000);

    timeoutController.abort(
      new DOMException('Request timed out', 'TimeoutError'),
    );

    expect(signal.aborted).toBe(true);
    expect(signal.reason.name).toBe('TimeoutError');
  });
});
