// LanguageContext - SOLID Principle: Single Responsibility for i18n state management
// Clean Architecture: Application layer context provider

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, Language, TranslationKey, languageNames } from '../i18n/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey) => string;
    languageNames: typeof languageNames;
}

const LanguageContext = createContext<LanguageContextType>({
    language: 'tr',
    setLanguage: () => { },
    t: (key) => key,
    languageNames,
});

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
    children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('tr');
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        loadLanguage();
        // Failsafe: force loaded after 1 second
        const timer = setTimeout(() => setLoaded(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    const loadLanguage = async () => {
        try {
            const savedLang = await AsyncStorage.getItem('lms_language');
            if (savedLang && (savedLang === 'tr' || savedLang === 'en' || savedLang === 'jp')) {
                setLanguageState(savedLang as Language);
            }
        } catch (error) {
            console.log('Error loading language:', error);
        }
        setLoaded(true);
    };

    const setLanguage = async (lang: Language) => {
        setLanguageState(lang);
        try {
            await AsyncStorage.setItem('lms_language', lang);
        } catch (error) {
            console.log('Error saving language:', error);
        }
    };

    const t = (key: TranslationKey): string => {
        return translations[language][key] || translations.en[key] || key;
    };

    // Render children immediately with default language instead of blocking
    // The language will update once AsyncStorage loads

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, languageNames }}>
            {children}
        </LanguageContext.Provider>
    );
};

export default LanguageContext;
