import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import en from '../locales/en/common.json';

const I18nContext = createContext({
  locale: 'en',
  t: (k) => k
});

export function I18nProvider({ children, initialLocale = 'en' }) {
  const router = useRouter();
  const locale = router.locale || initialLocale;
  const [messages, setMessages] = useState(en);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const msgs = await import(`../locales/${locale}/common.json`);
        if (mounted) setMessages(msgs.default || msgs);
      } catch (err) {
        console.warn('i18n load failed for', locale, err);
        if (mounted) setMessages(en);
      }
    }
    load();
    return () => { mounted = false; };
  }, [locale]);

  const t = (key) => messages[key] ?? key;

  return (
    <I18nContext.Provider value={{ locale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
