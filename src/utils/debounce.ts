export const debounce = <Arguments extends unknown[]>(
  callback: (...args: Arguments) => void,
  delay: number,
): ((...args: Arguments) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return (...args: Arguments): void => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
};
