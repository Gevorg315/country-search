import type { CountryCard, Currency } from '../types/country.js';

interface RawCountry {
  name: string;
  flag: string;
  capital: string;
  region: string;
  population: number;
  languages: { name: string }[];
  subregion?: string;
  nativeName?: string;
  area?: number;
  borders?: string[];
  currencies?: Currency[];
}

export const mapCountryResponse = (raw: unknown): CountryCard => {
  const country = raw as RawCountry;

  return {
    name: country.name,
    flag: country.flag,
    capital: country.capital,
    region: country.region,
    population: country.population,
    languages: country.languages.map((language) => language.name),
    ...(country.subregion !== undefined && {
      subregion: country.subregion,
    }),
    ...(country.nativeName !== undefined && {
      nativeName: country.nativeName,
    }),
    ...(country.area !== undefined && {
      area: country.area,
    }),
    ...(country.borders !== undefined && {
      borders: country.borders,
    }),
    ...(country.currencies !== undefined && {
      currencies: country.currencies,
    }),
  };
};
