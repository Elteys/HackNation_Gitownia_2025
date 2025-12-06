// src/pages/FormPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useFormContext } from '../context/FormContext';
import { useNavigate } from 'react-router-dom';
import MapModal from '../components/MapModal';
// Importy z luicde-react: zachowujemy MapPin i Search
import {
	ArrowLeft,
	ArrowRight,
	Tag,
	Info,
	ListFilter,
	MapPin,
	Search,
} from 'lucide-react';
import { KATEGORIE, STANY } from '../utils/dictionaries';

const FormPage = () => {
	const { formData, updateData, imagePreview } = useFormContext();
	const navigate = useNavigate();

	// 1. Refy i Stan dla Mapy i Modalu (z HEAD)
	const inputRef = useRef(null); // Ref do inputa 'Miejsce'
	const mapObjectRef = useRef(null); // Ref do obiektu mapy Google
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Używamy danych z formularza (lub domyślnej Warszawy) dla centrum mapy
	const currentCoords = {
		lat: formData.lat || 52.2297,
		lng: formData.lng || 21.0122,
	};

	// Helper do aktualizacji zagnieżdżonych cech (z HEAD/main)
	const updateCecha = (field, value) => {
		updateData({
			...formData,
			cechy: {
				...formData.cechy,
				[field]: value,
			},
		});
	};

	// --- FUNKCJE OBSŁUGI MAPY ---

	// Funkcja wywoływana po zapisaniu lokalizacji z Autocomplete lub Modalu
	const handleSaveLocation = (address, coords) => {
		updateData({
			miejsce: address,
			lat: coords.lat,
			lng: coords.lng,
		});
		// Odświeżenie podglądu mapy
		updateMapPreview(coords, address);
	};

	// Funkcja do inicjalizacji/aktualizacji Mapy Podglądu
	const updateMapPreview = (center, address) => {
		const mapElement = document.getElementById('map-preview');
		if (!window.google || !window.google.maps || !mapElement) return;

		if (!mapObjectRef.current) {
			// Inicjalizacja (Użycie starego, ale działającego Markera)
			mapObjectRef.current = new window.google.maps.Map(mapElement, {
				center: center,
				zoom: 15,
				disableDefaultUI: true,
			});
			mapObjectRef.current.marker = new window.google.maps.Marker({
				position: center,
				map: mapObjectRef.current,
				title: address,
			});
		} else {
			// Aktualizacja
			mapObjectRef.current.setCenter(center);
			mapObjectRef.current.marker.setPosition(center);
			mapObjectRef.current.marker.setTitle(address);
		}
	};

	// useEffect do inicjalizacji Starego Autocomplete (przywrócone dla stabilności)
	useEffect(() => {
		const initGoogleMaps = () => {
			if (!window.google || !window.google.maps) {
				setTimeout(initGoogleMaps, 100);
				return;
			}

			// --- A. Autouzupełnianie (UŻYCIE STAREGO API: Autocomplete) ---
			if (inputRef.current) {
				const autocomplete = new window.google.maps.places.Autocomplete(
					inputRef.current,
					{
						types: ['geocode'],
						componentRestrictions: { country: 'pl' },
					}
				);

				autocomplete.addListener('place_changed', () => {
					const place = autocomplete.getPlace();
					if (place.geometry && place.formatted_address) {
						const lat = place.geometry.location.lat();
						const lng = place.geometry.location.lng();

						handleSaveLocation(place.formatted_address, { lat, lng });
					}
				});
			}

			// --- B. Inicjalizacja Podglądu Mapy na starcie ---
			updateMapPreview(
				currentCoords,
				formData.miejsce || 'Wyszukaj lokalizację'
			);
		};

		initGoogleMaps();
	}, [formData.lat, formData.lng]);

	// Zabezpieczenie kategorii (bez zmian)
	useEffect(() => {
		if (formData.kategoria && KATEGORIE[formData.kategoria]) {
			const dostepnePodkategorie = KATEGORIE[formData.kategoria];
			if (!dostepnePodkategorie.includes(formData.podkategoria)) {
				// updateData('podkategoria', '');
			}
		}
	}, [formData.kategoria]);

	return (
		<div className="max-w-4xl mx-auto px-4 py-6 md:py-10 animate-in slide-in-from-right-8 duration-500">
			{/* Header (z main, z zachowaną wizualizacją imagePreview) */}
			<header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
				<div>
					<h1 className="text-2xl md:text-3xl font-bold text-slate-900">
						Szczegóły zguby
					</h1>
					<p className="text-slate-600 mt-1">
						Zweryfikuj poprawność danych przed publikacją.
					</p>
				</div>
				{imagePreview && (
					<div className="relative group shrink-0">
						<img
							src={imagePreview}
							alt="Podgląd znalezionego przedmiotu"
							className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl shadow-md border-2 border-white"
						/>
						<span className="absolute -bottom-2 -right-2 bg-green-700 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-sm">
							AI
						</span>
					</div>
				)}
			</header>

			<div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
				{/* SEKCJA 1: KLASYFIKACJA (z main) */}
				<div className="bg-slate-50 p-6 border-b border-slate-200">
					<h2 className="text-base font-bold text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-2">
						<ListFilter size={18} aria-hidden="true" /> Klasyfikacja
					</h2>

					<div className="grid md:grid-cols-2 gap-6">
						{/* KATEGORIA */}
						<div className="space-y-2">
							<label
								htmlFor="kategoria"
								className="text-sm font-bold text-slate-800"
							>
								Kategoria główna
							</label>
							<select
								id="kategoria"
								className="w-full p-3 md:p-4 bg-white border border-slate-400 rounded-xl text-slate-900 focus-gov transition-all shadow-sm"
								value={formData.kategoria}
								onChange={(e) => updateData('kategoria', e.target.value)}
							>
								<option value="">-- Wybierz kategorię --</option>
								{Object.keys(KATEGORIE).map((cat) => (
									<option key={cat} value={cat}>
										{cat}
									</option>
								))}
							</select>
						</div>

						{/* PODKATEGORIA */}
						<div className="space-y-2">
							<label
								htmlFor="podkategoria"
								className="text-sm font-bold text-slate-800"
							>
								Podkategoria
							</label>
							<select
								id="podkategoria"
								className="w-full p-3 md:p-4 bg-white border border-slate-400 rounded-xl text-slate-900 focus-gov transition-all shadow-sm disabled:bg-slate-100 disabled:text-slate-500"
								value={formData.podkategoria}
								onChange={(e) => updateData('podkategoria', e.target.value)}
								disabled={!formData.kategoria}
							>
								<option value="">-- Wybierz podkategorię --</option>
								{formData.kategoria &&
									KATEGORIE[formData.kategoria]?.map((sub) => (
										<option key={sub} value={sub}>
											{sub}
										</option>
									))}
								{!KATEGORIE[formData.kategoria]?.includes(
									formData.podkategoria
								) &&
									formData.podkategoria && (
										<option value={formData.podkategoria}>
											{formData.podkategoria} (AI)
										</option>
									)}
							</select>
						</div>
					</div>
				</div>

				{/* SEKCJA 2: OPIS SZCZEGÓŁOWY (z main) */}
				<div className="p-6 md:p-8 space-y-6">
					<div className="space-y-2">
						<label htmlFor="nazwa" className="text-sm font-bold text-slate-800">
							Nazwa przedmiotu
						</label>
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
						<label
							htmlFor="opis"
							className="text-sm font-bold text-slate-800 flex flex-col sm:flex-row sm:justify-between sm:items-center"
						>
							Opis wizualny
							<span className="text-xs text-slate-600 font-normal mt-1 sm:mt-0">
								Unikaj danych osobowych (RODO)
							</span>
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
					<div
						className="bg-blue-50/50 p-6 rounded-xl border border-blue-200"
						role="group"
						aria-labelledby="cechy-header"
					>
						<h2
							id="cechy-header"
							className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-2"
						>
							<Tag size={18} aria-hidden="true" /> Cechy identyfikacyjne
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{/* KOLOR */}
							<div>
								<label
									htmlFor="cecha-kolor"
									className="block text-xs font-bold text-slate-700 mb-1 uppercase"
								>
									Kolor
								</label>
								<input
									id="cecha-kolor"
									type="text"
									className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus-gov"
									value={formData.cechy?.kolor || ''}
									onChange={(e) => updateCecha('kolor', e.target.value)}
									placeholder="np. czarny"
								/>
							</div>
							{/* MARKA */}
							<div>
								<label
									htmlFor="cecha-marka"
									className="block text-xs font-bold text-slate-700 mb-1 uppercase"
								>
									Marka
								</label>
								<input
									id="cecha-marka"
									type="text"
									className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus-gov"
									value={formData.cechy?.marka || ''}
									onChange={(e) => updateCecha('marka', e.target.value)}
									placeholder="np. Samsung"
								/>
							</div>
							{/* STAN */}
							<div>
								<label
									htmlFor="cecha-stan"
									className="block text-xs font-bold text-slate-700 mb-1 uppercase"
								>
									Stan
								</label>
								<select
									id="cecha-stan"
									className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus-gov"
									value={formData.cechy?.stan || ''}
									onChange={(e) => updateCecha('stan', e.target.value)}
								>
									<option value="">-- Wybierz --</option>
									{STANY.map((s) => (
										<option key={s} value={s}>
											{s}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>

					{/* DATA I MIEJSCE (Scalone) */}
					<div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
						{/* DATA */}
						<div className="space-y-2">
							<label
								htmlFor="data"
								className="text-sm font-bold text-slate-800"
							>
								Data znalezienia
							</label>
							<input
								id="data"
								type="date"
								className="w-full p-3 md:p-4 bg-slate-50 border border-slate-400 rounded-xl text-slate-900 focus-gov"
								value={formData.data}
								onChange={(e) => updateData('data', e.target.value)}
							/>
						</div>

						{/* MIEJSCE Z MAPĄ (Scalone) */}
						<div className="space-y-2">
							<label
								htmlFor="miejsce"
								className="text-sm font-bold text-slate-800"
							>
								Miejsce znalezienia
							</label>
							<div className="relative">
								{/* Pole input z referencją do Autocomplete */}
								<input
									id="miejsce"
									ref={inputRef} // Ref dla Google Autocomplete
									type="text"
									className="w-full p-3 md:p-4 bg-slate-50 border border-slate-400 rounded-xl text-slate-900 focus-gov pr-10 md:pr-12 pl-10" // Dodany pl-10 i pr-12
									value={formData.miejsce}
									onChange={(e) => updateData('miejsce', e.target.value)}
									placeholder="Wpisz adres (podpowiedzi od Google Maps)" // Zmieniony placeholder
								/>
								<Search
									size={20}
									className="absolute left-3 top-3.5 text-slate-500"
									aria-hidden="true"
								/>
								<MapPin
									size={20}
									className="absolute right-3 top-3.5 text-red-600 cursor-pointer hover:text-red-700"
									onClick={() => setIsModalOpen(true)} // Otwarcie modalu
									title="Otwórz pełną mapę i ustaw pinezkę"
								/>
							</div>
						</div>
					</div>

					{/* INFORMACJA O WSPÓŁRZĘDNYCH (z HEAD) */}
					<div className="flex justify-start items-center text-sm pt-2">
						<p className="text-slate-500">
							Aktualne wsp.:
							<span className="font-medium text-slate-700 ml-1">
								{formData.lat
									? `${formData.lat.toFixed(4)}, ${formData.lng.toFixed(4)}`
									: 'Brak danych'}
							</span>
						</p>
					</div>

					{/* PODGLĄD MAPY (z HEAD) */}
					<div className="space-y-2 pt-4">
						<h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
							<MapPin size={16} /> Podgląd Lokalizacji
						</h4>
						<div
							id="map-preview"
							className="h-72 w-full bg-slate-100 rounded-xl border border-slate-300 shadow-inner cursor-pointer"
							onClick={() => setIsModalOpen(true)} // Kliknięcie otwiera pełną mapę
						>
							<div className="flex items-center justify-center h-full text-slate-500 text-center text-sm">
								Kliknij, aby powiększyć i wyznaczyć punkt.
							</div>
						</div>
					</div>
				</div>

				{/* Footer Nawigacyjny (z main) */}
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

			{/* MODAL PEŁNOEKRANOWEJ MAPY (z HEAD) */}
			<MapModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				currentCoords={currentCoords}
				onSaveLocation={handleSaveLocation}
			/>
		</div>
	);
};

export default FormPage;
