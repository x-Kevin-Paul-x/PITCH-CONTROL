import React, { createContext, useContext, useState } from 'react';
import { generatePack } from '../utils/cardGenerator';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const [phase, setPhase] = useState('MENU'); // MENU, PACK_OPENING, DRAFT, SQUAD_BUILDING, MATCH, RESULT
    const [gameMode, setGameMode] = useState('STANDARD'); // STANDARD, TRI_SQUAD

    // Data
    const [collection, setCollection] = useState([]); // For Tri-Squad (15 cards)
    const [draftPool, setDraftPool] = useState([]); // For Standard (10 cards)

    // Squads
    const [triSquads, setTriSquads] = useState({
        set1: [],
        set2: [],
        set3: []
    });

    const [standardDeck, setStandardDeck] = useState([]);

    const startGame = (mode) => {
        setGameMode(mode);
        if (mode === 'TRI_SQUAD') {
            // Generate 15 cards
            const pack = generatePack(15);
            setCollection(pack);
            setPhase('PACK_OPENING');
        } else {
            // Standard: Generate 10 cards for draft
            const pack = generatePack(10);
            setDraftPool(pack);
            setPhase('DRAFT'); // Skip pack opening for now in Standard or add it later
        }
    };

    const assignToSquad = (card, squadIndex) => {
        // Check if squad is full (max 5)
        const targetSquadKey = `set${squadIndex}`;
        if (triSquads[targetSquadKey].length >= 5) return;

        // Check if card is already in another squad
        const currentSquadKey = Object.keys(triSquads).find(key =>
            triSquads[key].some(c => c.id === card.id)
        );

        setTriSquads(prev => {
            const newState = { ...prev };

            // Remove from current squad if exists
            if (currentSquadKey) {
                newState[currentSquadKey] = newState[currentSquadKey].filter(c => c.id !== card.id);
            }

            // Add to new squad
            newState[targetSquadKey] = [...newState[targetSquadKey], card];
            return newState;
        });
    };

    const removeFromSquad = (card) => {
        setTriSquads(prev => {
            const newState = { ...prev };
            Object.keys(newState).forEach(key => {
                newState[key] = newState[key].filter(c => c.id !== card.id);
            });
            return newState;
        });
    };

    const isSquadsReady = () => {
        return triSquads.set1.length === 5 && triSquads.set2.length === 5 && triSquads.set3.length === 5;
    };

    return (
        <GameContext.Provider value={{
            phase, setPhase,
            gameMode, setGameMode,
            collection,
            draftPool,
            triSquads, setTriSquads,
            assignToSquad,
            removeFromSquad,
            isSquadsReady,
            startGame
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGameState = () => useContext(GameContext);
