/**
 * Player Details Page Script
 * Reads the player index from URL query params, fetches CSV, and displays details.
 */

(async function () {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('errorMessage');
    const playerCard = document.getElementById('playerCard');

    // Get player index from URL
    const params = new URLSearchParams(window.location.search);
    const playerIndex = parseInt(params.get('index'), 10);

    if (isNaN(playerIndex)) {
        showError();
        return;
    }

    try {
        const players = await CSVParser.fetchAndParse('MOCK_DATA.csv');

        if (playerIndex < 0 || playerIndex >= players.length) {
            showError();
            return;
        }

        const player = players[playerIndex];
        renderPlayer(player);
    } catch (err) {
        console.error('Error loading player:', err);
        showError();
    }

    function renderPlayer(player) {
        const fullName = `${player.first_name} ${player.last_name}`;
        const photoSrc = CSVParser.getPhotoPath(player.first_name, player.last_name);

        // Update page title
        document.title = `${fullName} - Player Directory`;

        // Fill in data
        document.getElementById('playerPhoto').src = photoSrc;
        document.getElementById('playerPhoto').alt = fullName;
        document.getElementById('playerPhoto').onerror = function () {
            this.src = 'photos/default.svg';
        };
        document.getElementById('playerName').textContent = fullName;
        document.getElementById('playerGender').textContent = player.gender;
        document.getElementById('firstName').textContent = player.first_name;
        document.getElementById('lastName').textContent = player.last_name;
        document.getElementById('gender').textContent = player.gender;
        document.getElementById('age').textContent = player.age;
        document.getElementById('description').textContent = player.description || 'No description available.';

        // Show card, hide loading
        loadingEl.style.display = 'none';
        playerCard.style.display = '';
    }

    function showError() {
        loadingEl.style.display = 'none';
        errorEl.style.display = '';
    }
})();
