// Shared country list (ISO-2) used by the admin Shipping tab and the
// storefront cart country selector. Names are bilingual.
export interface Country {
  code: string;
  fr: string;
  en: string;
}

export const COUNTRIES: Country[] = [
  { code: "FR", fr: "France", en: "France" },
  { code: "BE", fr: "Belgique", en: "Belgium" },
  { code: "CH", fr: "Suisse", en: "Switzerland" },
  { code: "LU", fr: "Luxembourg", en: "Luxembourg" },
  { code: "MC", fr: "Monaco", en: "Monaco" },
  { code: "DE", fr: "Allemagne", en: "Germany" },
  { code: "ES", fr: "Espagne", en: "Spain" },
  { code: "IT", fr: "Italie", en: "Italy" },
  { code: "PT", fr: "Portugal", en: "Portugal" },
  { code: "NL", fr: "Pays-Bas", en: "Netherlands" },
  { code: "AT", fr: "Autriche", en: "Austria" },
  { code: "IE", fr: "Irlande", en: "Ireland" },
  { code: "GB", fr: "Royaume-Uni", en: "United Kingdom" },
  { code: "DK", fr: "Danemark", en: "Denmark" },
  { code: "SE", fr: "Suède", en: "Sweden" },
  { code: "NO", fr: "Norvège", en: "Norway" },
  { code: "FI", fr: "Finlande", en: "Finland" },
  { code: "PL", fr: "Pologne", en: "Poland" },
  { code: "CZ", fr: "Tchéquie", en: "Czechia" },
  { code: "GR", fr: "Grèce", en: "Greece" },
  { code: "US", fr: "États-Unis", en: "United States" },
  { code: "CA", fr: "Canada", en: "Canada" },
  { code: "AU", fr: "Australie", en: "Australia" },
  { code: "JP", fr: "Japon", en: "Japan" },
  { code: "AE", fr: "Émirats arabes unis", en: "United Arab Emirates" },
  { code: "MA", fr: "Maroc", en: "Morocco" },
  { code: "TN", fr: "Tunisie", en: "Tunisia" },
  { code: "DZ", fr: "Algérie", en: "Algeria" },
];

export const countryName = (code: string, lang: "fr" | "en"): string =>
  COUNTRIES.find((c) => c.code === code)?.[lang] ?? code;
