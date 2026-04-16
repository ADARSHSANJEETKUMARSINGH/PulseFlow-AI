/**
 * Smart Redirect Algorithm
 * Mocks the Google Vertex AI predictive logic by calculating an alternative
 * route if a zone is 'Red' (congested).
 * @param {Object} venueState - Current state of the venue
 * @returns {Array} - Array of redirect suggestions
 */
function calculateRedirects(venueState) {
    const suggestions = [];
    const redZones = venueState.zones.filter(z => z.status === 'Red');
    
    redZones.forEach(redZone => {
        // Find alternative zones of same type (e.g., Gate A -> Gate B; Food Court 1 -> Food Court 2)
        const typeMatch = redZone.name.split(' ')[0]; // E.g., 'Gate' or 'Food'
        
        const alternatives = venueState.zones.filter(z => 
            z.name.startsWith(typeMatch) && z.id !== redZone.id && z.status === 'Green'
        );

        if (alternatives.length > 0) {
            // Pick the best alternative (lowest wait time)
            alternatives.sort((a, b) => a.waitTimeMin - b.waitTimeMin);
            const bestAlternative = alternatives[0];
            
            suggestions.push({
                fromZone: redZone.name,
                toZone: bestAlternative.name,
                message: `Congestion at ${redZone.name}. Redirecting to ${bestAlternative.name} to save ${redZone.waitTimeMin - bestAlternative.waitTimeMin} mins.`
            });
        }
    });

    return suggestions;
}

module.exports = { calculateRedirects };
