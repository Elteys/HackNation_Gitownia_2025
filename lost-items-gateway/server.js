const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3001;

// --- KONFIGURACJA ---
// Folder na pliki publiczne (CSV, XML, QR)
const PUBLIC_DIR = path.join(__dirname, 'public_files');
const HOST_URL = `http://localhost:${port}`; // Adres Twojego serwera

// Upewnij się, że katalogi istnieją
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR);

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Zwiększony limit dla base64 images
// Udostępniamy pliki statycznie (żeby XML mógł linkować do CSV)
app.use('/files', express.static(PUBLIC_DIR));

/**
 * Funkcja pomocnicza: Generowanie treści CSV
 */
function generateCSV(formData) {
    const header = "ID,Kategoria,Podkategoria,Nazwa,Opis,Kolor,Marka,Stan,DataZnalezienia,Miejsce\n";
    // Zabezpieczenie przecinków w tekście (CSV injection)
    const escape = (text) => `"${(text || '').replace(/"/g, '""')}"`;
    
    const row = [
        uuidv4(),
        escape(formData.kategoria),
        escape(formData.podkategoria),
        escape(formData.nazwa),
        escape(formData.opis),
        escape(formData.cechy?.kolor),
        escape(formData.cechy?.marka),
        escape(formData.cechy?.stan),
        escape(formData.data),
        escape(formData.miejsce)
    ].join(",");

    return header + row;
}

/**
 * Funkcja pomocnicza: Generowanie treści XML (Metadane z linkiem do CSV)
 */
function generateXML(csvFileName, formData) {
    const builder = new xml2js.Builder();
    const xmlObj = {
        'ZgloszenieZguby': {
            '$': { 'xmlns': 'http://dane.gov.pl/standardy/rzeczy-znalezione' }, // Przykładowa przestrzeń nazw
            'Naglowek': {
                'IdentyfikatorZgloszenia': uuidv4(),
                'DataUtworzenia': new Date().toISOString(),
                'JednostkaSamorzadowa': 'Urzad Miasta (Demo)'
            },
            'ZasobDanych': {
                'Opis': 'Wykaz rzeczy znalezionych - pojedynczy rekord',
                'Format': 'CSV',
                // TO JEST KLUCZOWE: Link do pliku z danymi
                'UrlDoDanych': `${HOST_URL}/files/${csvFileName}` 
            },
            'Podsumowanie': {
                'Kategoria': formData.kategoria,
                'Nazwa': formData.nazwa,
                'Status': 'DO_ODBIORU'
            }
        }
    };
    return builder.buildObject(xmlObj);
}

// --- ENDPOINT: Publikacja Danych ---
app.post('/api/publish-data', async (req, res) => {
    try {
        const formData = req.body;
        const uniqueId = uuidv4();

        // 1. Generowanie Pliku z Danymi (CSV)
        const csvFilename = `dane_${uniqueId}.csv`;
        const csvPath = path.join(PUBLIC_DIR, csvFilename);
        const csvContent = generateCSV(formData);
        fs.writeFileSync(csvPath, csvContent);

        // 2. Generowanie Pliku Metadanych (XML) wskazującego na CSV
        const xmlFilename = `meta_${uniqueId}.xml`;
        const xmlPath = path.join(PUBLIC_DIR, xmlFilename);
        const xmlContent = generateXML(csvFilename, formData);
        fs.writeFileSync(xmlPath, xmlContent);

        // 3. Generowanie QR kodu (kieruje do podglądu lub pliku XML)
        // W realnym scenariuszu kierowałby do strony BIP z tym ogłoszeniem
        const qrFilename = `qr_${uniqueId}.png`;
        const qrPath = path.join(PUBLIC_DIR, qrFilename);
        const linkDlaUrzednika = `${HOST_URL}/files/${xmlFilename}`; // QR kieruje do XML
        await QRCode.toFile(qrPath, linkDlaUrzednika);

        console.log(`[SUKCES] Opublikowano zgłoszenie: ${uniqueId}`);
        console.log(`Link do CSV: ${HOST_URL}/files/${csvFilename}`);
        console.log(`Link do XML: ${HOST_URL}/files/${xmlFilename}`);

        res.status(200).json({
            success: true,
            message: 'Dane opublikowane w standardzie BIP/Dane.gov.pl',
            files: {
                xml: `${HOST_URL}/files/${xmlFilename}`,
                csv: `${HOST_URL}/files/${csvFilename}`,
                qr: `${HOST_URL}/files/${qrFilename}`
            }
        });

    } catch (error) {
        console.error('Błąd publikacji:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- Start Serwera ---
app.listen(port, () => {
    console.log(`Server "Jednego Okna" działa na porcie ${port}`);
    console.log(`Katalog publiczny: ${PUBLIC_DIR}`);
});