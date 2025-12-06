import React, { createContext, useState, useContext } from 'react';

const FormContext = createContext();

export const FormProvider = ({ children }) => {
	const [formData, setFormData] = useState({
		kategoria: '',
		nazwa: '',
		opis: '',
		kolor: '',
		miejsce: '',
		// Pola dla współrzędnych geograficznych
		lat: null,
		lng: null,
		data: new Date().toISOString().split('T')[0],
	});

	const [imagePreview, setImagePreview] = useState(null);

	// Funkcja do aktualizacji pojedynczego pola lub całego obiektu
	const updateData = (field, value) => {
		if (typeof field === 'object') {
			setFormData((prev) => ({ ...prev, ...field }));
		} else {
			setFormData((prev) => ({ ...prev, [field]: value }));
		}
	};

	return (
		<FormContext.Provider
			value={{ formData, updateData, imagePreview, setImagePreview }}
		>
			{children}
		</FormContext.Provider>
	);
};

export const useFormContext = () => useContext(FormContext);
