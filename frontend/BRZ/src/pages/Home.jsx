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

	// Helper: Zamiana pliku na Base64
	const fileToBase64 = (file) =>
		new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result);
			reader.onerror = reject;
		});

	// Parsowanie XML zwróconego przez AI i aktualizacja stanu formularza
	const parseXML = (xmlString) => {
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

		// Helper do bezpiecznego pobierania wartości z XML
		// Uwaga: Zakładam, że AI zwraca płaskie tagi <Kolor>, <Marka> itp.
		const getText = (tag) =>
			xmlDoc.getElementsByTagName(tag)[0]?.textContent || '';

		// Aktualizacja stanu Context API
		updateData({
			kategoria: getText('Kategoria') || 'INNE',
			nazwa: getText('Nazwa'),
			opis: getText('Opis'),
			kolor: getText('Kolor'),
		});

		// Przejście do formularza po sukcesie
		navigate('/formularz');
	};

	const handleFileChange = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		setLoading(true);
		// Ustawienie podglądu obrazu
		setImagePreview(URL.createObjectURL(file));

		try {
			const base64 = await fileToBase64(file);
			const xml = await analyzeImage(base64);
			parseXML(xml); // Parsowanie i nawigacja
		} catch (err) {
			alert('Błąd AI. Spróbuj ponownie.');
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="animate-in fade-in duration-700 max-w-4xl mx-auto px-4 py-8 md:py-12">
			<div className="text-center mb-12">
				<h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
					Dodaj nowy przedmiot
				</h1>
				<p className="text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed">
					Wybierz metodę wprowadzania danych. System wspiera technologie
					asystujące oraz automatyzację AI.
				</p>
			</div>

			{loading ? (
				/* Stan ładowania AI */
				<div
					role="status"
					aria-live="polite"
					className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-slate-200"
				>
					<Loader2
						className="w-16 h-16 text-blue-600 animate-spin mb-6"
						aria-hidden="true"
					/>
					<h2 className="text-xl font-semibold text-blue-900">
						Analiza obrazu...
					</h2>
					<span className="sr-only">
						Proszę czekać, sztuczna inteligencja przetwarza zdjęcie.
					</span>
					<p className="text-slate-600 mt-2">Przetwarzam cechy przedmiotu</p>
				</div>
			) : (
				<div className="grid md:grid-cols-2 gap-6 lg:gap-8">
					{/* KARTA AI - Automatycznie (BUTTON) */}
					<button
						onClick={() => fileInputRef.current.click()}
						// Klasy zapewniające animację hover
						className="group relative flex flex-col items-start text-left bg-white p-8 rounded-3xl shadow-lg border border-slate-100 
                                   transition-all duration-400 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl hover:border-blue-500/50 focus-gov"
						aria-label="Dodaj przedmiot automatycznie używając zdjęcia i sztucznej inteligencji"
					>
						{/* IKONA: Animacja koloru ikony */}
						<div
							className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 
                                    transition-colors duration-400 group-hover:bg-blue-600 group-hover:text-white"
							aria-hidden="true"
						>
							<Camera size={36} />
						</div>
						<h2 className="text-2xl font-bold text-slate-900 mb-2">
							Automatycznie (AI)
						</h2>
						<p className="text-slate-600 mb-6 leading-relaxed">
							Wgraj zdjęcie, a system sam uzupełni opis, kategorię i cechy,
							oszczędzając Twój czas.
						</p>
						{/* STRZAŁKA I TEKST: Użycie inline-flex items-center dla idealnego pionowego centrowania */}
						<span className="mt-auto inline-flex items-center text-blue-700 font-bold transition-all duration-400">
							Rozpocznij{' '}
							<ArrowRight
								size={20}
								className="ml-1 transition-transform group-hover:translate-x-1"
								aria-hidden="true"
							/>
						</span>

						{/* Input ukryty, do którego klika przycisk */}
						<input
							type="file"
							ref={fileInputRef}
							className="hidden"
							accept="image/*"
							onChange={handleFileChange}
							tabIndex="-1"
						/>
					</button>

					{/* KARTA RĘCZNA (BUTTON) */}
					<button
						onClick={() => {
							setImagePreview(null);
							navigate('/formularz');
						}}
						// Klasy zapewniające animację hover
						className="group relative flex flex-col items-start text-left bg-white p-8 rounded-3xl shadow-lg border border-slate-100 
                                   transition-all duration-400 ease-in-out transform hover:-translate-y-1 hover:shadow-xl hover:border-slate-400/50 focus-gov"
						aria-label="Wypełnij formularz zgłoszenia ręcznie"
					>
						{/* IKONA: Animacja koloru ikony */}
						<div
							className="w-16 h-16 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mb-6 
                                    transition-colors duration-400 group-hover:bg-slate-800 group-hover:text-white"
							aria-hidden="true"
						>
							<FileText size={36} />
						</div>
						<h2 className="text-2xl font-bold text-slate-900 mb-2">Ręcznie</h2>
						<p className="text-slate-600 mb-6 leading-relaxed">
							Tradycyjny formularz. Wybierz tę opcję dla przedmiotów bez zdjęć,
							dokumentów lub gotówki.
						</p>
						{/* STRZAŁKA I TEKST: Użycie inline-flex items-center dla idealnego pionowego centrowania */}
						<span className="mt-auto inline-flex items-center text-slate-700 font-bold transition-all duration-400">
							Wypełnij{' '}
							<ArrowRight
								size={20}
								className="ml-1 transition-transform group-hover:translate-x-1"
								aria-hidden="true"
							/>
						</span>
					</button>
				</div>
			)}
		</div>
	);
};

export default Home;
