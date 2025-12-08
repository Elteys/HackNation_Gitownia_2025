Dlaczego to rozwiązanie jest innowacyjne?



Rozwiązujemy problem skomplikowanej biurokracji technicznej. Urzędnik nie musi wiedzieć, czym jest plik XML ani jak obliczyć sumę MD5. Wypełnia jeden prosty formularz, a system automatycznie:

Aktualizuje bazę danych.
Wystawia pliki dla automatu dane.gov.pl.
Generuje etykietę na przedmiot.


To realizacja wymogu „maksymalnie 5 kroków” w praktyce – zredukowaliśmy proces do jednego kliknięcia "Opublikuj".



Schemat działania (Data Flow):



Urzędnik → Wypełnia formularz → Klika "Opublikuj".

Backend → Zapisuje dane do Rejestr.csv → Generuje Rejestr.xml → Oblicza Rejestr.md5.

Backend → Generuje kod QR i link publiczny.

Urzędnik → Drukuje etykietę QR na przedmiot.

Portal Dane.gov.pl → Cyklicznie sprawdza plik .md5 → Pobiera nowy .xml → Pobiera zaktualizowany .csv.



Inteligentny Asystent AI – Automatyzacja:



Jak to działa? Zamiast ręcznie wpisywać każdą cechę przedmiotu, urzędnik po prostu wgrywa zdjęcie znalezionej rzeczy.



Magia w tle:

Analiza Obrazu: Algorytmy AI w ułamku sekundy analizują fotografię.
Ekstrakcja Cech: System rozpoznaje przedmiot (np. "telefon komórkowy", "pęk kluczy", "portfel"), jego kolor, markę, a nawet stan wizualny (np. "lekko zarysowany").
Automatyczne Wypełnianie (Auto-fill): Pola formularza – Kategoria, Nazwa, Opis, Cechy Szczególne – zostają wypełnione automatycznie.


Stack Technologiczny:



Frontend: React, Vite, Tailwind CSS, Google Maps API, Framer Motion.

Backend: Node.js, Express, xml2js, csv-parse, crypto (MD5).

Infrastruktura: Lokalny serwer HTTPS z certyfikatami SSL.



Funkcjonalności:



Prosty, responsywny interfejs (React + Tailwind CSS) prowadzi urzędnika krok po kroku.
Geolokalizacja: Integracja z Google Maps API pozwala na precyzyjne wskazanie miejsca znalezienia przedmiotu (zapis współrzędnych GPS oraz adresu).
Walidacja danych w czasie rzeczywistym.
Generator CSV (UTF-8 z BOM): Tworzy i aktualizuje główny rejestr rzeczy znalezionych, dbając o poprawne kodowanie polskich znaków (zgodność z Excel).
Dla każdego zgłoszenia generowany jest unikalny kod QR.
Moduł Druku: Urzędnik jednym kliknięciem generuje gotową do druku etykietę z kodem QR i ID zgłoszenia, którą nakleja na znaleziony przedmiot.
Publiczny Podgląd: Zeskanowanie kodu QR przez obywatela przenosi go na publiczną stronę ze szczegółami przedmiotu i jego statusem (np. "DO ODBIORU" lub "ODEBRANO").
Komunikacja w pełni szyfrowana przez HTTPS (wymóg geolokalizacji i standardów rządowych).
Architektura Klient-Serwer (Node.js + Express), gdzie Backend pełni rolę Gatewaya wystawiającego pliki dla importera rządowego.
Suma kontrolna MD5: System automatycznie oblicza hash MD5 dla pliku XML przy każdej zmianie, co jest kluczowe dla automatu pobierającego dane.




UWAGA:



LOKALIZACJE PLIKOW:

/lost-items-gateway --> .env dla backendu + dwa pliki pem

/frontend/BRZ --> .env dla frontend + dwa pliki pem
