export const locales = ['de', 'en', 'es', 'fr', 'it', 'pt', 'nl', 'pl', 'tr', 'ja', 'zh'] as const
export type Locale = (typeof locales)[number]

export const localeNames: Record<Locale, string> = {
  de: 'Deutsch',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
  pt: 'Português',
  nl: 'Nederlands',
  pl: 'Polski',
  tr: 'Türkçe',
  ja: '日本語',
  zh: '简体中文',
}

export const localeFlags: Record<Locale, string> = {
  de: '🇩🇪',
  en: '🇬🇧',
  es: '🇪🇸',
  fr: '🇫🇷',
  it: '🇮🇹',
  pt: '🇵🇹',
  nl: '🇳🇱',
  pl: '🇵🇱',
  tr: '🇹🇷',
  ja: '🇯🇵',
  zh: '🇨🇳',
}

export const defaultLocale: Locale = 'en'
