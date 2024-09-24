document.getElementById('typingArea').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        // Voeg een nieuwe regel toe
        this.value += '\n';
    } else if (event.key === ' ') {
        // Voeg een spatie toe voor de spatiebalk
        event.preventDefault(); // voorkom het dubbel toevoegen van spaties
        this.value += ' ';
    } else {
        event.preventDefault(); // voorkom de standaardactie voor andere toetsen

        // willekeurige letter
        const randomCharCode = Math.floor(Math.random() * (122 - 97 + 1)) + 97;
        const randomChar = String.fromCharCode(randomCharCode);

        // Voeg de willekeurige letter toe
        this.value += randomChar;
    }
});
