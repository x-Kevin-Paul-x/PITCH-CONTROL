import { PLAYERS, CLUBS } from './cardsDatabase';

export const TRAITS = [
    { id: 'Poacher', name: 'Poacher', desc: '+20 ATT if opponent plays a GK card' },
    { id: 'Captain', name: 'Captain', desc: '+10 to all stats if played in Round 5' },
    { id: 'Super Sub', name: 'Super Sub', desc: '+15 to active stat if drawn from bench' },
    { id: 'Enforcer', name: 'Enforcer', desc: 'Win a DEF duel to halve opponent\'s next card stats' },
    { id: 'Playmaker', name: 'Playmaker', desc: 'Win a MID duel to choose next round\'s attribute' },
    { id: 'False Nine', name: 'False Nine', desc: 'Can use MID stat instead of ATT stat on Attack rolls' },
    { id: 'Wall', name: 'Wall', desc: 'Wins all ties on DEF rolls' }
];

// Instantiates a card from the deterministic database
export const generateCard = (id) => {
    const template = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
    return {
        ...template,
        id: `${template.id}_${id}_${Date.now()}` // Unique instance ID for draft/bench tracking
    };
};

// Generates a pack of unique cards from the database
export const generatePack = (count = 5) => {
    const shuffled = [...PLAYERS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map((player, idx) => ({
        ...player,
        id: `${player.id}_${idx}_${Date.now()}`
    }));
};
