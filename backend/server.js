require('dotenv').config();
const express = require('express');
const multer = require('multer');
const xml2js = require('xml2js');
const { Pool } = require('pg');

const app = express();
const port = 3000;

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'GOV',
    password: process.env.DB_PASS || 'postgres',
    port: process.env.DB_PORT || 5432,
});

const upload = multer({ storage: multer.memoryStorage() });

// WAŻNE: stripPrefix: true pozwala ignorować namespace w XML
const parser = new xml2js.Parser({ 
    explicitArray: false, 
    stripPrefix: true 
});

app.post('/api/upload-xml', upload.single('xmlFile'), async (req, res) => {
    if (!req.file) return res.status(400).send('Brak pliku.');

    const client = await pool.connect();

    try {
        const xmlData = req.file.buffer.toString();
        const result = await parser.parseStringPromise(xmlData);

        // Twój XML ma główny korzeń <ZgloszenieZguby>
        const root = result.ZgloszenieZguby;

        if (!root) {
            throw new Error('Nieprawidłowa struktura XML (brak ZgloszenieZguby)');
        }

        // Przygotowanie danych do zapisu
        // xml2js przy atrybutach tworzy strukturę, musimy wyczyścić tablicę Cechy
        let cechyRaw = root.Przedmiot.Cechy.Cecha;
        // Jeśli jest jedna cecha, to obiekt, jeśli więcej - tablica. Normalizujemy to:
        if (!Array.isArray(cechyRaw)) cechyRaw = [cechyRaw];

        // Przekształcamy cechy na czysty JSON: [{"typ": "kolor", "wartosc": "czarny"}, ...]
        const cechyJson = cechyRaw.map(c => ({
            typ: c.$.typ, // dostęp do atrybutu xml <Cecha typ="...">
            wartosc: c._  // dostęp do wartości tekstowej tagu
        }));

        await client.query('BEGIN');

        const insertQuery = `
            INSERT INTO zgloszenia_zgub (
                id, nazwa_jednostki, kod_teryt, data_utworzenia, operator_id,
                kategoria, podkategoria, nazwa_publiczna, opis_szczegolowy,
                cechy,
                data_znalezienia, miejsce_opis, geo_lat, geo_lon,
                status_magazynowy, lokalizacja_polka, kod_qr_link
            ) VALUES (
                $1, $2, $3, $4, $5, 
                $6, $7, $8, $9, 
                $10, 
                $11, $12, $13, $14, 
                $15, $16, $17
            )
            ON CONFLICT (id) DO NOTHING -- Zabezpieczenie przed dublami
        `;

        const values = [
            root.Naglowek.IdentyfikatorUnikalny,
            root.Naglowek.JednostkaSamorzadu.Nazwa,
            root.Naglowek.JednostkaSamorzadu.KodTERYT,
            root.Naglowek.DataUtworzeniaRekordu,
            root.Naglowek.OperatorID,
            
            root.Przedmiot.KategoriaGlowna,
            root.Przedmiot.Podkategoria,
            root.Przedmiot.NazwaPubliczna,
            root.Przedmiot.OpisSzczegolowy,
            
            JSON.stringify(cechyJson), // Zapisujemy jako JSONB
            
            root.KontekstZnalezienia.DataZnalezienia,
            root.KontekstZnalezienia.MiejsceOpis,
            parseFloat(root.KontekstZnalezienia.LokalizacjaGeo.Lat),
            parseFloat(root.KontekstZnalezienia.LokalizacjaGeo.Lon),
            
            root.DaneMagazynowe.Status,
            root.DaneMagazynowe.LokalizacjaPolka,
            root.DaneMagazynowe.KodQR.Link
        ];

        await client.query(insertQuery, values);
        await client.query('COMMIT');

        res.json({ 
            message: 'Zgłoszenie dodane pomyślnie', 
            id: root.Naglowek.IdentyfikatorUnikalny 
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Błąd:', err);
        res.status(500).send(`Błąd importu: ${err.message}`);
    } finally {
        client.release();
    }
});

app.listen(port, () => {
    console.log(`Serwer działa na porcie ${port}`);
});