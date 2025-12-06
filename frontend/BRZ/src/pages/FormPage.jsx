// src/pages/FormPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useFormContext } from '../context/FormContext';
import { useNavigate } from 'react-router-dom';
import MapModal from '../components/MapModal';
import { ArrowLeft, ArrowRight, Tag, ListFilter, MapPin } from 'lucide-react';
import { KATEGORIE, STANY } from '../utils/dictionaries';

const FormPage = () => {
	const { formData, updateData, imagePreview } = useFormContext();
	const navigate = useNavigate();

	// 1. Refy i Stan dla Mapy i Modalu
	const inputRef = useRef(null); // Ref do inputa MIEJSCE
	const dateInputRef = useRef(null); // DODANE: Ref do inputa DATY
	const mapObjectRef = useRef(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Używamy danych z formularza (lub domyślnej Warszawy) dla centrum mapy
	const currentCoords = {
		lat: formData.lat || 52.2297,
		lng: formData.lng || 21.0122,
	};

	// Helper do aktualizacji zagnieżdżonych cech
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
	const handleSaveLocation = (address, coords) => {
		updateData({
			miejsce: address,
			lat: coords.lat,
			lng: coords.lng,
		});
		updateMapPreview(coords, address);
	};

	// Funkcja do inicjalizacji/aktualizacji Mapy Podglądu
	const updateMapPreview = (center, address) => {
		const mapElement = document.getElementById('map-preview');
		if (!window.google || !window.google.maps || !mapElement) return;

		if (!mapObjectRef.current) {
			mapObjectRef.current = new window.google.maps.Map(mapElement, {
				center: center,
				zoom: 15,
				disableDefaultUI: true,
			});
			// Użycie starego, ale działającego Markera
			mapObjectRef.current.marker = new window.google.maps.Marker({
				position: center,
				map: mapObjectRef.current,
				title: address,
			});
		} else {
			mapObjectRef.current.setCenter(center);
			mapObjectRef.current.marker.setPosition(center);
			mapObjectRef.current.marker.setTitle(address);
		}
	};

	// useEffect do inicjalizacji Autocomplete
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

	// Klasy dla focusa: focus:ring-2 (grubość 2px) focus:ring-yellow-500
	const focusClasses =
		'focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none';
	const inputBaseClasses =
		'w-full p-3 bg-slate-50 border border-slate-400 rounded-xl text-slate-900 placeholder:text-slate-500 transition-all';
	const selectBaseClasses =
		'w-full p-3 md:p-4 bg-white border border-slate-400 rounded-xl text-slate-900 transition-all shadow-sm';

	return (
		<div className="max-w-4xl mx-auto px-4 py-6 md:py-10 animate-in slide-in-from-right-8 duration-500">
			{/* Header */}
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
				{/* SEKCJA 1: KLASYFIKACJA */}
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
								// Zastosowanie nowych klas focus
								className={`${selectBaseClasses} ${focusClasses}`}
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
								// Zastosowanie nowych klas focus
								className={`${selectBaseClasses} ${focusClasses} disabled:bg-slate-100 disabled:text-slate-500`}
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

				{/* SEKCJA 2: OPIS SZCZEGÓŁOWY */}
				<div className="p-6 md:p-8 space-y-6">
					<div className="space-y-2">
						<label htmlFor="nazwa" className="text-sm font-bold text-slate-800">
							Nazwa przedmiotu
						</label>
						<input
							id="nazwa"
							type="text"
							// Zastosowanie nowych klas focus
							className={`${inputBaseClasses} p-3 md:p-4 ${focusClasses}`}
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
							// Zastosowanie nowych klas focus
							className={`${inputBaseClasses} p-3 md:p-4 ${focusClasses}`}
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
									// Zastosowanie nowych klas focus
									className={`w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 ${focusClasses}`}
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
									// Zastosowanie nowych klas focus
									className={`w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 ${focusClasses}`}
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
									// Zastosowanie nowych klas focus
									className={`w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 ${focusClasses}`}
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

					{/* DATA I MIEJSCE */}
					<div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
						{/* DATA (ZAPATCHOWANA) */}
						<div className="space-y-2">
							<label
								htmlFor="data"
								className="text-sm font-bold text-slate-800"
							>
								Data znalezienia
							</label>
							{/* Kontener klikalny, który wywoła kalendarz */}
							<div
								className="relative cursor-pointer"
								onClick={() =>
									dateInputRef.current && dateInputRef.current.showPicker()
								}
							>
								<input
									id="data"
									ref={dateInputRef} // PODPIĘCIE REFERENCJI
									type="date"
									// Zastosowanie nowych klas focus
									className={`${inputBaseClasses} p-3 md:p-4 ${focusClasses} cursor-pointer`}
									value={formData.data}
									onChange={(e) => updateData('data', e.target.value)}
								/>
							</div>
						</div>

						{/* MIEJSCE Z MAPĄ */}
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
									// Zastosowanie nowych klas focus
									className={`${inputBaseClasses} p-3 md:p-4 pr-10 md:pr-12 pl-10 ${focusClasses}`}
									value={formData.miejsce}
									onChange={(e) => updateData('miejsce', e.target.value)}
									placeholder="Wpisz adres (podpowiedzi od Google Maps)"
								/>
								<MapPin
									size={20}
									className="absolute right-3 top-4.5 text-red-600 cursor-pointer hover:text-red-700"
									onClick={() => setIsModalOpen(true)} // Otwarcie modalu
									title="Otwórz pełną mapę i ustaw pinezkę"
								/>
							</div>
						</div>
					</div>

					{/* INFORMACJA O WSPÓŁRZĘDNYCH */}
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

					{/* PODGLĄD MAPY */}
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

				{/* Footer Nawigacyjny */}
				<div className="bg-slate-50 px-6 py-6 border-t border-slate-200 flex flex-col-reverse md:flex-row justify-between gap-4">
					<button
						onClick={() => navigate('/')}
						className="w-full md:w-auto px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2 transition-all"
					>
						<ArrowLeft size={20} aria-hidden="true" /> Anuluj
					</button>
					<button
						onClick={() => navigate('/podsumowanie')}
						className="w-full md:w-auto bg-blue-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2 shadow-lg transition-all"
					>
						Podsumowanie <ArrowRight size={20} aria-hidden="true" />
					</button>
				</div>
			</div>

			{/* MODAL PEŁNOEKRANOWEJ MAPY */}
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
