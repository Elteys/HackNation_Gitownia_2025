import React from 'react';
import { useFormContext } from '../context/FormContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const FormPage = () => {
    const { formData, updateData, imagePreview } = useFormContext();
    const navigate = useNavigate();

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 animate-in slide-in-from-right-8 duration-500">

            {/* Header formularza */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-slate-800">Szczegóły zguby</h2>
                {imagePreview && (
                    <div className="relative group">
                        <img src={imagePreview} alt="Zguba" className="w-20 h-20 object-cover rounded-xl shadow-md border-2 border-white" />
                        <span className="absolute -bottom-2 -right-2 bg-green-500 text-white text-[10px] px-2 py-1 rounded-full font-bold">AI</span>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="p-8 space-y-6">

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Kategoria</label>
                            <select
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.kategoria}
                                onChange={(e) => updateData('kategoria', e.target.value)}
                            >
                                <option value="">Wybierz...</option>
                                <option value="ELEKTRONIKA">Elektronika</option>
                                <option value="DOKUMENTY">Dokumenty</option>
                                <option value="INNE">Inne</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Nazwa</label>
                            <input
                                type="text"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.nazwa}
                                onChange={(e) => updateData('nazwa', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Opis (Publiczny)</label>
                        <textarea
                            rows="4"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={formData.opis}
                            onChange={(e) => updateData('opis', e.target.value)}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Data znalezienia</label>
                            <input
                                type="date"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.data}
                                onChange={(e) => updateData('data', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Miejsce</label>
                            <input
                                type="text"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.miejsce}
                                onChange={(e) => updateData('miejsce', e.target.value)}
                                placeholder="np. Park Miejski"
                            />
                        </div>
                    </div>

                </div>

                {/* Footer formularza */}
                <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="text-slate-500 font-semibold hover:text-slate-800 flex items-center gap-2"
                    >
                        <ArrowLeft size={18} /> Anuluj
                    </button>
                    <button
                        onClick={() => navigate('/podsumowanie')}
                        className="bg-blue-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20"
                    >
                        Podsumowanie <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FormPage;