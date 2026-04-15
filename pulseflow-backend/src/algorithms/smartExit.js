/**
 * Smart Exit Algorithm
 * Organizes a staggered exit strategy to prevent bottlenecking at the exits.
 * Groups seating sections into waves based on proximity to active exits.
 * @param {Object} venueState - Current state of the venue
 * @returns {Object} - Exit Plan
 */
function runSmartExit(venueState) {
    // Determine which gates are least congested
    const gates = venueState.zones.filter(z => z.id.startsWith('gate'));
    gates.sort((a, b) => a.occupancy - b.occupancy);
    
    const primaryExitGate = gates[0]; // The gate with the least occupancy
    
    // Create staggered exit waves based on mock seating logic
    const exitPlan = {
        recommendation: `Primary Exit Route recommended via ${primaryExitGate.name} to minimize congestion.`,
        waves: [
            { waveId: 1, targetSeats: 'Blocks A-C', timeOutMs: 0, status: 'Ready to Exit' },
            { waveId: 2, targetSeats: 'Blocks D-F', timeOutMs: 5000, status: 'Please Wait' }, // Mocking 5 sec stagger for demo
            { waveId: 3, targetSeats: 'General Admission', timeOutMs: 10000, status: 'Please Wait' }
        ]
    };

    return exitPlan;
}

module.exports = { runSmartExit };
