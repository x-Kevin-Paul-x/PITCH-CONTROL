import fs from 'fs';
import path from 'path';

// Seeded PRNG to ensure 100% deterministic outputs
function createRandom(seed) {
    let s = seed;
    return function() {
        let x = Math.sin(s++) * 10000;
        return x - Math.floor(x);
    };
}

const random = createRandom(1984); // Fixed seed for card stats and name determinism
const loreRandom = createRandom(2026); // Fixed seed for lore, manager, and staff narratives

// Shuffle array deterministically
function shuffle(array, prng = random) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(prng() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

const PREFIXES = [
    'Vanguard', 'Ironclad', 'Solaris', 'Glacier', 'Void', 
    'Valhalla', 'Oceanus', 'Wildwood', 'Titan', 'Aero', 
    'Crystalline', 'Echo', 'Onyx', 'Runic', 'Cyber', 
    'Aethelgard', 'Nova', 'Helios', 'Zenith', 'Bramble',
    'Specter', 'Zephyr', 'Apex', 'Horizon', 'Sentinel',
    'Shadow', 'Silver', 'Ignis', 'Aegis', 'Phoenix'
];

const SUFFIXES = [
    'FC', 'United', 'Wanderers', 'Strikers', 'Athletic', 
    'Rovers', 'Rangers', 'Spikes', 'Knights', 'Harriers',
    'Alliance', 'Dynamos', 'FC', 'United', 'Wanderers'
];

const FIRST_NAMES = [
    'Marcus', 'Jaxon', 'Silas', 'Clara', 'Aero', 'Breeze', 'Gale', 'Aurora', 'Orion', 'Rayna',
    'Helios', 'Nova', 'Kelvin', 'Nyx', 'Viper', 'Umbra', 'Cedric', 'Galahad', 'Tristan', 'Arthur',
    'Kenji', 'Rin', 'Cypher', 'Oakley', 'Talon', 'Bramble', 'Marina', 'Reef', 'Sandy', 'Thorin',
    'Freya', 'Loki', 'Bjorn', 'Leo', 'Fang', 'Hugo', 'Max', 'Kai', 'Finn',
    'Axel', 'Jude', 'Luca', 'Zane', 'Ryder', 'Colt', 'Nash', 'Knox', 'Beck', 'Cruz',
    'Drake', 'Gavin', 'Kaelen', 'Devin', 'Brody', 'Keegan', 'Ronan', 'Declan', 'Kian', 'Rowan',
    'Cassian', 'Dorian', 'Caspian', 'Lucian', 'Kieran', 'Evander', 'Leander', 'Lysander', 'Alistair', 'Valerius',
    'Gideon', 'Simeon', 'Thaddeus', 'Tobias', 'Benedict', 'Dominic', 'Sebastian', 'Julian', 'Adrian', 'Fabian',
    'Dante', 'Marco', 'Enzo', 'Matteo', 'Luca', 'Nico', 'Giovanni', 'Angelo', 'Antonio', 'Rico',
    'Carlos', 'Mateo', 'Diego', 'Santiago', 'Alejandro', 'Javier', 'Miguel', 'Luis', 'Manuel', 'Rafael',
    'Kaito', 'Hiroto', 'Ren', 'Haruto', 'Sota', 'Yuto', 'Riku', 'Sora', 'Takuya', 'Ryouta',
    'Sven', 'Lars', 'Nils', 'Erik', 'Magnus', 'Olaf', 'Gunnar', 'Leif', 'Bjarni', 'Torstein',
    'Winston', 'Clement', 'Barnaby', 'Archibald', 'Reginald', 'Percival', 'Leopold', 'Balthazar', 'Cornelius', 'Gulliver',
    'Cyrus', 'Darius', 'Xerxes', 'Zephyr', 'Aurelius', 'Tiberius', 'Hadrian', 'Augustus', 'Constantine', 'Theodore',
    'Felix', 'Jasper', 'Oliver', 'Oscar', 'Henry', 'Milo', 'Atticus', 'Ezra', 'Asher', 'Wyatt',
    'Cormac', 'Bruno', 'Emil', 'Viktor', 'Stefan', 'Nikolai', 'Dimitri', 'Ivan', 'Yuri', 'Alexei'
];

const LAST_NAMES = [
    'Vance', 'Steel', 'Thorne', 'Iron', 'Taylor', 'Sky', 'Swift', 'Jet', 'Sol', 'Bright',
    'Finch', 'Kepler', 'Flare', 'Jones', 'Ramirez', 'Void', 'Bold', 'Stone', 'Shield', 'Crown',
    'Sato', 'Byte', 'Williams', 'Forest', 'Adams', 'Miller', 'Wave', 'Davis', 'Shores', 'Thunder',
    'Shields', 'Trickster', 'Pride', 'Roberts', 'Wolf', 'Hawthorne', 'Blackwood', 'Redwood', 'Oak', 'Pine',
    'Frost', 'Winter', 'Snow', 'Glacier', 'Ice', 'Stone', 'Rock', 'Clay', 'Flint', 'Slate',
    'Ridge', 'Peak', 'Vale', 'Dale', 'Canyon', 'Gorge', 'River', 'Brook', 'Lake', 'Ocean',
    'Tide', 'Current', 'Wave', 'Sands', 'Dune', 'Beach', 'Shore', 'Storm', 'Gale', 'Tempest',
    'Breeze', 'Zephyr', 'Wind', 'Cloud', 'Sky', 'Star', 'Moon', 'Sun', 'Solar', 'Nova',
    'Kepler', 'Orion', 'Sirius', 'Vega', 'Altair', 'Rigel', 'Antares', 'Castor', 'Pollux', 'Capella',
    'Valerius', 'Sovereign', 'Rex', 'Regis', 'Vassal', 'Knight', 'Squire', 'Page', 'Shield', 'Sword',
    'Spear', 'Lance', 'Bow', 'Arrow', 'Bolt', 'Archer', 'Fletcher', 'Hunter', 'Trapper', 'Predator',
    'Viper', 'Cobra', 'Adder', 'Serpent', 'Fang', 'Claw', 'Talon', 'Beak', 'Roar', 'Howl',
    'Glitch', 'Byte', 'Pixel', 'Vector', 'Matrix', 'Raster', 'Buffer', 'Cache', 'Stack', 'Heap',
    'Core', 'Kernel', 'Shell', 'Code', 'Syntax', 'Script', 'Compiler', 'Linker', 'Node', 'Thread',
    'Ironclad', 'Anvil', 'Hammer', 'Forge', 'Smith', 'Wrecker', 'Rivet', 'Bolt', 'Gear', 'Spindle'
];

const TRAITS = [
    { id: 'Poacher', name: 'Poacher', desc: '+20 ATT if opponent plays a GK card' },
    { id: 'Captain', name: 'Captain', desc: '+10 to all stats if played in Round 5' },
    { id: 'Super Sub', name: 'Super Sub', desc: '+15 to active stat if drawn from bench' },
    { id: 'Enforcer', name: 'Enforcer', desc: 'Win a DEF duel to halve opponent\'s next card stats' },
    { id: 'Playmaker', name: 'Playmaker', desc: 'Win a MID duel to choose next round\'s attribute' },
    { id: 'False Nine', name: 'False Nine', desc: 'Can use MID stat instead of ATT stat on Attack rolls' },
    { id: 'Wall', name: 'Wall', desc: 'Wins all ties on DEF rolls' }
];

const PHILOSOPHIES = [
    { name: 'Possession Control', focus: 'MID', desc: 'Dominates play through precise passing and coordinate control.' },
    { name: 'Low Block Defense', focus: 'DEF', desc: 'Sits deep and repels attack after attack with rigid discipline.' },
    { name: 'Gegenpressing', focus: 'MID', desc: 'Hyper-aggressive pressing to force quick turnovers in high areas.' },
    { name: 'Wing Attack & Cross', focus: 'ATT', desc: 'Utilizes high-speed wingers to launch aerial balls into the box.' },
    { name: 'Route One Direct', focus: 'ATT', desc: 'Bypasses the midfield entirely with long balls to towering strikers.' },
    { name: 'Counter-Attack Press', focus: 'DEF', desc: 'Soaks up pressure then breaks forward with devastating speed.' }
];

const MOTTO_TEMPLATES = [
    "Unbowed, Unbroken, Unyielding.",
    "To the skies, on wings of speed.",
    "Precision in every coordinate.",
    "Roots in the soil, hearts in the match.",
    "Light reveals all angles and opportunities.",
    "We strike from the deepest shadow.",
    "Optimization is the only path to victory.",
    "To the great hall of soccer glory.",
    "Ride the ocean tide to triumph.",
    "Forged in fire, tempered in iron.",
    "Honor and duty run in our veins.",
    "Unleash the hunting pack.",
    "Every pass a mathematical calculation.",
    "The ocean returns all waves, we return all attacks.",
    "Through grit, determination, and steel to glory.",
    "Ascend the highest peaks, conquer the field.",
    "Silent, stealthy, but lethal.",
    "Heavy iron, heavy pressure.",
    "Defend the crown, honor the legacy.",
    "Wild, free, and fierce on the pitch."
];

// Spatian Prefix-based Lore Descriptions
const PREFIX_LORE_MAP = {
    Vanguard: 'Founded as a military tactical academy to train battlefield captains, the club was built on a foundation of absolute strategic discipline and rigorous study.',
    Ironclad: 'Born in the heavy industrial weld-forums of the harbor rim, this club was established by steam-forge laborers who forged their own steel-plated training pitch.',
    Solaris: 'Established by an ancient order of solar-temple astronomers, the club treats the pitch coordinates as celestial pathways aligned with the movement of the sun.',
    Glacier: 'Formed by nitrogen pipeline engineers in the sub-zero polar ice caps, this club was forged in freezing winds and maintains a cold, frostbitten resilience.',
    Void: 'Hailing from the geothermal mining outposts of the deep basalt trenches, the club was created by excavators who are used to operating in pitch-black pressure.',
    Valhalla: 'Founded by the high-altitude cloud clans of the northern peaks, the club treats every tactical duel as a sacred trial of strength and divine honor.',
    Oceanus: 'Created by deep-sea merchant cartels and marine biologists, the club represents the deepwater ocean fleets and is funded by ocean trade monopolies.',
    Wildwood: 'Established by a guild of druidic forest scouts and timber-wardens, the club fights to preserve the ancient redwood boundaries from industrial expansion.',
    Titan: 'Backed by automated heavy-metal foundry barons, the club operates out of massive steel complexes and is famous for its mechanical training systems.',
    Aero: 'Formed by veteran cloud-skiff pilots who view tactical football as a three-dimensional dogfight governed by wind currents and aerodynamics.',
    Crystalline: 'Established by silica miners and precision glass-weavers who build the optical processors for Spatia\'s holographic projectors.',
    Echo: 'Founded by sound-wave frequency researchers and sonar operators who utilize acoustics to synchronize player movements on the pitch.',
    Onyx: 'Born in the volcanic cavern cities, this club was founded by dark-gem cutters and underground tunnelers who excel in tight, narrow spaces.',
    Runic: 'Established by historians who decoded prehistoric tactical monoliths and seek to apply ancient geometric symbols to the green grid.',
    Cyber: 'A transhumanist franchise founded by neural network engineers and elite software hackers who treat player profiles as digital code.',
    Aethelgard: 'Formed by royal palace heralds and lineage keepers who maintain pre-Calibration feudal combat traditions on the tactical grid.',
    Nova: 'Created by stellar astrophysicists who calculate player drift rates and vector curves under the guidance of cosmic maps.',
    Helios: 'Born in the high-pressure thermal reactors of the central sun-wells, the club represents the power grid engineers who operate the metropolitan lights.',
    Zenith: 'Founded by mountain summit cartographers and climbing guides who view the Pitch Control League as a sheer peak to be conquered step-by-step.',
    Bramble: 'Established by outland thicket-farmers and wild-beast trappers who survived the harsh flora of the borderlands.',
    Specter: 'Formed by former reconnaissance operatives and night scouts who specialize in diversion, decoy tactics, and covert coordination.',
    Zephyr: 'Hailing from the windy bays, this club was founded by hydrofoil racers who harness the maritime winds to drive rapid transitions.',
    Apex: 'Founded by elite military flight commanders and airspace generals who treat tactical cards as air-squadron formations.',
    Horizon: 'Created by savanna hunters and nomadic trackers who spent generations mapping the migrations and wind paths of the grasslands.',
    Sentinel: 'Established by the guardians of the Great Boundary Wall, who spent centuries defending the frontier from wilderness raiders.',
    Shadow: 'A secret guild of illusionists and information brokers who treat Pitch Control as a game of deception, bluffs, and hidden signals.',
    Silver: 'Formed by the palace elite guards who protect the royal archives and royal cartographers in the central citadel.',
    Ignis: 'Born in the volcanic steam-bays, this club was founded by geothermal technicians who use thermal pressure grids to fuel their players.',
    Aegis: 'Created by stone-masons and heavy fortress-architects who spent generations building the impenetrable walls of the bastion cities.',
    Phoenix: 'Established by experimental rocketry engineers who view striker shots as rocket trajectories and ballistics.'
};

// Spatian Stadium Lore Descriptions
const STADIUM_LORE_MAP = {
    Foundry: 'The stadium is a roaring industrial marvel, where the pounding of steam-presses from nearby factories echoes through the holographic projectors, feeding the fans\' intense energy.',
    Aerie: 'Suspended thousands of feet above the ground on massive levitation platforms, the stadium is exposed to high-altitude winds, making every match a breathless aerial event.',
    Bay: 'Built on floating piers over a turbulent harbor, the pitch rises and falls slightly with the tides, and the salty ocean spray constantly drifts across the grid.',
    Glade: 'Nestled in a cleared grove of giant redwoods, the pitch is surrounded by towering trees, with portable solar generators humming beneath the mossy forest floor.',
    Dome: 'A colossal glass and steel structure containing simulated ecosystems, where weather patterns are dynamically altered to test players\' environmental adaptability.',
    Castle: 'Housed within the stone walls of a historic medieval fortress, the pitch is bordered by ancient battlements, and royal banners hang from the spectators\' galleries.',
    'Mead-Hall': 'A rustic, timber-framed coliseum smelling of roasted meats and ale, where boisterous frontier fans pound their wooden tables to cheer on their team.',
    Pinnacle: 'Perched on the jagged peak of a volcanic mountain, the stadium offers panoramic views of the clouds below, with geothermal vents venting steam around the pitch.',
    Sanctuary: 'A peaceful, marble-lined amphitheater situated inside a neutral valley sanctuary, designed to promote tactical focus and respectful strategic duels.',
    Ridge: 'Carved directly into the side of a deep canyon wall, the stadium is a natural acoustic chamber where the cheers of the local crowd are magnified tenfold.'
};

// Generate 60 unique club names deterministically using the original card generator's PRNG
const clubNamesPool = [];
PREFIXES.forEach(pref => {
    SUFFIXES.forEach(suff => {
        clubNamesPool.push(`${pref} ${suff}`);
    });
});
const uniqueClubNames = shuffle([...new Set(clubNamesPool)], random).slice(0, 60);

const LEAGUES = [
    { id: 'apex', name: 'Apex Division', tier: 1 },
    { id: 'challenger', name: 'Challenger League', tier: 2 },
    { id: 'foundation', name: 'Foundation Shield', tier: 3 }
];

const CLUBS = [];
const PLAYERS = [];

// Helper to get HSL colors based on league tier
function getThemeColors(tier, index) {
    const hue = (index * 137) % 360;
    if (tier === 1) {
        return {
            primary: `hsl(${hue}, 75%, 35%)`,
            secondary: `hsl(${(hue + 60) % 360}, 90%, 65%)`
        };
    } else if (tier === 2) {
        return {
            primary: `hsl(${hue}, 85%, 45%)`,
            secondary: `hsl(${(hue + 180) % 360}, 100%, 55%)`
        };
    } else {
        return {
            primary: `hsl(${hue}, 35%, 25%)`,
            secondary: `hsl(${(hue + 45) % 360}, 45%, 40%)`
        };
    }
}

// Helper to deterministically pick random name using lore PRNG
function getDeterministicName(prng) {
    const fn = FIRST_NAMES[Math.floor(prng() * FIRST_NAMES.length)];
    const ln = LAST_NAMES[Math.floor(prng() * LAST_NAMES.length)];
    return `${fn} ${ln}`;
}

// Generate Clubs and Manager/Staff Leadership
for (let i = 0; i < 60; i++) {
    const leagueIndex = Math.floor(i / 20);
    const league = LEAGUES[leagueIndex];
    const clubName = uniqueClubNames[i];
    const moniker = clubName.split(' ')[0];
    const position = (i % 20) + 1; // Temporary layout
    const colors = getThemeColors(league.tier, i);
    const philosophy = PHILOSOPHIES[Math.floor(random() * PHILOSOPHIES.length)];
    const motto = MOTTO_TEMPLATES[Math.floor(random() * MOTTO_TEMPLATES.length)];

    const founders = ['dockworkers', 'astronomy students', 'mountain climbers', 'harbor fishermen', 'tech engineers', 'rebel artists', 'palace guards', 'forest scouts', 'ancient descendants', 'savanna hunters'];
    const selectedFounders = founders[Math.floor(random() * founders.length)];
    
    const stadiumPrefixes = ['Foundry', 'Aerie', 'Bay', 'Glade', 'Dome', 'Castle', 'Mead-Hall', 'Pinnacle', 'Sanctuary', 'Ridge'];
    const selectedStadiumPrefix = stadiumPrefixes[Math.floor(random() * stadiumPrefixes.length)];
    const selectedStadium = `The ${selectedStadiumPrefix} Arena`;

    // Construct rich historical text
    const prefixLore = PREFIX_LORE_MAP[moniker] || `A distinguished guild established to explore tactical soccer maneuvers in Spatia.`;
    const stadiumLore = STADIUM_LORE_MAP[selectedStadiumPrefix] || `The arena is renowned for its vocal local fanbase and historic roots.`;
    const clubLore = `${prefixLore} ${stadiumLore} Under the current era, they compete aggressively to claim territorial pride. Their colors, ${colors.primary} and ${colors.secondary}, light up the holographic columns before every match, driven by a highly passionate local assembly.`;

    // Generate Manager details deterministically using loreRandom
    const managerName = getDeterministicName(loreRandom);
    let managerBio = '';
    if (philosophy.name === 'Possession Control') {
        managerBio = `A rigorous academic who graduated from the Royal Cartography Guild. ${managerName} treats the pitch as a musical score, directing players with mathematical precision. However, their extreme tactical rigidity and refusal to play direct football caused a famous fallout with the board, almost leading to a relegation scare before their chief analyst intervened with a modified script.`;
    } else if (philosophy.name === 'Low Block Defense') {
        managerBio = `A stoic defender of the bastion keeps, who spent decades studying defensive siege warfare. ${managerName} believes that a 0-0 draw is a work of art and values physical discipline above all. Their defensive block is legendary, though their refusal to train attackers led to a public rebellion from the squad's strikers, who accused them of suffocating their careers.`;
    } else if (philosophy.name === 'Gegenpressing') {
        managerBio = `A former neural scientist who adapted swarm intelligence algorithms for the Pitch Control grid. ${managerName} demands relentless, suffocating energy from their players, forcing immediate turnovers. While highly successful in short tournaments, their extreme training regimes have caused high fatigue rates, leading to public clashes with the medical staff over player welfare.`;
    } else if (philosophy.name === 'Wing Attack & Cross') {
        managerBio = `A legendary former sky-pilot who views the football pitch as an open sky. ${managerName} demands high-speed runs down the flanks and soaring aerial crosses to towering target men. Their fluid, wing-based attack is breathtaking to watch, though their defensive negligence has occasionally led to embarrassing high-scoring defeats in crucial derbies.`;
    } else if (philosophy.name === 'Route One Direct') {
        managerBio = `An old-school commander from the outlands rail-cannon garrisons. ${managerName} despises short passing, preferring to bypass the midfield with direct vertical launches to towering target forwards. While their pragmatic approach is highly effective in gritty matches, it has drawn ire from the fans, who demand a more aesthetic style of play.`;
    } else { // Counter-Attack Press
        managerBio = `A master of trap-setting and rapid transitions who spent years engineering turbine cycles in the steam yards. ${managerName} organizes their team in a deep defensive shape, baiting the opponent into overcommitting before snapping forward with devastating speed. Their tactical traps are highly feared, though their conservative nature can lead to passive draws against weaker teams.`;
    }

    const manager = {
        name: managerName,
        role: 'Manager & Chief Tactician',
        bio: managerBio
    };

    // Generate Staff details deterministically using loreRandom
    const staff1Name = getDeterministicName(loreRandom);
    const staff2Name = getDeterministicName(loreRandom);
    const staff = [
        {
            name: staff1Name,
            role: 'Technical Director',
            bio: `Responsible for scouting and contract allocations. ${staff1Name} famously built the foundation of their scout network, but frequently clashes with Manager ${managerName} over budget allocations and player transfers.`
        },
        {
            name: staff2Name,
            role: 'Chief Tactical Analyst',
            bio: `Runs the hard-light pitch projection simulators. ${staff2Name} monitors player stamina curves and developed a unique training program to optimize the team's tactical focus during competitive matchups.`
        }
    ];

    CLUBS.push({
        id: `club_${i + 1}`,
        name: clubName,
        moniker,
        league: league.name,
        leagueId: league.id,
        tier: league.tier,
        position,
        motto,
        philosophy: philosophy.name,
        focusAttribute: philosophy.focus,
        primaryColor: colors.primary,
        secondaryColor: colors.secondary,
        lore: clubLore,
        stadium: selectedStadium,
        strengths: '', 
        weaknesses: '',
        manager,
        staff
    });
}

// Shuffle league positions
for (const league of LEAGUES) {
    const leagueClubs = CLUBS.filter(c => c.leagueId === league.id);
    const positions = shuffle(Array.from({ length: 20 }, (_, i) => i + 1), random);
    leagueClubs.forEach((club, idx) => {
        club.position = positions[idx];
    });
}

// Setup club strengths and weaknesses based on philosophy focus
CLUBS.forEach(club => {
    if (club.focusAttribute === 'ATT') {
        club.strengths = 'Lethal finishing, explosive counter-attacks, forward target aerial duels.';
        club.weaknesses = 'Vulnerable to counter-attacks, midfield stamina drain, defensive coordination.';
    } else if (club.focusAttribute === 'MID') {
        club.strengths = 'High possession control, passing accuracy, central spatial dominance.';
        club.weaknesses = 'Occasionally lacks direct penetration, vulnerable to physical long balls.';
    } else {
        club.strengths = 'Unbreakable low block defense, aggressive tackles, aerial clearances.';
        club.weaknesses = 'Slow transition speed, limited creativity in midfield, goal scoring reliance.';
    }
});

// Pass 1: Generate Players deterministically (stats, names, ratings, traits, rarities)
let playerIdCounter = 1;
CLUBS.forEach(club => {
    const starIndex = Math.floor(random() * 20); // Pick random position for star player
    
    // We generate exactly 20 players: 5 FWs (0-4), 6 MFs (5-10), 6 DFs (11-16), 3 GKs (17-19)
    for (let pIdx = 0; pIdx < 20; pIdx++) {
        let position = 'MF';
        if (pIdx < 5) position = 'FW';
        else if (pIdx < 11) position = 'MF';
        else if (pIdx < 17) position = 'DF';
        else position = 'GK';

        const isStar = pIdx === (position === 'FW' ? 0 : position === 'MF' ? 5 : position === 'DF' ? 11 : 17); // simple anchor
        
        let rarity = 'COMMON';
        if (isStar) {
            rarity = club.tier === 1 ? 'LEGEND' : club.tier === 2 ? 'ELITE' : 'RARE';
        } else {
            const randVal = random();
            if (club.tier === 1) {
                rarity = randVal > 0.8 ? 'ELITE' : randVal > 0.5 ? 'RARE' : 'COMMON';
            } else if (club.tier === 2) {
                rarity = randVal > 0.85 ? 'RARE' : 'COMMON';
            } else {
                rarity = 'COMMON';
            }
        }

        const tsbMap = { COMMON: 180, RARE: 210, ELITE: 240, LEGEND: 270 };
        const budget = tsbMap[rarity];

        let stats = { ATT: 10, MID: 10, DEF: 10, GK: 10 };
        let remaining = budget;

        if (position === 'GK') {
            stats.ATT = 10;
            stats.MID = 10;
            stats.DEF = 10;
            stats.GK = budget - 30;
            const variance = Math.floor(random() * 12);
            stats.GK -= variance;
            stats.DEF += variance;
        } else {
            remaining = budget - 10;
            let weights = { ATT: 0.33, MID: 0.34, DEF: 0.33 };
            
            if (position === 'FW') {
                weights = { ATT: 0.55, MID: 0.28, DEF: 0.17 };
            } else if (position === 'MF') {
                weights = { ATT: 0.27, MID: 0.46, DEF: 0.27 };
            } else if (position === 'DF') {
                weights = { ATT: 0.17, MID: 0.28, DEF: 0.55 };
            }

            stats.ATT = Math.floor(remaining * weights.ATT);
            stats.MID = Math.floor(remaining * weights.MID);
            stats.DEF = Math.floor(remaining * weights.DEF);

            const sum = stats.ATT + stats.MID + stats.DEF + stats.GK;
            const diff = budget - sum;
            stats.MID += diff;
        }

        let rating;
        if (position === 'GK') rating = stats.GK;
        else if (position === 'FW') rating = Math.floor((stats.ATT * 0.6) + (stats.MID * 0.4));
        else if (position === 'MF') rating = Math.floor((stats.MID * 0.5) + (stats.ATT * 0.25) + (stats.DEF * 0.25));
        else rating = Math.floor((stats.DEF * 0.6) + (stats.MID * 0.4));

        if (rarity === 'LEGEND' && rating < 90) rating = 92;
        if (rarity === 'ELITE' && rating < 80) rating = 82;

        const firstName = FIRST_NAMES[Math.floor(random() * FIRST_NAMES.length)];
        const lastName = LAST_NAMES[Math.floor(random() * LAST_NAMES.length)];
        const name = `${firstName} ${lastName}`;

        let trait = null;
        if (isStar) {
            trait = TRAITS[Math.floor(random() * TRAITS.length)];
        } else if (rarity !== 'COMMON' && random() > 0.5) {
            trait = TRAITS[Math.floor(random() * TRAITS.length)];
        }

        const workRate = ['Low', 'Medium', 'High'][Math.floor(random() * 3)];
        const stamina = 60 + Math.floor(random() * 41); // 60-100
        const aggression = 30 + Math.floor(random() * 61); // 30-90

        PLAYERS.push({
            id: `p_${playerIdCounter++}`,
            name,
            clubId: club.id,
            clubName: club.name,
            position,
            rarity,
            stats,
            rating,
            trait,
            workRate,
            stamina,
            aggression,
            lore: '' // Will fill in Pass 2
        });
    }
});

// Pass 2: Dynamic Lore Enrichment & Player Interconnection
const NICKNAMES = ['The Shield', 'The Lightning', 'The Engine', 'Glitch', 'The Anchor', 'The Poacher', 'The Maestro', 'Meteor', 'Ice-Cold', 'Talon', 'Bramble', 'Iron Lung'];
const LEGENDARY_EVENTS = [
    'scoring a 45-yard volley into the top corner during the final seconds of the local derby',
    'stopping three successive penalty kicks in extra time of the cup final',
    'intercepting a goal-bound shot with an aggressive sliding tackle on the goal line',
    'delivering a perfect 60-yard diagonal pass to clinch the league promotion',
    'commanding an unbreakable defensive low block for 90 minutes straight under heavy pressure',
    'intercepting the ball in a crucial 1v1 duel to preserve a clean sheet'
];
const STAR_QUOTES = [
    "The grid is a chessboard, and every player must know their coordinates.",
    "We do not play against the cards; we play against the minds of the managers.",
    "When the Match Die lands, you must already have three responses prepared.",
    "Tactics are nothing without stamina, and stamina is nothing without belief.",
    "A goal is just a mathematical inevitability when your coordinates are correct.",
    "Let them have their possession; we will take the victory."
];
const COMMON_QUIRKS = [
    'Off the pitch, they are an avid amateur skyship pilot who spends hours studying wind currents.',
    'They are notoriously superstitious, always wearing the same pair of faded green socks under their boots.',
    'Before turning to Pitch Control, they were a regional chess champion who excels at reading spatial setups.',
    'They spend their free time volunteering in the stadium engine rooms, helping tune the hard-light projectors.',
    'They are known to carry a lucky copper coin minted in 1880 in their pocket during matches.',
    'In their spare time, they paint miniature models of the historic sky-ships of Spatia.',
    'They analyze player stats after every match, maintaining their own hand-written ledger of coordinates.',
    'A local harbor kid who was discovered playing on the docks with a makeshift ball.'
];

// Perform player-to-player link mapping
PLAYERS.forEach((player) => {
    const club = CLUBS.find(c => c.id === player.clubId);
    const squad = PLAYERS.filter(p => p.clubId === club.id);
    const starPlayer = squad.find(p => p.rarity === 'LEGEND' || p.rarity === 'ELITE' || p.rarity === 'RARE') || player;
    
    // Find a rival star in the same league
    const leagueClubs = CLUBS.filter(c => c.leagueId === club.leagueId && c.id !== club.id);
    const rivalClub = leagueClubs[Math.floor(loreRandom() * leagueClubs.length)];
    const rivalSquad = PLAYERS.filter(p => p.clubId === rivalClub.id);
    const rivalStar = rivalSquad.find(p => p.rarity === 'LEGEND' || p.rarity === 'ELITE' || p.rarity === 'RARE') || rivalSquad[0];

    const nickname = NICKNAMES[Math.floor(loreRandom() * NICKNAMES.length)];
    const event = LEGENDARY_EVENTS[Math.floor(loreRandom() * LEGENDARY_EVENTS.length)];
    const quote = STAR_QUOTES[Math.floor(loreRandom() * STAR_QUOTES.length)];
    const quirk = COMMON_QUIRKS[Math.floor(loreRandom() * COMMON_QUIRKS.length)];

    const isStar = player.id === starPlayer.id;

    if (isStar) {
        // Link to rival star
        player.lore = `A generational talent and the captain of ${club.name}. Known affectionately as '${nickname}' at ${club.stadium}, they famously secured their legacy by ${event} against rival star [[${rivalStar.id}|${rivalStar.name}]] in a crucial derby. Under the guidance of Manager ${club.manager.name}, they have fully mastered the ${club.philosophy} philosophy. "${quote}"`;
    } else if (player.rarity === 'RARE' || player.rarity === 'ELITE') {
        // Link to club star and manager
        player.lore = `Brought to ${club.name} to reinforce the tactical setups of Manager ${club.manager.name}. They serve as a key tactical lieutenant on the pitch, often supporting the captain [[${starPlayer.id}|${starPlayer.name}]] during high-stakes ${player.position} duels. Their outstanding contributions in maintaining positional grids have earned praise from the coaching staff.`;
    } else {
        // Common player: Link to manager or staff, and star player
        const analyst = club.staff[1];
        player.lore = `An industrious squad player who represents the hardworking core of ${club.name}. Discovered by Chief Analyst ${analyst.name}, they work tirelessly in training to emulate [[${starPlayer.id}|${starPlayer.name}]]'s tactical movement. ${quirk} They provide vital squad depth during long league campaigns.`;
    }
});

// Update Clubs with their best player name
CLUBS.forEach(club => {
    const clubSquad = PLAYERS.filter(p => p.clubId === club.id);
    const star = clubSquad.find(p => p.rarity === 'LEGEND' || p.rarity === 'ELITE' || p.rarity === 'RARE');
    club.bestPlayer = star ? `${star.name} (${star.rarity} ${star.position})` : 'None';
});

// 1. Write src/utils/cardsDatabase.js
const dbContent = `// Deterministic Seeded Cards Database
// Generated programmatically. Do not edit directly.

export const CLUBS = ${JSON.stringify(CLUBS, null, 4)};

export const PLAYERS = ${JSON.stringify(PLAYERS, null, 4)};
`;

fs.writeFileSync(path.join(process.cwd(), 'src', 'utils', 'cardsDatabase.js'), dbContent);
console.log('✅ Generated src/utils/cardsDatabase.js');

// 2. Write Teams.md
let markdownContent = `# Pitch Control League Lore Book
Welcome to the official tactical register of the Pitch Control Leagues. Below are the detailed profiles of all 60 clubs competing across the 3 divisions: **Apex Division**, **Challenger League**, and **Foundation Shield**.

---

`;

LEAGUES.forEach(league => {
    markdownContent += `## 🏆 ${league.name} (Tier ${league.tier})\n`;
    markdownContent += `The ${league.name} features 20 highly competitive clubs locked in a season-long battle. Here are their tactical registers and histories.\n\n`;

    const leagueClubs = CLUBS.filter(c => c.leagueId === league.id).sort((a, b) => a.position - b.position);

    leagueClubs.forEach(club => {
        markdownContent += `### Pos ${club.position}: ${club.name} ("${club.moniker}")\n`;
        markdownContent += `*   **Motto**: *"${club.motto}"*\n`;
        markdownContent += `*   **Stadium**: ${club.stadium}\n`;
        markdownContent += `*   **Tactical Style**: ${club.philosophy} (Focus: ${club.focusAttribute})\n`;
        markdownContent += `*   **Strengths**: ${club.strengths}\n`;
        markdownContent += `*   **Weaknesses**: ${club.weaknesses}\n`;
        markdownContent += `*   **Star Player**: ${club.bestPlayer}\n`;
        markdownContent += `*   **Manager**: ${club.manager.name} (*${club.manager.role}*) - ${club.manager.bio}\n`;
        markdownContent += `*   **Key Staff members**:\n`;
        club.staff.forEach(member => {
            markdownContent += `    - **${member.name}** (*${member.role}*) - ${member.bio}\n`;
        });
        markdownContent += `\n`;
        markdownContent += `#### Club History:\n${club.lore}\n\n`;
        markdownContent += `#### Squad List:\n`;
        
        const squad = PLAYERS.filter(p => p.clubId === club.id);
        squad.forEach(p => {
            const traitStr = p.trait ? ` [Trait: ${p.trait.name}]` : '';
            markdownContent += `-   **${p.name}** (${p.rarity} ${p.position}) - Rating: **${p.rating}** (ATT: ${p.stats.ATT} | MID: ${p.stats.MID} | DEF: ${p.stats.DEF} | GK: ${p.stats.GK})${traitStr}\n`;
        });
        markdownContent += `\n---\n\n`;
    });
});

fs.writeFileSync(path.join(process.cwd(), 'Teams.md'), markdownContent);
console.log('✅ Generated Teams.md');
