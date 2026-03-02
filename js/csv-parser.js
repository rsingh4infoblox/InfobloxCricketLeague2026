/**
 * CSV Parser Module
 * Parses CSV text into an array of objects using the header row as keys.
 * Handles quoted fields with commas inside them.
 */

const CSVParser = (() => {

    /**
     * Fetch and parse a CSV file from the given URL.
     * @param {string} url - path to the CSV file
     * @returns {Promise<Array<Object>>} parsed rows
     */
    async function fetchAndParse(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch CSV: ${response.statusText}`);
        }
        const text = await response.text();
        return parse(text);
    }

    /**
     * Parse CSV text into array of objects.
     * @param {string} csvText
     * @returns {Array<Object>}
     */
    function parse(csvText) {
        const lines = splitCSVLines(csvText.trim());
        if (lines.length < 2) return [];

        const headers = parseCSVLine(lines[0]);
        const rows = [];

        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            if (values.length === 0 || (values.length === 1 && values[0] === '')) continue;

            const row = {};
            headers.forEach((header, index) => {
                row[header.trim()] = (values[index] || '').trim();
            });
            rows.push(row);
        }

        return rows;
    }

    /**
     * Split CSV text into lines, respecting quoted fields that contain newlines.
     */
    function splitCSVLines(text) {
        const lines = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            if (ch === '"') {
                inQuotes = !inQuotes;
            }
            if ((ch === '\n' || ch === '\r') && !inQuotes) {
                if (ch === '\r' && text[i + 1] === '\n') i++; // skip \r\n
                lines.push(current);
                current = '';
            } else {
                current += ch;
            }
        }
        if (current) lines.push(current);
        return lines;
    }

    /**
     * Parse a single CSV line into an array of values.
     */
    function parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const ch = line[i];

            if (inQuotes) {
                if (ch === '"') {
                    if (line[i + 1] === '"') {
                        current += '"';
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    current += ch;
                }
            } else {
                if (ch === '"') {
                    inQuotes = true;
                } else if (ch === ',') {
                    values.push(current);
                    current = '';
                } else {
                    current += ch;
                }
            }
        }
        values.push(current);
        return values;
    }

    /**
     * Get the photo filename for a player.
     */
    function getPhotoPath(firstName, lastName) {
        return `photos/${firstName}_${lastName}.svg`;
    }

    return { fetchAndParse, parse, getPhotoPath };
})();
