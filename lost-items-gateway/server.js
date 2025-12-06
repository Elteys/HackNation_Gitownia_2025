require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const port = process.env.PORT || 3001;

// --- KONFIGURACJA ---
const PORTAL_API_URL = process.env.PORTAL_API_URL || 'http://localhost:8000/api/3/action/resource_create';
const API_KEY = process.env.PORTAL_API_KEY; 
const DATASET_ID = process.env.DATASET_ID; 
const MY_PUBLIC_HOST = process.env.PUBLIC_HOST || `http://localhost:${port}`;

const PUBLIC_DIR = path.join(__dirname, 'public_files');
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/files', express.static(PUBLIC_DIR));

// --- GENERATORY ---

// 1. ZAKTUALIZOWANA funkcja generateCSV (dodane Lat, Lon)
function generateCSV(formData, id) { 
    const header = "ID,Kategoria,Podkategoria,Nazwa,Opis,Kolor,Marka,Stan,DataZnalezienia,Miejsce,Lat,Lon\n";
    const escape = (t) => `"${(t || '').toString().replace(/"/g, '""')}"`;
    
    const lat = formData.lat || '';
    const lon = formData.lng || '';

    const row = [
        id, // <--- TUTAJ UŻYWAMY PRZEKAZANEGO ID, A NIE uuidv4()
        escape(formData.kategoria), 
        escape(formData.podkategoria),
        escape(formData.nazwa), 
        escape(formData.opis), 
        escape(formData.cechy?.kolor),
        escape(formData.cechy?.marka), 
        escape(formData.cechy?.stan),
        escape(formData.data), 
        escape(formData.miejsce),
        escape(lat),
        escape(lon)
    ].join(",");
    
    return header + row;
}

// Dodajemy argument 'id'
function generateXML(csvFileName, formData, id) {
    const builder = new xml2js.Builder({ headless: true });
    
    const lat = formData.lat ? formData.lat.toString() : null;
    const lon = formData.lng ? formData.lng.toString() : null;

    const xmlObj = {
        'ZgloszenieZguby': {
            '$': { 
                'xmlns': 'http://dane.gov.pl/standardy/zguby/v1',
                'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
            },
            'Naglowek': { 
                'IdentyfikatorUnikalny': id, // <--- TUTAJ TEŻ TO SAMO ID
                'DataUtworzeniaRekordu': new Date().toISOString(),
                'JednostkaSamorzadu': {
                    'Nazwa': 'Urzad Miejski Demo',
                    'KodTERYT': '0000000'
                }
            },
            'Przedmiot': {
                'KategoriaGlowna': formData.kategoria,
                'Podkategoria': formData.podkategoria || '',
                'NazwaPubliczna': formData.nazwa,
                'OpisSzczegolowy': formData.opis || '',
                'Cechy': {
                    'Kolor': formData.cechy?.kolor || '',
                    'Marka': formData.cechy?.marka || '',
                    'Stan': formData.cechy?.stan || ''
                }
            },
            'KontekstZnalezienia': {
                'DataZnalezienia': formData.data,
                'MiejsceOpis': formData.miejsce || '',
                // Dodajemy sekcję LokalizacjaGeo tylko jeśli mamy współrzędne
                ...(lat && lon && {
                    'LokalizacjaGeo': {
                        'Lat': lat,
                        'Lon': lon
                    }
                })
            },
            'ZrodloDanych': {
                'Format': 'CSV',
                'UrlDoDanych': `${MY_PUBLIC_HOST}/files/${csvFileName}` 
            }
        }
    };
    
    // Dodajemy standardowy nagłówek XML
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + builder.buildObject(xmlObj);
}

// --- WYSYŁKA DO PORTALU (Bez zmian) ---
async function pushToPortal(filePath, fileName, title) {
    if (!API_KEY) {
        console.warn('[API] Brak klucza API w .env - pomijam wysyłkę.');
        return null;
    }

    console.log(`[API] Wysyłka do: ${PORTAL_API_URL}`);
    
    const form = new FormData();
    form.append('package_id', DATASET_ID);
    form.append('name', fileName);
    form.append('description', `Import: ${title}`);
    form.append('format', 'XML');
    form.append('upload', fs.createReadStream(filePath));

    try {
        const response = await axios.post(PORTAL_API_URL, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': API_KEY
            }
        });
        
        if (response.data.success) {
            console.log('[API] Sukces!');
            return response.data.result.url; 
        }
    } catch (error) {
        console.error('[API BŁĄD]', error.response?.data || error.message);
        return null; 
    }
}

// --- ENDPOINT (Bez większych zmian, tylko logika wywołania) ---
app.post('/api/publish-data', async (req, res) => {
    try {
        const formData = req.body;
        if (!formData) throw new Error("Brak danych formularza");

        // TO JEST GŁÓWNE ID DLA CAŁEGO PROCESU
        const uniqueId = uuidv4(); 

        const csvName = `dane_${uniqueId}.csv`; // ID w nazwie pliku
        const xmlName = `meta_${uniqueId}.xml`;
        const qrName = `qr_${uniqueId}.png`;

        const csvPath = path.join(PUBLIC_DIR, csvName);
        const xmlPath = path.join(PUBLIC_DIR, xmlName);
        const qrPath = path.join(PUBLIC_DIR, qrName);

        // PRZEKAZUJEMY uniqueId DO FUNKCJI:
        const csvContent = generateCSV(formData, uniqueId); 
        const xmlContent = generateXML(csvName, formData, uniqueId);

        // Zapis na dysk
        fs.writeFileSync(csvPath, csvContent);
        fs.writeFileSync(xmlPath, xmlContent);

        // 2. Wysyłka
        const portalUrl = await pushToPortal(xmlPath, xmlName, formData.nazwa);

        // 3. QR (Linkuje do portalu jeśli się udało, inaczej lokalnie do XML)
        const finalUrl = portalUrl || `${MY_PUBLIC_HOST}/files/${xmlName}`;
        await QRCode.toFile(qrPath, finalUrl);

        res.status(200).json({
            success: true,
            files: {
                xml: `${MY_PUBLIC_HOST}/files/${xmlName}`,
                csv: `${MY_PUBLIC_HOST}/files/${csvName}`,
                qr: `${MY_PUBLIC_HOST}/files/${qrName}`,
                portalUrl: portalUrl
            }
        });

    } catch (error) {
        console.error("Błąd serwera:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Bramka działa na porcie ${port}`);
    console.log(`Tryb: ${process.env.NODE_ENV || 'development'}`);
});