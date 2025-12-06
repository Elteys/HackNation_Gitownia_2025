import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { Sun, Type } from 'lucide-react';

const WcagTools = () => {
    const { toggleContrast, increaseFont, decreaseFont, fontSizeLevel, highContrast } = useAccessibility();

    return (
        <div className="flex items-center gap-1 bg-slate-100 rounded-full px-2 py-1 border border-slate-200" role="group" aria-label="Narzędzia dostępności">

            {/* Zmniejsz czcionkę */}
            <button
                onClick={decreaseFont}
                disabled={fontSizeLevel === 0}
                className="w-8 h-8 flex items-center justify-center text-xs font-bold text-slate-700 hover:bg-white hover:text-blue-900 rounded-full disabled:opacity-30 transition-all focus-gov"
                aria-label="Zmniejsz czcionkę"
                title="Zmniejsz czcionkę"
            >
                A-
            </button>

            {/* Zwiększ czcionkę */}
            <button
                onClick={increaseFont}
                disabled={fontSizeLevel === 2}
                className="w-8 h-8 flex items-center justify-center text-lg font-bold text-slate-700 hover:bg-white hover:text-blue-900 rounded-full disabled:opacity-30 transition-all focus-gov"
                aria-label="Zwiększ czcionkę"
                title="Zwiększ czcionkę"
            >
                A+
            </button>

            {/* Separator */}
            <div className="w-px h-4 bg-slate-300 mx-1"></div>

            {/* Kontrast */}
            <button
                onClick={toggleContrast}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-all focus-gov ${highContrast ? 'bg-black text-yellow-400 border border-yellow-400' : 'text-slate-700 hover:bg-white hover:text-blue-900'
                    }`}
                aria-label={highContrast ? "Wyłącz wysoki kontrast" : "Włącz wysoki kontrast"}
                title="Zmień kontrast"
            >
                <Sun size={18} fill={highContrast ? "currentColor" : "none"} />
            </button>
        </div>
    );
};

export default WcagTools;