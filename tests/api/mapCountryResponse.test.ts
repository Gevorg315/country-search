import { describe, expect, it } from 'vitest';
import { mapCountryResponse } from '../../src/api/mapCountryResponse';

describe('mapCountryResponse', () => {
  it('should map API country data to a country card', () => {
    const rawCountry = {
      name: 'Spain',
      flag: '🇪🇸',
      capital: 'Madrid',
      region: 'Europe',
      population: 47351567,
      languages: [{ name: 'Spanish' }],
    };

    expect(mapCountryResponse(rawCountry)).toEqual({
      name: 'Spain',
      flag: '🇪🇸',
      capital: 'Madrid',
      region: 'Europe',
      population: 47351567,
      languages: ['Spanish'],
    });
  });

  it('should map multiple languages', () => {
    const rawCountry = {
      name: 'Switzerland',
      flag: '🇨🇭',
      capital: 'Bern',
      region: 'Europe',
      population: 8796669,
      languages: [{ name: 'German' }, { name: 'French' }, { name: 'Italian' }],
    };

    expect(mapCountryResponse(rawCountry).languages).toEqual([
      'German',
      'French',
      'Italian',
    ]);
  });

  it('should handle an empty languages array', () => {
    const rawCountry = {
      name: 'Example',
      flag: '🏳️',
      capital: 'Example City',
      region: 'Unknown',
      population: 1000,
      languages: [],
    };

    expect(mapCountryResponse(rawCountry).languages).toEqual([]);
  });
});
