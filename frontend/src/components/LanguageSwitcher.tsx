import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'pt', label: 'PT' },
  { code: 'es', label: 'ES' },
  { code: 'fr', label: 'FR' },
  { code: 'it', label: 'IT' },
  { code: 'de', label: 'DE' },
] as const

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Language">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => i18n.changeLanguage(code)}
          className={`px-2 py-1 rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-950 ${
            i18n.language === code || i18n.language.startsWith(code)
              ? 'bg-cyan-500/20 text-cyan-400'
              : 'text-gray-500 hover:text-gray-300'
          }`}
          aria-pressed={i18n.language === code || i18n.language.startsWith(code)}
          aria-label={`Language: ${label}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
