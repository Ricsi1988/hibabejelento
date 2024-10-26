// script.js
document.getElementById('startRecognition').addEventListener('click', () => {
    try {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'hu-HU'; // Beállítja a nyelvet
        recognition.interimResults = false;

        recognition.start();

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript; // Az észlelt beszéd szövege
            document.getElementById('description').value += transcript; // Hozzáadja a leíráshoz
        };

        recognition.onerror = (event) => {
            console.error('Beszédfelismerési hiba: ', event.error);
        };
    } catch (error) {
        console.error('Hiba a beszédfelismerés indításakor: ', error);
    }
});
