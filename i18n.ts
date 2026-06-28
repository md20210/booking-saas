import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'
import { locales, defaultLocale } from './lib/i18n/locales'

export default getRequestConfig(async ({ locale }) => {
  // Use default locale if none provided
  const validLocale = locale || defaultLocale

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(validLocale as any)) notFound()

  return {
    locale: validLocale,
    messages: (await import(`./lib/i18n/messages/${validLocale}.json`)).default,
  }
})
