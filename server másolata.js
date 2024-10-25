const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');

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
    reports.push({ reporter, machine, description, timestamp: new Date() });

    // Felugró ablak üzenet
    res.send(`
        <script>
            alert("Köszönjük a bejelentést!\\nA hiba bejelentése sikeresen megtörtént.");
            window.history.back(); // Vissza az űrlaphoz
        </script>
    `);
});

// Hibabejelentések megtekintése
app.get('/reports', (req, res) => {
    let reportList = reports.map(r => `
        <li>
            <strong>Név:</strong> ${r.reporter} <br>
            <strong>Gép:</strong> ${r.machine} <br>
            <strong>Leírás:</strong> ${r.description} <br>
            <strong>Dátum:</strong> ${new Date(r.timestamp).toLocaleString()} <br>
        </li>
    `).join('');
    
   res.send(`
        <h1>Hibabejelentések</h1>
        <ul>${reportList || '<li>Nincs bejelentés.</li>'}</ul>
        <a href="/">Vissza az űrlaphoz</a>
    `);
});

// Szerver indítása
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Szerver fut a http://localhost:${PORT} címen`);
});
