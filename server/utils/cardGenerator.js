const POSITIONS = ['FW', 'MF', 'DF', 'GK'];
const NAMES = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
    'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
];

const TSB = {
    COMMON: 180,
    RARE: 210,
    ELITE: 240,
    LEGEND: 270
};

const TRAITS = [
    { id: 'Poacher', name: 'Poacher', desc: '+20 ATT if opponent plays a GK card' },
    { id: 'Captain', name: 'Captain', desc: '+10 to all stats if played in Round 5' },
    { id: 'Super Sub', name: 'Super Sub', desc: '+15 to active stat if drawn from bench' },
    { id: 'Enforcer', name: 'Enforcer', desc: 'Win a DEF duel to halve opponent\'s next card stats' },
    { id: 'Playmaker', name: 'Playmaker', desc: 'Win a MID duel to choose next round\'s attribute' },
    { id: 'False Nine', name: 'False Nine', desc: 'Can use MID stat instead of ATT stat on Attack rolls' },
    { id: 'Wall', name: 'Wall', desc: 'Wins all ties on DEF rolls' }
];

const generateCard = (id) => {
    const rand = Math.random();
    let rarity = 'COMMON';
    if (rand > 0.99) rarity = 'LEGEND';
    else if (rand > 0.90) rarity = 'ELITE';
    else if (rand > 0.70) rarity = 'RARE';

    const position = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
    const budget = TSB[rarity];

    // Distribute stats based on position
    let stats = { ATT: 0, MID: 0, DEF: 0, GK: 10 }; // Base GK 10 for non-GKs
    let remaining = budget - 10; // Reserve 10 for GK

    if (position === 'GK') {
        stats = { ATT: 10, MID: 10, DEF: 10, GK: 0 };
        remaining = budget - 30;
        stats.GK = remaining; // Dump rest into GK
        // Add some variance
        const variance = Math.floor(Math.random() * 10);
        stats.GK -= variance;
        stats.DEF += variance; // Sweeper keeper
    } else {
        // Weighted random distribution
        let weights;
        if (position === 'FW') weights = { ATT: 0.5, MID: 0.3, DEF: 0.2 };
        else if (position === 'MF') weights = { ATT: 0.3, MID: 0.4, DEF: 0.3 };
        else if (position === 'DF') weights = { ATT: 0.2, MID: 0.3, DEF: 0.5 };

        stats.ATT = Math.floor(remaining * weights.ATT);
        stats.MID = Math.floor(remaining * weights.MID);
        stats.DEF = Math.floor(remaining * weights.DEF);

        // Adjust to match exact budget due to rounding
        const currentSum = stats.ATT + stats.MID + stats.DEF + stats.GK;
        const diff = budget - currentSum;
        stats.MID += diff; // Dump remainder in MID
    }

    const name = `${NAMES[Math.floor(Math.random() * NAMES.length)]} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}.`;

    // Calculate Overall Rating (Average of relevant stats)
    let rating;
    if (position === 'GK') rating = stats.GK;
    else if (position === 'FW') rating = Math.floor((stats.ATT * 0.6) + (stats.MID * 0.4));
    else if (position === 'MF') rating = Math.floor((stats.MID * 0.5) + (stats.ATT * 0.25) + (stats.DEF * 0.25));
    else rating = Math.floor((stats.DEF * 0.6) + (stats.MID * 0.4));

    // Choose random trait for non-commons
    const trait = rarity !== 'COMMON' ? TRAITS[Math.floor(Math.random() * TRAITS.length)] : null;

    // Simulation attributes
    const workRate = ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)];
    const stamina = Math.floor(Math.random() * 41) + 60; // 60-100
    const aggression = Math.floor(Math.random() * 61) + 30; // 30-90

    return {
        id: `c_${id}_${Date.now()}`,
        name,
        position,
        rarity,
        stats,
        rating,
        trait,
        workRate,
        stamina,
        aggression,
        image: null // Placeholder
    };
};

const generatePack = (count = 5) => {
    return Array.from({ length: count }, (_, i) => generateCard(i));
};

module.exports = { generateCard, generatePack };
