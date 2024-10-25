const express = require('express');
const bodyParser = require('body-parser');
const xlsx = require('xlsx');
const path = require('path');
const app = express(); // Itt inicializáljuk az express alkalmazást

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

let reports = [];

// Főoldal (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Hibabejelentés küldés
app.post('/submit', (req, res) => {
    const { reporter, machine, description } = req.body;
    const newReport = { reporter, machine, description, timestamp: new Date() };
    reports.push(newReport);

    const filePath = path.join(__dirname, 'reports.xlsx');
    const tempFilePath = path.join(__dirname, 'reports_temp.xlsx');
    let workbook;

    // Próbáljuk megnyitni a munkafüzetet
    try {
        workbook = xlsx.readFile(filePath);
    } catch (err) {
        // Ha nem található, új Workbook-ot hozunk létre
        workbook = xlsx.utils.book_new();
    }

    // Ellenőrizzük, hogy létezik-e a "Hibabejelentések" munkalap
    let worksheet = workbook.Sheets['Hibabejelentések'];
    if (!worksheet) {
        // Ha nem létezik, létrehozzuk az új munkalapot
        worksheet = xlsx.utils.json_to_sheet([]);
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Hibabejelentések');
    }

    // Adatok hozzáadása a meglévő munkalaphoz
    const existingData = xlsx.utils.sheet_to_json(worksheet);
    existingData.push({
        Név: newReport.reporter,
        Gép: newReport.machine,
        Leírás: newReport.description,
        Dátum: newReport.timestamp.toLocaleString()
    });

    // Frissítjük a munkalapot az új adatokkal
    const updatedWorksheet = xlsx.utils.json_to_sheet(existingData);
    workbook.Sheets['Hibabejelentések'] = updatedWorksheet;

    // Próbáljuk megmenteni az eredeti fájlba
    try {
        // Megmentjük az eredeti fájlba
        xlsx.writeFile(workbook, filePath);
    } catch (error) {
        console.error("Hiba a fájl írása közben:", error);
        // Ha hiba történt, mentsük el az ideiglenes fájlba
        try {
            xlsx.writeFile(workbook, tempFilePath);
            res.send(`
                <script>
                    alert("A fájl nyitva van!\\nA bejelentést az ideiglenes fájlba mentettük: ${tempFilePath}");
                    window.history.back(); // Vissza az űrlaphoz
                </script>
            `);
        } catch (tempError) {
            console.error("Hiba az ideiglenes fájl írása közben:", tempError);
            return res.send(`
                <script>
                    alert("A fájl nyitva van és nem tudtuk menteni az adatokat.");
                    window.history.back(); // Vissza az űrlaphoz
                </script>
            `);
        }
    }

    // Felugró ablak üzenet
    res.send(`
        <script>
            alert("Köszönjük a bejelentést!\\nA hiba bejelentése sikeresen megtörtént.");
            // Vissza az űrlaphoz, és ürítsük ki az űrlapot
            document.location.href = '/';
        </script>
    `);
});

// Szerver indítása
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Szerver fut a http://localhost:${PORT} címen`);
});

