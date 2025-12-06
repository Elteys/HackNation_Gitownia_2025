import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
    // Stan czcionki: 0 (normalna), 1 (średnia), 2 (duża)
    const [fontSizeLevel, setFontSizeLevel] = useState(() => {
        return parseInt(localStorage.getItem('fontSizeLevel') || '0');
    });

    // Stan kontrastu: false (normalny), true (wysoki - żółty na czarnym)
    const [highContrast, setHighContrast] = useState(() => {
        return localStorage.getItem('highContrast') === 'true';
    });

    // Efekt: Skalowanie czcionki (REM)
    useEffect(() => {
        const html = document.documentElement;
        if (fontSizeLevel === 0) html.style.fontSize = '16px'; // 100%
        if (fontSizeLevel === 1) html.style.fontSize = '18px'; // ~112%
        if (fontSizeLevel === 2) html.style.fontSize = '20px'; // ~125%

        localStorage.setItem('fontSizeLevel', fontSizeLevel);
    }, [fontSizeLevel]);

    // Efekt: Wysoki kontrast (Klasa CSS)
    useEffect(() => {
        if (highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
        localStorage.setItem('highContrast', highContrast);
    }, [highContrast]);

    const toggleContrast = () => setHighContrast(prev => !prev);

    const increaseFont = () => setFontSizeLevel(prev => Math.min(prev + 1, 2));
    const decreaseFont = () => setFontSizeLevel(prev => Math.max(prev - 1, 0));
    const resetSettings = () => {
        setFontSizeLevel(0);
        setHighContrast(false);
    };

    return (
        <AccessibilityContext.Provider value={{
            fontSizeLevel,
            highContrast,
            toggleContrast,
            increaseFont,
            decreaseFont,
            resetSettings
        }}>
            {children}
        </AccessibilityContext.Provider>
    );
};

export const useAccessibility = () => useContext(AccessibilityContext);