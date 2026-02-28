
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Providing a subset of translations inline to avoid creating 50+ files.
// In a real app, these would be fetched via i18next-http-backend from /locales
const resources = {
  en: {
    translation: {
      "landing_title": "Find the Perfect Match with AI",
      "candidate": "Candidate",
      "company": "Company",
      "sign_in": "Sign In",
      "settings": "Settings"
    }
  },
  pt: {
    translation: {
      "landing_title": "Encontre a Combinação Perfeita com IA",
      "candidate": "Candidato",
      "company": "Empresa",
      "sign_in": "Entrar",
      "settings": "Configurações"
    }
  },
  es: { translation: { "landing_title": "Encuentra la coincidencia perfecta con IA" } },
  fr: { translation: { "landing_title": "Trouvez la correspondance parfaite avec l'IA" } },
  it: { translation: { "landing_title": "Trova l'abbinamento perfetto con l'IA" } },
  de: { translation: { "landing_title": "Finden Sie die perfekte Übereinstimmung mit KI" } },
  nl: { translation: { "landing_title": "Vind de perfecte match met AI" } },
  pl: { translation: { "landing_title": "Znajdź idealne dopasowanie dzięki AI" } },
  ru: { translation: { "landing_title": "Найдите идеальное совпадение с помощью ИИ" } },
  ja: { translation: { "landing_title": "AIで完璧なマッチを見つける" } },
  zh: { translation: { "landing_title": "用AI寻找完美的匹配" } }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'pt', 'es', 'fr', 'it', 'de', 'nl', 'pl', 'ru', 'ja', 'zh'],
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
