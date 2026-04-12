import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { i18n, Language } from '../constants/i18n';

const LANG_KEY = 'user_language';

export function useI18n() {
    const [locale, setLocale] = useState<Language>('en');

    useEffect(() => {
        loadLanguage();
    }, []);

    const loadLanguage = async () => {
        const saved = await SecureStore.getItemAsync(LANG_KEY);
        if (saved === 'ta' || saved === 'en' || saved === 'hi') {
            setLocale(saved as Language);
        }
    };

    const changeLanguage = async (lang: Language) => {
        setLocale(lang);
        await SecureStore.setItemAsync(LANG_KEY, lang);
    };

    const t = (key: keyof typeof i18n.en) => {
        return i18n[locale][key] || i18n.en[key];
    };

    return { locale, t, changeLanguage };
}
