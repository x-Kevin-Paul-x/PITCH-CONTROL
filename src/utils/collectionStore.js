// Collection Store for Pitch Control Binder & Album Tracking
const COLLECTION_STORAGE_KEY = 'pitch_control_unlocked_cards';

export const getUnlockedCardIds = () => {
    try {
        const saved = localStorage.getItem(COLLECTION_STORAGE_KEY);
        if (!saved) return [];
        return JSON.parse(saved);
    } catch (e) {
        console.error("Failed to load collection", e);
        return [];
    }
};

export const unlockCardsInCollection = (cardList) => {
    try {
        const current = getUnlockedCardIds();
        const currentSet = new Set(current);
        cardList.forEach(card => {
            if (card && card.id) {
                currentSet.add(card.id);
            }
        });
        const updated = Array.from(currentSet);
        localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(updated));
        return updated;
    } catch (e) {
        console.error("Failed to save unlocked cards", e);
        return [];
    }
};

export const isCardUnlocked = (cardId) => {
    const current = getUnlockedCardIds();
    return current.includes(cardId);
};
