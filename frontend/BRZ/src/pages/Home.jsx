import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, FileText, Loader2, ArrowRight } from 'lucide-react';
import { useFormContext } from '../context/FormContext';
import { analyzeImage } from '../services/aiService';

const Home = () => {
    const navigate = useNavigate();
    const { updateData, setImagePreview } = useFormContext();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);

    // ... (funkcje fileToBase64 i parseXML zostają bez zmian) ...
    const fileToBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
    });

    const parseXML = (xmlString) => {
        // ... (Twoja logika parsowania XML z poprzednich kroków) ...
        // Skopiuj ją tutaj, bo jest kluczowa
        // Pamiętaj o obsłudze błędów
        // Dla skrótu wklejam tylko wywołanie nawigacji:

        // ...parsowanie...
        navigate('/formularz');
    };

    // Musisz tu wkleić pełną funkcję parseXML z poprzedniej rozmowy!

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setImagePreview(URL.createObjectURL(file));

        try {
            const base64 = await fileToBase64(file);
            const xml = await analyzeImage(base64);
            parseXML(xml);
            // Nawigacja dzieje się w parseXML lub tutaj
        } catch (err) {
            alert("Błąd AI. Spróbuj ponownie.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-700 max-w-4xl mx-auto px-4 py-8 md:py-12">
            {/* Nagłówek semantyczny h1 */}
            <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                    Dodaj nowy przedmiot
                </h1>
                <p className="text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed">
                    Wybierz metodę wprowadzania danych.
                    System wspiera technologie asystujące oraz automatyzację AI.
                </p>
            </div>

            {loading ? (
                /* Obszar powiadomień dla czytników ekranu (aria-live) */
                <div role="status" aria-live="polite" className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-slate-200">
                    <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" aria-hidden="true" />
                    <h2 className="text-xl font-semibold text-blue-900">Analiza obrazu...</h2>
                    <span className="sr-only">Proszę czekać, sztuczna inteligencja przetwarza zdjęcie.</span>
                    <p className="text-slate-600 mt-2">Przetwarzam cechy przedmiotu</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6 lg:gap-8">

                    {/* KARTA AI - Teraz jest przyciskiem (BUTTON) */}
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="group relative flex flex-col items-start text-left bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:shadow-xl hover:border-blue-500/50 transition-all focus-gov"
                        aria-label="Dodaj przedmiot automatycznie używając zdjęcia i sztucznej inteligencji"
                    >
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors" aria-hidden="true">
                            <Camera size={36} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Automatycznie (AI)</h2>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            Wgraj zdjęcie, a system sam uzupełni opis, kategorię i cechy, oszczędzając Twój czas.
                        </p>
                        <span className="mt-auto inline-flex items-center text-blue-700 font-bold group-hover:gap-2 transition-all">
                            Rozpocznij <ArrowRight size={20} className="ml-1" aria-hidden="true" />
                        </span>

                        {/* Input ukryty, ale dostępny technicznie */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                            tabIndex="-1" // Wyłączamy z tabowania, bo sterujemy przyciskiem
                        />
                    </button>

                    {/* KARTA RĘCZNA - Też przycisk */}
                    <button
                        onClick={() => { setImagePreview(null); navigate('/formularz'); }}
                        className="group relative flex flex-col items-start text-left bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:shadow-xl hover:border-slate-400/50 transition-all focus-gov"
                        aria-label="Wypełnij formularz zgłoszenia ręcznie"
                    >
                        <div className="w-16 h-16 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-slate-800 group-hover:text-white transition-colors" aria-hidden="true">
                            <FileText size={36} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Ręcznie</h2>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            Tradycyjny formularz. Wybierz tę opcję dla przedmiotów bez zdjęć, dokumentów lub gotówki.
                        </p>
                        <span className="mt-auto inline-flex items-center text-slate-700 font-bold group-hover:gap-2 transition-all">
                            Wypełnij <ArrowRight size={20} className="ml-1" aria-hidden="true" />
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default Home;