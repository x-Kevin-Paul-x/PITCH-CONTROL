import fs from 'fs';
import path from 'path';

// Seeded PRNG
function createRandom(seed) {
    let s = seed;
    return function() {
        let x = Math.sin(s++) * 10000;
        return x - Math.floor(x);
    };
}
const random = createRandom(1984);
const loreRandom = createRandom(2026);

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

const PHILOSOPHIES = {
    'Low Block Defense': { focus: 'DEF', strengths: 'Unbreakable low block defense, aggressive tackles, aerial clearances.', weaknesses: 'Slow transition speed, limited creativity in midfield, goal scoring reliance.' },
    'Possession Control': { focus: 'MID', strengths: 'High possession control, passing accuracy, central spatial dominance.', weaknesses: 'Occasionally lacks direct penetration, vulnerable to physical long balls.' },
    'Gegenpressing': { focus: 'MID', strengths: 'High possession control, passing accuracy, central spatial dominance.', weaknesses: 'Occasionally lacks direct penetration, vulnerable to physical long balls.' },
    'Wing Attack & Cross': { focus: 'ATT', strengths: 'Lethal finishing, explosive counter-attacks, forward target aerial duels.', weaknesses: 'Vulnerable to counter-attacks, midfield stamina drain, defensive coordination.' },
    'Route One Direct': { focus: 'ATT', strengths: 'Lethal finishing, explosive counter-attacks, forward target aerial duels.', weaknesses: 'Vulnerable to counter-attacks, midfield stamina drain, defensive coordination.' },
    'Counter-Attack Press': { focus: 'DEF', strengths: 'Unbreakable low block defense, aggressive tackles, aerial clearances.', weaknesses: 'Slow transition speed, limited creativity in midfield, goal scoring reliance.' }
};

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

