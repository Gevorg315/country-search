import { createSearchController } from './search/createSearchController.js';
import type { CountryCard } from './types/country.js';

const createElement = <Tag extends keyof HTMLElementTagNameMap>(
  tag: Tag,
  className = '',
  text = '',
): HTMLElementTagNameMap[Tag] => {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text) {
    element.textContent = text;
  }

  return element;
};

// Main page
const app = createElement('main', 'app');
const header = createElement('header', 'header');
const heading = createElement('h1', 'title', 'Country Search');
const subtitle = createElement(
  'p',
  'subtitle',
  'Discover countries around the world.',
);

header.append(heading, subtitle);

// Search
const searchSection = createElement('section', 'search-section');
const searchLabel = createElement('label', 'search-label', 'Search countries');
const searchInput = createElement('input', 'search-input');

searchInput.type = 'search';
searchInput.placeholder = 'Type a country name...';
searchInput.autocomplete = 'off';
searchInput.setAttribute('aria-label', 'Search countries');

searchLabel.append(searchInput);

const statusMessage = createElement('p', 'status-message');
statusMessage.setAttribute('role', 'status');
statusMessage.setAttribute('aria-live', 'polite');

const retryButton = createElement('button', 'retry-button', 'Try again');
retryButton.type = 'button';
retryButton.hidden = true;

searchSection.append(searchLabel, statusMessage, retryButton);

// Search results
const resultsSection = createElement('section', 'results-section');
const resultsList = createElement('div', 'results-list');
resultsSection.append(resultsList);

// Country details
const detailsSection = createElement('section', 'details-section');
detailsSection.setAttribute('aria-live', 'polite');

app.append(header, searchSection, resultsSection, detailsSection);
document.body.append(app);

const formatNumber = (value: number): string =>
  new Intl.NumberFormat('en-US').format(value);

const createDetailRow = (label: string, value: string): HTMLElement => {
  const row = createElement('div', 'detail-row');
  const title = createElement('span', 'detail-label', label);
  const content = createElement('span', 'detail-value', value);

  row.append(title, content);

  return row;
};

const showCountryDetails = (country: CountryCard): void => {
  detailsSection.replaceChildren();

  const detailsCard = createElement('article', 'details-card');

  const closeButton = createElement('button', 'close-button', 'Close');
  closeButton.type = 'button';
  closeButton.addEventListener('click', () => {
    detailsSection.replaceChildren();
  });

  const title = createElement(
    'h2',
    'details-title',
    `${country.flag} ${country.name}`,
  );

  const descriptionParts = [
    country.name,
    country.subregion
      ? `is located in ${country.subregion}`
      : `is in ${country.region}`,
    country.nativeName ? `and is known locally as ${country.nativeName}` : '',
  ].filter(Boolean);

  const description = createElement(
    'p',
    'details-description',
    `${descriptionParts.join(' ')}.`,
  );

  const detailsList = createElement('div', 'details-list');

  detailsList.append(
    createDetailRow('Capital', country.capital),
    createDetailRow('Region', country.region),
    createDetailRow('Population', formatNumber(country.population)),
    createDetailRow(
      'Area',
      country.area !== undefined
        ? `${formatNumber(country.area)} km²`
        : 'Not available',
    ),
    createDetailRow(
      'Borders',
      country.borders?.length
        ? country.borders.join(', ')
        : 'No land borders or information unavailable',
    ),
    createDetailRow(
      'Languages',
      country.languages.length ? country.languages.join(', ') : 'Not available',
    ),
    createDetailRow(
      'Currencies',
      country.currencies?.length
        ? country.currencies
            .map(
              (currency) =>
                `${currency.name} (${currency.code}, ${currency.symbol})`,
            )
            .join(', ')
        : 'Not available',
    ),
  );

  detailsCard.append(closeButton, title, description, detailsList);
  detailsSection.append(detailsCard);
};

const createCountryCard = (country: CountryCard): HTMLButtonElement => {
  const card = createElement('button', 'country-card');
  card.type = 'button';
  card.setAttribute('aria-label', `View details for ${country.name}`);

  const flag = createElement('span', 'country-flag', country.flag);
  flag.setAttribute('aria-hidden', 'true');

  const information = createElement('div', 'country-information');

  const name = createElement('h2', 'country-name', country.name);
  const capital = createElement(
    'p',
    'country-meta',
    `Capital: ${country.capital}`,
  );
  const region = createElement(
    'p',
    'country-meta',
    `Region: ${country.region}`,
  );
  const population = createElement(
    'p',
    'country-meta',
    `Population: ${formatNumber(country.population)}`,
  );

  information.append(name, capital, region, population);
  card.append(flag, information);

  card.addEventListener('click', () => {
    showCountryDetails(country);
  });

  return card;
};

// Search controller
const controller = createSearchController((state) => {
  resultsList.replaceChildren();
  detailsSection.replaceChildren();

  retryButton.hidden = state.status !== 'error';

  switch (state.status) {
    case 'idle':
      statusMessage.textContent = 'Start typing to search for countries.';
      break;

    case 'loading':
      statusMessage.textContent = 'Searching countries...';
      break;

    case 'success':
      statusMessage.textContent = `Found ${state.countries.length} countries.`;

      state.countries.forEach((country) => {
        resultsList.append(createCountryCard(country));
      });
      break;

    case 'empty':
      statusMessage.textContent = `No countries found for "${state.query}".`;
      break;

    case 'error':
      statusMessage.textContent =
        state.error ?? 'Something went wrong. Please try again.';
      break;
  }
});

// Input and retry events
searchInput.addEventListener('input', () => {
  controller.handleInput(searchInput.value);
});

retryButton.addEventListener('click', () => {
  void controller.retry();
});

// Initial state
statusMessage.textContent = 'Start typing to search for countries.';

window.addEventListener('pagehide', () => {
  controller.destroy();
});
