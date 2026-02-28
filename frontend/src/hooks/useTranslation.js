
import { useState, useEffect } from 'react';

export function useTranslation() {
  const [translations, setTranslations] = useState(null);
  const [lang, setLang] = useState('en');

  useEffect(() => {
    fetch('/translations.json')
      .then(res => res.json())
      .then(data => setTranslations(data))
      .catch(console.error);
  }, []);

  const t = (section, key) => {
    if (!translations) return '';
    return translations[section]?.[key]?.[lang] || translations[section]?.[key]?.['en'] || key;
  };

  return { t, lang, setLang };
}
