import React, { useEffect } from 'react';
import { useFormContext } from '../context/FormContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Tag, Info, ListFilter } from 'lucide-react';
import { KATEGORIE, STANY } from '../utils/dictionaries';

const FormPage = () => {
    const { formData, updateData, imagePreview } = useFormContext();
    const navigate = useNavigate();

    const updateCecha = (field, value) => {
        updateData({ ...formData, cechy: { ...formData.cechy, [field]: value } });
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-10 animate-in slide-in-from-right-8 duration-500">

            {/* Header z poprawną strukturą nagłówków */}
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Szczegóły zguby</h1>
                    <p className="text-slate-600 mt-1">Zweryfikuj poprawność danych przed publikacją.</p>
                </div>
                {imagePreview && (
                    <div className="relative group shrink-0">
                        <img src={imagePreview} alt="Podgląd znalezionego przedmiotu" className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl shadow-md border-2 border-white" />
                        <span className="absolute -bottom-2 -right-2 bg-green-700 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-sm">AI</span>
                    </div>
                )}
            </header>

            {/* Rola 'main' w formularzu nie jest konieczna, jeśli jest w App.jsx, ale 'form' tak */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">

                {/* SEKCJA 1 */}
                <div className="bg-slate-50 p-6 border-b border-slate-200">
                    <h2 className="text-base font-bold text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <ListFilter size={18} aria-hidden="true" /> Klasyfikacja
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* KATEGORIA - ZWIĄZANIE LABEL Z INPUTEM */}
                        <div className="space-y-2">
                            <label htmlFor="kategoria" className="text-sm font-bold text-slate-800">Kategoria główna</label>
                            <select
                                id="kategoria"
                                className="w-full p-3 md:p-4 bg-white border border-slate-400 rounded-xl text-slate-900 focus-gov transition-all shadow-sm"
                                value={formData.kategoria}
                                onChange={(e) => updateData('kategoria', e.target.value)}
                            >
                                <option value="">-- Wybierz kategorię --</option>
                                {Object.keys(KATEGORIE).map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="podkategoria" className="text-sm font-bold text-slate-800">Podkategoria</label>
                            <select
                                id="podkategoria"
                                className="w-full p-3 md:p-4 bg-white border border-slate-400 rounded-xl text-slate-900 focus-gov transition-all shadow-sm disabled:bg-slate-100 disabled:text-slate-500"
                                value={formData.podkategoria}
                                onChange={(e) => updateData('podkategoria', e.target.value)}
                                disabled={!formData.kategoria}
                            >
                                <option value="">-- Wybierz podkategorię --</option>
                                {formData.kategoria && KATEGORIE[formData.kategoria]?.map(sub => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                                {!KATEGORIE[formData.kategoria]?.includes(formData.podkategoria) && formData.podkategoria && (
                                    <option value={formData.podkategoria}>{formData.podkategoria} (AI)</option>
                                )}
                            </select>
                        </div>
                    </div>
                </div>

                {/* SEKCJA 2 */}
                <div className="p-6 md:p-8 space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="nazwa" className="text-sm font-bold text-slate-800">Nazwa przedmiotu</label>
                        <input
                            id="nazwa"
                            type="text"
                            className="w-full p-3 md:p-4 bg-slate-50 border border-slate-400 rounded-xl text-slate-900 focus-gov placeholder:text-slate-500"
                            value={formData.nazwa}
                            onChange={(e) => updateData('nazwa', e.target.value)}
                            placeholder="np. Smartfon Samsung Galaxy S20"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="opis" className="text-sm font-bold text-slate-800 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                            Opis wizualny
                            <span className="text-xs text-slate-600 font-normal mt-1 sm:mt-0">Unikaj danych osobowych (RODO)</span>
                        </label>
                        <textarea
                            id="opis"
                            rows="5"
                            className="w-full p-3 md:p-4 bg-slate-50 border border-slate-400 rounded-xl text-slate-900 focus-gov placeholder:text-slate-500"
                            value={formData.opis}
                            onChange={(e) => updateData('opis', e.target.value)}
                        />
                    </div>

                    {/* GRID CECH */}
                    <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-200" role="group" aria-labelledby="cechy-header">
                        <h2 id="cechy-header" className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Tag size={18} aria-hidden="true" /> Cechy identyfikacyjne
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="cecha-kolor" className="block text-xs font-bold text-slate-700 mb-1 uppercase">Kolor</label>
                                <input
                                    id="cecha-kolor"
                                    type="text"
                                    className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus-gov"
                                    value={formData.cechy?.kolor || ''}
                                    onChange={(e) => updateCecha('kolor', e.target.value)}
                                    placeholder="np. czarny"
                                />
                            </div>
                            <div>
                                <label htmlFor="cecha-marka" className="block text-xs font-bold text-slate-700 mb-1 uppercase">Marka</label>
                                <input
                                    id="cecha-marka"
                                    type="text"
                                    className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus-gov"
                                    value={formData.cechy?.marka || ''}
                                    onChange={(e) => updateCecha('marka', e.target.value)}
                                    placeholder="np. Samsung"
                                />
                            </div>
                            <div>
                                <label htmlFor="cecha-stan" className="block text-xs font-bold text-slate-700 mb-1 uppercase">Stan</label>
                                <select
                                    id="cecha-stan"
                                    className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus-gov"
                                    value={formData.cechy?.stan || ''}
                                    onChange={(e) => updateCecha('stan', e.target.value)}
                                >
                                    <option value="">-- Wybierz --</option>
                                    {STANY.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                        <div className="space-y-2">
                            <label htmlFor="data" className="text-sm font-bold text-slate-800">Data znalezienia</label>
                            <input
                                id="data"
                                type="date"
                                className="w-full p-3 md:p-4 bg-slate-50 border border-slate-400 rounded-xl text-slate-900 focus-gov"
                                value={formData.data}
                                onChange={(e) => updateData('data', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="miejsce" className="text-sm font-bold text-slate-800">Miejsce znalezienia</label>
                            <div className="relative">
                                <input
                                    id="miejsce"
                                    type="text"
                                    className="w-full p-3 md:p-4 bg-slate-50 border border-slate-400 rounded-xl text-slate-900 focus-gov pr-10"
                                    value={formData.miejsce}
                                    onChange={(e) => updateData('miejsce', e.target.value)}
                                    placeholder="np. Park Miejski"
                                />
                                <Info size={20} className="absolute right-3 top-3.5 text-slate-500" aria-hidden="true" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Nawigacyjny - Duże przyciski dotykowe */}
                <div className="bg-slate-50 px-6 py-6 border-t border-slate-200 flex flex-col-reverse md:flex-row justify-between gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full md:w-auto px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-white focus-gov flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={20} aria-hidden="true" /> Anuluj
                    </button>
                    <button
                        onClick={() => navigate('/podsumowanie')}
                        className="w-full md:w-auto bg-blue-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-800 focus-gov flex items-center justify-center gap-2 shadow-lg"
                    >
                        Podsumowanie <ArrowRight size={20} aria-hidden="true" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FormPage;