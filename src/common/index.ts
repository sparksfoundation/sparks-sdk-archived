/**
 * 
 * @returns a timestamp in milliseconds since epoch in terms of UTC
 */
export function utcEpochTimestamp() {
    const now = new Date()
    return now.getTime() + now.getTimezoneOffset() * 60 * 1000;
}

/**
 * @returns a parsed json string or null if it fails
 */
export function parseJSON(data) {
    try { 
        return JSON.parse(data);
    } catch (e) {
        return data;
    }
}
