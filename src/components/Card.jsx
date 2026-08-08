import React, { useRef, useState } from 'react';
import CardInspectModal from './CardInspectModal';
import { CLUBS } from '../utils/cardsDatabase';
import ClubBadge from './ClubBadge';
import './Card.css';

// Suit icons mapping for position roles
const SUIT_ICONS = {
    FW: '⚔️', // Swords of Attack (Soccer Striker)
    MF: '⚜️', // Crown / Fleur-de-lis of Midfield (Soccer Playmaker)
    DF: '🛡️', // Shield / Cross of Defense (Soccer Defender)
    GK: '🧤'  // Diamond Gloves of Goal (Soccer Goalkeeper)
};

// Knight soccer portrait mapping (positional fallbacks)
const KNIGHT_IMAGES = {
    FW: '/images/knight_striker.jpg',
    MF: '/images/knight_midfielder.jpg',
    DF: '/images/knight_defender.jpg',
    GK: '/images/knight_goalkeeper.jpg'
};

const Card = ({ data, isFlipped = false, onClick, size = 'normal', className = '', highlightAttribute }) => {
    const { name, position, rating, stats, rarity, trait, clubId } = data;
    const cardRef = useRef(null);
    const [showInspect, setShowInspect] = useState(false);

    // Resolve club details
    const club = CLUBS.find(c => c.id === clubId);

    // Dynamic 3D tilt effect on hover
    const handleMouseMove = (e) => {
        if (!isFlipped || size === 'small') return;
        const card = cardRef.current;
        if (!card) return;
        
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const w = rect.width;
        const h = rect.height;

        const rotateX = ((y / h) - 0.5) * -18;
        const rotateY = ((x / w) - 0.5) * 18;

        const shineX = (x / w) * 100;
        const shineY = (y / h) * 100;

        card.style.setProperty('--rotate-x', `${rotateX}deg`);
        card.style.setProperty('--rotate-y', `${rotateY}deg`);
        card.style.setProperty('--shine-x', `${shineX}%`);
        card.style.setProperty('--shine-y', `${shineY}%`);
    };

    const handleMouseLeave = () => {
        const card = cardRef.current;
        if (!card) return;
        card.style.setProperty('--rotate-x', '0deg');
        card.style.setProperty('--rotate-y', '0deg');
        card.style.setProperty('--shine-x', '50%');
        card.style.setProperty('--shine-y', '50%');
    };

    const suitIcon = SUIT_ICONS[position] || '⚔️';
    // Use player's own image if set; fall back to position-based default
    const knightImg = (data && data.image) || KNIGHT_IMAGES[position] || '/images/knight_striker.jpg';

    const handleInspectClick = (e) => {
        e.stopPropagation();
        setShowInspect(true);
    };

    return (
        <>
            <div
                ref={cardRef}
                className={`card-container ${size} ${className}`}
                onClick={onClick}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <div className={`card-inner ${isFlipped ? 'flipped' : ''}`}>
                    {/* Medieval Card Back */}
                    <div className="card-back heraldic-back">
                        <div className="card-back-frame">
                            <img src="/images/card_back_heraldic.jpg" alt="Heraldic Card Back" className="card-back-image" />
                            <div className="card-back-logo text-gradient-gold">PITCH CONTROL</div>
                        </div>
                    </div>

                    {/* Full-Art Medieval Soccer Playing Card Front */}
                    <div className={`card-front full-art-front rarity-${rarity.toLowerCase()}`}>
                        {/* Background Knight Image covering the card */}
                        <div className="card-full-art-bg">
                            <img src={knightImg} alt={name} className="full-art-img" />
                            <div className="full-art-overlay-gradient"></div>
                        </div>

                        {/* Foil Holographic Sheen */}
                        <div className="card-shine"></div>

                        {/* Filigree Outer Border Frame */}
                        <div className="filigree-border"></div>

                        {/* Top Header Layer: Rating + Position Badge & Club Seal */}
                        <div className="card-top-layer">
                            <div className="card-primary-badge">
                                <span className="badge-rating">{highlightAttribute && stats[highlightAttribute] !== undefined ? stats[highlightAttribute] : rating}</span>
                                <span className="badge-suit">{suitIcon}</span>
                                <span className="badge-pos">{position}</span>
                            </div>
                            {club && (
                                <div className="card-club-seal">
                                    <ClubBadge club={club} size="tiny" />
                                </div>
                            )}
                        </div>

                        {/* Bottom Info Layer: Name Banner, Trait & Stats */}
                        <div className="card-bottom-layer">
                            {/* Passive Trait Badge */}
                            {trait && (
                                <div className="card-trait-seal" title={trait.desc}>
                                    <span className="trait-icon">⚡</span>
                                    <span className="trait-text">{trait.name}</span>
                                </div>
                            )}

                            {/* Player Name Banner */}
                            <div className="card-name-scroll">
                                <span className="player-name-text">{name}</span>
                            </div>

                            {/* Medieval Stat Grid */}
                            <div className="card-stats-medieval">
                                <div className={`stat-box ${highlightAttribute === 'ATT' ? 'active-stat' : ''}`}>
                                    <span className="stat-key">ATT</span>
                                    <span className="stat-val">{stats.ATT}</span>
                                </div>
                                <div className={`stat-box ${highlightAttribute === 'MID' ? 'active-stat' : ''}`}>
                                    <span className="stat-key">MID</span>
                                    <span className="stat-val">{stats.MID}</span>
                                </div>
                                <div className={`stat-box ${highlightAttribute === 'DEF' ? 'active-stat' : ''}`}>
                                    <span className="stat-key">DEF</span>
                                    <span className="stat-val">{stats.DEF}</span>
                                </div>
                                <div className={`stat-box ${highlightAttribute === 'GK' ? 'active-stat' : ''}`}>
                                    <span className="stat-key">GK</span>
                                    <span className="stat-val">{stats.GK}</span>
                                </div>
                            </div>
                        </div>

                        {/* Card Inspect Trigger */}
                        {isFlipped && (
                            <button 
                                className="card-inspect-trigger" 
                                onClick={handleInspectClick}
                                title="Inspect Champion Lore"
                            >
                                📜
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {showInspect && (
                <CardInspectModal card={data} onClose={() => setShowInspect(false)} />
            )}
        </>
    );
};

export default Card;
