"use client"

import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { locales, localeNames, localeFlags, type Locale } from '@/lib/i18n/locales'

export function LocaleSwitcher() {
  const router = useRouter()
  const pathname = usePathname()

  // Extract current locale from pathname
  const currentLocale = pathname?.split('/')[1] as Locale || 'en'
  const isValidLocale = locales.includes(currentLocale)
  const locale = isValidLocale ? currentLocale : 'en'

  const [selectedLocale, setSelectedLocale] = useState<Locale>(locale)

  const handleLocaleChange = (newLocale: Locale) => {
    setSelectedLocale(newLocale)

    // Remove the current locale from the pathname
    const pathWithoutLocale = pathname?.replace(/^\/[a-z]{2}/, '') || '/'

    // If the new locale is the default ('en'), don't add it to the URL
    const newPath = newLocale === 'en'
      ? pathWithoutLocale || '/'
      : `/${newLocale}${pathWithoutLocale}`

    router.push(newPath)
    router.refresh()
  }

  return (
    <Select value={selectedLocale} onValueChange={handleLocaleChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue>
          <div className="flex items-center gap-2">
            <span>{localeFlags[selectedLocale]}</span>
            <span>{localeNames[selectedLocale]}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            <div className="flex items-center gap-2">
              <span>{localeFlags[loc]}</span>
              <span>{localeNames[loc]}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
