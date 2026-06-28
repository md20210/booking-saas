"use client"

import { useState, useEffect } from 'react'
import { defaultLocale, type Locale } from './locales'

export function useTranslations(locale?: Locale) {
  const [messages, setMessages] = useState<any>(null)
  const currentLocale = locale || defaultLocale

  useEffect(() => {
    async function loadMessages() {
      try {
        const msgs = await import(`./messages/${currentLocale}.json`)
        setMessages(msgs.default)
      } catch (error) {
        console.error(`Failed to load messages for locale ${currentLocale}`, error)
        // Fallback to English
        const fallback = await import(`./messages/en.json`)
        setMessages(fallback.default)
      }
    }
    loadMessages()
  }, [currentLocale])

  const t = (key: string): string => {
    if (!messages) return key

    const keys = key.split('.')
    let value = messages

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return key // Return key if translation not found
      }
    }

    return typeof value === 'string' ? value : key
  }

  return { t, messages, locale: currentLocale }
}
