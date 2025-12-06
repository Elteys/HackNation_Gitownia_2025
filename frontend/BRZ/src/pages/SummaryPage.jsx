import React from 'react';
import { useFormContext } from '../context/FormContext';
import { useNavigate } from 'react-router-dom';
import { Upload, Edit3, CheckCircle } from 'lucide-react';

const SummaryPage = () => {
    const { formData } = useFormContext();
    const navigate = useNavigate();

    const handlePublish = () => {
        // Tutaj normalnie byłby strzał do API
        alert("Dane opublikowane! Generuję kod QR...");
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 animate-in zoom-in-95 duration-500">

            <div className="text-center mb-10">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-green-50">
                    <CheckCircle size={32} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Weryfikacja danych</h2>
                <p className="text-slate-500 mt-2">Upewnij się, że wszystko się zgadza przed wysyłką do BIP.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="p-8">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Podgląd rekordu JSON/XML</h3>

                    <dl className="grid grid-cols-1 gap-y-6 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-slate-500">Kategoria</dt>
                            <dd className="mt-1 text-lg font-semibold text-slate-900">{formData.kategoria || "—"}</dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-slate-500">Nazwa</dt>
                            <dd className="mt-1 text-lg font-semibold text-slate-900">{formData.nazwa || "—"}</dd>
                        </div>
                        <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-slate-500">Opis przedmiotu</dt>
                            <dd className="mt-1 text-sm text-slate-700 bg-slate-50 p-4 rounded-lg italic border border-slate-100">
                                "{formData.opis}"
                            </dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-slate-500">Data znalezienia</dt>
                            <dd className="mt-1 text-base text-slate-900">{formData.data}</dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-slate-500">Lokalizacja</dt>
                            <dd className="mt-1 text-base text-slate-900">{formData.miejsce || "Nie podano"}</dd>
                        </div>
                    </dl>
                </div>

                <div className="bg-slate-50 px-8 py-5 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
                    <button
                        onClick={() => navigate('/formularz')}
                        className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-white transition-colors flex justify-center items-center gap-2"
                    >
                        <Edit3 size={18} /> Edytuj
                    </button>
                    <button
                        onClick={handlePublish}
                        className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 flex justify-center items-center gap-2"
                    >
                        <Upload size={18} /> OPUBLIKUJ DANE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SummaryPage;