// Pre-defined curated club list
const HANDCRAFTED_CLUBS = [
    // Apex Division
    { id: 'club_1', name: 'Aegis Citadel FC', moniker: 'Aegis', philosophy: 'Low Block Defense', tier: 1, leagueId: 'apex', leagueName: 'Apex Division', stadium: 'The Bastion Citadel' },
    { id: 'club_2', name: 'Cyber Nexus FC', moniker: 'Cyber', philosophy: 'Possession Control', tier: 1, leagueId: 'apex', leagueName: 'Apex Division', stadium: 'The Neural Arena' },
    { id: 'club_3', name: 'Valhalla Sentinels', moniker: 'Valhalla', philosophy: 'Low Block Defense', tier: 1, leagueId: 'apex', leagueName: 'Apex Division', stadium: 'The Great Keep' },
    { id: 'club_4', name: 'Helios Sovereign', moniker: 'Helios', philosophy: 'Gegenpressing', tier: 1, leagueId: 'apex', leagueName: 'Apex Division', stadium: 'The Solar Spire' },
    { id: 'club_5', name: 'Crystalline Palace', moniker: 'Crystalline', philosophy: 'Possession Control', tier: 1, leagueId: 'apex', leagueName: 'Apex Division', stadium: 'The Glass Octagon' },
    { id: 'club_6', name: 'Solaris Vanguard', moniker: 'Solaris', philosophy: 'Route One Direct', tier: 1, leagueId: 'apex', leagueName: 'Apex Division', stadium: 'The Daybreak Pitch' },
    { id: 'club_7', name: 'Zenith Ascendants', moniker: 'Zenith', philosophy: 'Route One Direct', tier: 1, leagueId: 'apex', leagueName: 'Apex Division', stadium: 'The Summit Colosseum' },
    { id: 'club_8', name: 'Aethelgard Royal FC', moniker: 'Aethelgard', philosophy: 'Possession Control', tier: 1, leagueId: 'apex', leagueName: 'Apex Division', stadium: 'The Crown Amphitheater' },
    { id: 'club_9', name: 'Titan Foundry FC', moniker: 'Titan', philosophy: 'Route One Direct', tier: 1, leagueId: 'apex', leagueName: 'Apex Division', stadium: 'The Automated Forge' },
    { id: 'club_10', name: 'Ironclad Harbors', moniker: 'Ironclad', philosophy: 'Counter-Attack Press', tier: 1, leagueId: 'apex', leagueName: 'Apex Division', stadium: 'The Steel Drydock' },
    { id: 'club_11', name: 'Phoenix Horizon', moniker: 'Phoenix', philosophy: 'Gegenpressing', tier: 1, leagueId: 'apex', leagueName: 'Apex Division', stadium: 'The Burnished Sky-Dome' },
    { id: 'club_12', name: 'Specter Syndicate', moniker: 'Specter', philosophy: 'Counter-Attack Press', tier: 1, leagueId: 'apex', leagueName: 'Apex Division', stadium: 'The Shadow Grid' },
    { id: 'club_13', name: 'Oceanus Depths FC', moniker: 'Oceanus', philosophy: 'Possession Control', tier: 1, leagueId: 'apex', leagueName: 'Apex Division', stadium: 'The Geothermal Shelf' },
    { id: 'club_14', name: 'Wildwood United', moniker: 'Wildwood', philosophy: 'Gegenpressing', tier: 1, leagueId: 'apex', leagueName: 'Apex Division', stadium: 'The Ancient Redwood Grove' },
    { id: 'club_15', name: 'Silver Crowns', moniker: 'Silver', philosophy: 'Possession Control', tier: 1, leagueId: 'apex', leagueName: 'Apex Division', stadium: 'The Vault Sanctuary' },
    { id: 'club_16', name: 'Ignis Steamers', moniker: 'Ignis', philosophy: 'Counter-Attack Press', tier: 1, leagueId: 'apex', leagueName: 'Apex Division', stadium: 'The Geothermal Caldera' },
    { id: 'club_17', name: 'Aero Sky-Knights', moniker: 'Aero', philosophy: 'Wing Attack & Cross', tier: 1, leagueId: 'apex', leagueName: 'Apex Division', stadium: 'The Stratosphere Deck' },
    { id: 'club_18', name: 'Echo Frequency', moniker: 'Echo', philosophy: 'Possession Control', tier: 1, leagueId: 'apex', leagueName: 'Apex Division', stadium: 'The Resonant Amphitheater' },
    { id: 'club_19', name: 'Onyx Bastion', moniker: 'Onyx', philosophy: 'Low Block Defense', tier: 1, leagueId: 'apex', leagueName: 'Apex Division', stadium: 'The Obsidian Mine' },
    { id: 'club_20', name: 'Runic Monoliths', moniker: 'Runic', philosophy: 'Low Block Defense', tier: 1, leagueId: 'apex', leagueName: 'Apex Division', stadium: 'The Whispering Stone Glade' },

    // Challenger League
    { id: 'club_21', name: 'Vanguard Tactical', moniker: 'Vanguard', philosophy: 'Gegenpressing', tier: 2, leagueId: 'challenger', leagueName: 'Challenger League', stadium: 'The Cadet Field' },
    { id: 'club_22', name: 'Ironclad Dockers', moniker: 'Ironclad', philosophy: 'Low Block Defense', tier: 2, leagueId: 'challenger', leagueName: 'Challenger League', stadium: 'The Harbor Wall' },
    { id: 'club_23', name: 'Solaris Rays', moniker: 'Solaris', philosophy: 'Wing Attack & Cross', tier: 2, leagueId: 'challenger', leagueName: 'Challenger League', stadium: 'The Zenith Yard' },
    { id: 'club_24', name: 'Glacier Pipelines', moniker: 'Glacier', philosophy: 'Low Block Defense', tier: 2, leagueId: 'challenger', leagueName: 'Challenger League', stadium: 'The Frost Station' },
    { id: 'club_25', name: 'Void Geothermals', moniker: 'Void', philosophy: 'Counter-Attack Press', tier: 2, leagueId: 'challenger', leagueName: 'Challenger League', stadium: 'The Basalt Trench' },
    { id: 'club_26', name: 'Valhalla Sky-Raiders', moniker: 'Valhalla', philosophy: 'Route One Direct', tier: 2, leagueId: 'challenger', leagueName: 'Challenger League', stadium: 'The High Cloud Hangar' },
    { id: 'club_27', name: 'Oceanus Cargo FC', moniker: 'Oceanus', philosophy: 'Possession Control', tier: 2, leagueId: 'challenger', leagueName: 'Challenger League', stadium: 'The Sea-Port Pier' },
    { id: 'club_28', name: 'Wildwood Rangers', moniker: 'Wildwood', philosophy: 'Gegenpressing', tier: 2, leagueId: 'challenger', leagueName: 'Challenger League', stadium: 'The Mossy Outpost' },
    { id: 'club_29', name: 'Titan Automations', moniker: 'Titan', philosophy: 'Wing Attack & Cross', tier: 2, leagueId: 'challenger', leagueName: 'Challenger League', stadium: 'The Foundry Belt' },
    { id: 'club_30', name: 'Aero Cloud-Skiffs', moniker: 'Aero', philosophy: 'Wing Attack & Cross', tier: 2, leagueId: 'challenger', leagueName: 'Challenger League', stadium: 'The Sky Hangar' },
    { id: 'club_31', name: 'Crystalline Optics', moniker: 'Crystalline', philosophy: 'Possession Control', tier: 2, leagueId: 'challenger', leagueName: 'Challenger League', stadium: 'The Quartz Arena' },
    { id: 'club_32', name: 'Echo Sonars', moniker: 'Echo', philosophy: 'Possession Control', tier: 2, leagueId: 'challenger', leagueName: 'Challenger League', stadium: 'The Abyss Dome' },
    { id: 'club_33', name: 'Onyx Tunnelers', moniker: 'Onyx', philosophy: 'Counter-Attack Press', tier: 2, leagueId: 'challenger', leagueName: 'Challenger League', stadium: 'The Geode Shaft' },
    { id: 'club_34', name: 'Runic Stone-Cutters', moniker: 'Runic', philosophy: 'Low Block Defense', tier: 2, leagueId: 'challenger', leagueName: 'Challenger League', stadium: 'The Slate Quarry' },
    { id: 'club_35', name: 'Cyber Hackers FC', moniker: 'Cyber', philosophy: 'Gegenpressing', tier: 2, leagueId: 'challenger', leagueName: 'Challenger League', stadium: 'The Server Rack' },
    { id: 'club_36', name: 'Aethelgard Heralds', moniker: 'Aethelgard', philosophy: 'Possession Control', tier: 2, leagueId: 'challenger', leagueName: 'Challenger League', stadium: 'The Manor Gate' },
    { id: 'club_37', name: 'Nova Astrophysicists', moniker: 'Nova', philosophy: 'Possession Control', tier: 2, leagueId: 'challenger', leagueName: 'Challenger League', stadium: 'The Observatory Peak' },
    { id: 'club_38', name: 'Helios Sun-Wellers', moniker: 'Helios', philosophy: 'Counter-Attack Press', tier: 2, leagueId: 'challenger', leagueName: 'Challenger League', stadium: 'The Power Well' },
    { id: 'club_39', name: 'Zenith Climbers', moniker: 'Zenith', philosophy: 'Route One Direct', tier: 2, leagueId: 'challenger', leagueName: 'Challenger League', stadium: 'The High Pass' },
    { id: 'club_40', name: 'Bramble Trappers', moniker: 'Bramble', philosophy: 'Counter-Attack Press', tier: 2, leagueId: 'challenger', leagueName: 'Challenger League', stadium: 'The Border Thicket' },

    // Foundation Shield
    { id: 'club_41', name: 'Specter Phantoms', moniker: 'Specter', philosophy: 'Counter-Attack Press', tier: 3, leagueId: 'foundation', leagueName: 'Foundation Shield', stadium: 'The Mist Valley' },
    { id: 'club_42', name: 'Zephyr Wind-Riders', moniker: 'Zephyr', philosophy: 'Wing Attack & Cross', tier: 3, leagueId: 'foundation', leagueName: 'Foundation Shield', stadium: 'The Coast Slope' },
    { id: 'club_43', name: 'Apex Aviators', moniker: 'Apex', philosophy: 'Gegenpressing', tier: 3, leagueId: 'foundation', leagueName: 'Foundation Shield', stadium: 'The Lower Airfield' },
    { id: 'club_44', name: 'Horizon Trackers', moniker: 'Horizon', philosophy: 'Route One Direct', tier: 3, leagueId: 'foundation', leagueName: 'Foundation Shield', stadium: 'The Open Savannah' },
    { id: 'club_45', name: 'Sentinel Boundary', moniker: 'Sentinel', philosophy: 'Low Block Defense', tier: 3, leagueId: 'foundation', leagueName: 'Foundation Shield', stadium: 'The Border Tower' },
    { id: 'club_46', name: 'Shadow Whispers', moniker: 'Shadow', philosophy: 'Counter-Attack Press', tier: 3, leagueId: 'foundation', leagueName: 'Foundation Shield', stadium: 'The Dark Crypt' },
    { id: 'club_47', name: 'Silver Keepers', moniker: 'Silver', philosophy: 'Low Block Defense', tier: 3, leagueId: 'foundation', leagueName: 'Foundation Shield', stadium: 'The Guard Sanctuary' },
    { id: 'club_48', name: 'Ignis Boilers', moniker: 'Ignis', philosophy: 'Counter-Attack Press', tier: 3, leagueId: 'foundation', leagueName: 'Foundation Shield', stadium: 'The Coal Cellar' },
    { id: 'club_49', name: 'Aegis Stone-Masons', moniker: 'Aegis', philosophy: 'Low Block Defense', tier: 3, leagueId: 'foundation', leagueName: 'Foundation Shield', stadium: 'The Mason Yard' },
    { id: 'club_50', name: 'Phoenix Ballistics', moniker: 'Phoenix', philosophy: 'Route One Direct', tier: 3, leagueId: 'foundation', leagueName: 'Foundation Shield', stadium: 'The Rocket Range' },
    { id: 'club_51', name: 'Vanguard Reserves', moniker: 'Vanguard', philosophy: 'Gegenpressing', tier: 3, leagueId: 'foundation', leagueName: 'Foundation Shield', stadium: 'The Barracks Glacis' },
    { id: 'club_52', name: 'Glacier Ice-Diggers', moniker: 'Glacier', philosophy: 'Low Block Defense', tier: 3, leagueId: 'foundation', leagueName: 'Foundation Shield', stadium: 'The Frozen Trench' },
    { id: 'club_53', name: 'Void Pitches', moniker: 'Void', philosophy: 'Counter-Attack Press', tier: 3, leagueId: 'foundation', leagueName: 'Foundation Shield', stadium: 'The Coal Pit' },
    { id: 'club_54', name: 'Valhalla Clans', moniker: 'Valhalla', philosophy: 'Route One Direct', tier: 3, leagueId: 'foundation', leagueName: 'Foundation Shield', stadium: 'The Meadow Hall' },
    { id: 'club_55', name: 'Oceanus Fishermen', moniker: 'Oceanus', philosophy: 'Wing Attack & Cross', tier: 3, leagueId: 'foundation', leagueName: 'Foundation Shield', stadium: 'The Floating Pier' },
    { id: 'club_56', name: 'Wildwood Druids', moniker: 'Wildwood', philosophy: 'Gegenpressing', tier: 3, leagueId: 'foundation', leagueName: 'Foundation Shield', stadium: 'The Hollow Oak' },
    { id: 'club_57', name: 'Titan Piston FC', moniker: 'Titan', philosophy: 'Route One Direct', tier: 3, leagueId: 'foundation', leagueName: 'Foundation Shield', stadium: 'The Scrap Heap' },
    { id: 'club_58', name: 'Aero Flyers', moniker: 'Aero', philosophy: 'Wing Attack & Cross', tier: 3, leagueId: 'foundation', leagueName: 'Foundation Shield', stadium: 'The Low Runways' },
    { id: 'club_59', name: 'Crystalline Glass-Weavers', moniker: 'Crystalline', philosophy: 'Possession Control', tier: 3, leagueId: 'foundation', leagueName: 'Foundation Shield', stadium: 'The Kiln Sanctuary' },
    { id: 'club_60', name: 'Bramble Thickets', moniker: 'Bramble', philosophy: 'Counter-Attack Press', tier: 3, leagueId: 'foundation', leagueName: 'Foundation Shield', stadium: 'The Briar Glade' }
];

