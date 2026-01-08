'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, TranslationKey, languageNames } from './translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey) => string;
    languageNames: typeof languageNames;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('tr');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Load saved language from localStorage
        const savedLang = localStorage.getItem('lms_language') as Language;
        if (savedLang && (savedLang === 'tr' || savedLang === 'en' || savedLang === 'jp')) {
            setLanguageState(savedLang);
        }
        setIsLoaded(true);
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('lms_language', lang);
    };

    const t = (key: TranslationKey): string => {
        return translations[language][key] || translations.tr[key] || key;
    };

    // Don't render until language is loaded to prevent hydration mismatch
    if (!isLoaded) {
        return null;
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, languageNames }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

// Export for convenience
export { languageNames };
export type { Language, TranslationKey };
