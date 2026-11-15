export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface CountryCard {
  name: string;
  flag: string;
  capital: string;
  region: string;
  population: number;
  languages: string[];
  subregion?: string;
  nativeName?: string;
  area?: number;
  borders?: string[];
  currencies?: Currency[];
}
