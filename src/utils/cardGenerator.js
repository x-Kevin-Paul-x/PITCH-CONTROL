const POSITIONS = ['FW', 'MF', 'DF', 'GK'];
const NAMES = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
    'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
];

const RARITY_WEIGHTS = {
    COMMON: 0.70,
    RARE: 0.20,
    ELITE: 0.09,
    LEGEND: 0.01
};

const TSB = {
    COMMON: 180,
    RARE: 210,
    ELITE: 240,
    LEGEND: 270
};

export const generateCard = (id) => {
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

    // Add small random noise (-5 to +5) to make cards unique, keeping sum roughly same
    // (Simplified for now)

    const name = `${NAMES[Math.floor(Math.random() * NAMES.length)]} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}.`;

    // Calculate Overall Rating (Average of relevant stats)
    let rating;
    if (position === 'GK') rating = stats.GK;
    else if (position === 'FW') rating = Math.floor((stats.ATT * 0.6) + (stats.MID * 0.4));
    else if (position === 'MF') rating = Math.floor((stats.MID * 0.5) + (stats.ATT * 0.25) + (stats.DEF * 0.25));
    else rating = Math.floor((stats.DEF * 0.6) + (stats.MID * 0.4));

    return {
        id: `c_${id}_${Date.now()}`,
        name,
        position,
        rarity,
        stats,
        rating,
        image: null // Placeholder
    };
};

export const generatePack = (count = 5) => {
    return Array.from({ length: count }, (_, i) => generateCard(i));
};
