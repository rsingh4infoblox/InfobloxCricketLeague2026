/**
 * Main Application Script (Homepage)
 * Handles search functionality for ICL - Infoblox Cricket League.
 */

(async function () {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const clearBtn = document.getElementById('clearBtn');
    const totalPlayersEl = document.getElementById('totalPlayers');

    let players = [];

    // ─── Load Data ───────────────────────────────────────────
    try {
        players = await CSVParser.fetchAndParse('MOCK_DATA.csv');
        // Update stats
        if (totalPlayersEl) {
            totalPlayersEl.textContent = players.length;
        }
    } catch (err) {
        console.error('Error loading CSV:', err);
    }

    // ─── Search Input Handler ────────────────────────────────
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();
        toggleClearBtn(query);

        if (query.length === 0) {
            hideResults();
            return;
        }

        const filtered = filterPlayers(query);
        renderSearchResults(filtered, query);
    });

    // ─── Clear Button ────────────────────────────────────────
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        toggleClearBtn('');
        hideResults();
        searchInput.focus();
    });

    // ─── Close dropdown on outside click ─────────────────────
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            hideResults();
        }
    });

    // Reopen on focus if there's a query
    searchInput.addEventListener('focus', () => {
        const query = searchInput.value.trim();
        if (query.length > 0) {
            const filtered = filterPlayers(query);
            renderSearchResults(filtered, query);
        }
    });

    // ─── Filter Players ──────────────────────────────────────
    function filterPlayers(query) {
        const q = query.toLowerCase();
        return players.filter(p => {
            const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
            return fullName.includes(q);
        });
    }

    // ─── Render Search Results Dropdown ──────────────────────
    function renderSearchResults(results, query) {
        searchResults.innerHTML = '';

        if (results.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No players found matching "<strong>' + escapeHtml(query) + '</strong>"</div>';
            searchResults.classList.add('active');
            return;
        }

        results.forEach((player) => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.setAttribute('role', 'option');
            item.setAttribute('tabindex', '0');

            const fullName = `${player.first_name} ${player.last_name}`;
            const highlightedName = highlightMatch(fullName, query);
            const photoSrc = CSVParser.getPhotoPath(player.first_name, player.last_name);

            // Find original index in the full players array
            const originalIndex = players.indexOf(player);

            item.innerHTML = `
                <img class="result-avatar" src="${photoSrc}" alt="${fullName}" 
                     onerror="this.src='photos/default.svg'">
                <div class="result-info">
                    <div class="result-name">${highlightedName}</div>
                    <div class="result-meta">${player.gender} &middot; Age ${player.age}</div>
                </div>
                <span class="result-arrow">&#8594;</span>
            `;

            item.addEventListener('click', () => navigateToPlayer(originalIndex));
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') navigateToPlayer(originalIndex);
            });

            searchResults.appendChild(item);
        });

        searchResults.classList.add('active');
    }

    // ─── Highlight Matching Text ─────────────────────────────
    function highlightMatch(text, query) {
        if (!query) return escapeHtml(text);
        const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ─── Navigation ──────────────────────────────────────────
    function navigateToPlayer(index) {
        window.location.href = `player.html?index=${index}`;
    }

    // ─── Helpers ─────────────────────────────────────────────
    function hideResults() {
        searchResults.classList.remove('active');
    }

    function toggleClearBtn(query) {
        clearBtn.classList.toggle('visible', query.length > 0);
    }
})();