function getDeterministicNameFromSeed(prng) {
    const fn = FIRST_NAMES[Math.floor(prng() * FIRST_NAMES.length)];
    const ln = LAST_NAMES[Math.floor(prng() * LAST_NAMES.length)];
    return `${fn} ${ln}`;
}

const BLUEPRINT = [];

HANDCRAFTED_CLUBS.forEach((club, index) => {
    const managerName = getDeterministicNameFromSeed(loreRandom);
    const staff1Name = getDeterministicNameFromSeed(loreRandom);
    const staff2Name = getDeterministicNameFromSeed(loreRandom);

    // Assign Star Player and Position
    const starId = `p_${index * 20 + 1}`;
    const starName = getDeterministicNameFromSeed(random); // matching original random order
    
    // Skip 19 random steps so we preserve the random numbers consumed in Pass 1 generator!
    // This is vital to keep names/stats of other players deterministic!
    for (let skip = 0; skip < 19; skip++) {
        // Skip first name, last name, and other random factors
        random(); // first name
        random(); // last name
        random(); // rarity randVal
        random(); // isStar trait rand
        random(); // rarity secondary star randVal
        random(); // secondary star trait rand
        random(); // work rate rand
        random(); // stamina rand
        random(); // aggression rand
        random(); // bio nick
        random(); // bio event
    }

    const starPos = 'FW'; // Star FW
    const starRarity = club.tier === 1 ? 'LEGEND' : club.tier === 2 ? 'ELITE' : 'RARE';

    BLUEPRINT.push({
        id: club.id,
        name: club.name,
        moniker: club.moniker,
        leagueId: club.leagueId,
        leagueName: club.leagueName,
        tier: club.tier,
        position: index + 1, // Will sort below
        motto: MOTTO_TEMPLATES[Math.floor(loreRandom() * MOTTO_TEMPLATES.length)],
        philosophy: club.philosophy,
        focusAttribute: PHILOSOPHIES[club.philosophy].focus,
        strengths: PHILOSOPHIES[club.philosophy].strengths,
        weaknesses: PHILOSOPHIES[club.philosophy].weaknesses,
        stadium: club.stadium,
        primaryColor: getThemeColors(club.tier, index).primary,
        secondaryColor: getThemeColors(club.tier, index).secondary,
        managerName,
        staff: [
            { name: staff1Name, role: 'Technical Director' },
            { name: staff2Name, role: 'Chief Tactical Analyst' }
        ],
        starPlayer: { id: starId, name: starName, rarity: starRarity, position: starPos }
    });
});

// Set rivals in the same division
BLUEPRINT.forEach((club, idx) => {
    const divisionClubs = BLUEPRINT.filter(c => c.leagueId === club.leagueId && c.id !== club.id);
    const rival = divisionClubs[(idx * 7) % divisionClubs.length];
    club.rivalStar = {
        id: rival.starPlayer.id,
        name: rival.starPlayer.name,
        clubName: rival.name
    };
});

// Ensure directory exists
const targetPath = path.join(process.cwd(), 'src', 'data', 'league_blueprint.json');
const targetDir = path.dirname(targetPath);
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

fs.writeFileSync(targetPath, JSON.stringify(BLUEPRINT, null, 4));
console.log('✅ Generated src/data/league_blueprint.json');
