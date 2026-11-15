# Design decisions

## 1. Cancellation of outdated requests

The search controller in `src/search/createSearchController.ts` uses
`AbortController` to cancel an active request whenever the input changes.
Cancellation happens immediately in `handleInput`, before the debounced
search starts. This prevents an older request from returning during the
debounce delay and displaying outdated results.

The request signal is combined with a timeout signal using
`AbortSignal.any()` in `src/utils/createRequestSignal.ts`. The timeout is
10 seconds.

Errors are classified in `src/utils/searchError.ts`:

- `AbortError` means the user changed the input or cleared the search.
  It is silently ignored because it is not a user-facing failure.
- `TimeoutError` means the request took too long and is shown as an error.
- `HttpError` represents an unsuccessful HTTP response other than 404.
- Other errors, such as network failures, are also shown to the user.

A 404 response is handled by `searchCountries` in
`src/api/searchCountries.ts` as an empty result, not as an error.

Using actual request cancellation is preferable to only checking a flag
after a response arrives: the browser can stop work on the outdated
request instead of allowing it to continue unnecessarily.

The race-condition test in `tests/search/searchRace.test.ts` verifies
that the previous request receives an abort signal and that the latest
search result is used.

## 2. Debounce delay

The debounce utility in `src/utils/debounce.ts` delays a search until
the user has stopped typing for 300 milliseconds. The delay is configured
as `DEBOUNCE_DELAY` in `src/search/createSearchController.ts`.

Without debounce, every keystroke would start a network request. A much
larger delay would make the search feel slow. 300 milliseconds is a
compromise between reducing unnecessary requests and keeping the
interface responsive.

The previous active request is aborted immediately on input change;
debounce delays only the start of the next request.

## 3. Big O complexity

### `mapCountryResponse`

The mapper in `src/api/mapCountryResponse.ts` transforms one API country
object into the application's `CountryCard` structure.

Let `L` be the number of languages in the country response.

- Time complexity: O(L), because the mapper iterates over the languages
  to create the language-name array.
- Additional space complexity: O(L), for the resulting language-name
  array.

The other fields are copied or assigned without additional loops.

### Debounce

The debounce utility stores one timer identifier and the latest
arguments. Clearing and replacing the timer takes O(1) time per call
and uses O(1) additional space.

## 4. Clean code principles

- **Single responsibility:** `searchCountries` handles HTTP requests,
  `mapCountryResponse` transforms API data, `debounce` controls timing,
  and `classifySearchError` classifies failures.
- **Separation of concerns:** request and mapping logic are independent
  of the DOM. The UI is implemented in `src/main.ts`.
- **Pure function:** `mapCountryResponse` transforms its input without
  changing the DOM or making network requests.
- **Meaningful names:** functions and variables such as
  `createSearchController`, `handleInput`, `currentController`,
  and `REQUEST_TIMEOUT` describe their purpose.
- **Small focused functions:** UI helpers such as `createCountryCard`,
  `createDetailRow`, and `showCountryDetails` keep rendering tasks
  separate.
- **Explicit error handling:** HTTP errors, timeouts, cancellations,
  and unknown errors are classified separately.
- **Testability:** utilities, API functions, mapping, error classification,
  and search-controller behavior are covered by Vitest tests without
  depending on a real API response.
