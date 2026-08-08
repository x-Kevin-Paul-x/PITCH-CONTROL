import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Card from './Card';
import { CLUBS, PLAYERS } from '../utils/cardsDatabase';
import ClubBadge from './ClubBadge';
import './CardInspectModal.css';

const CardInspectModal = ({ card: initialCard, onClose, onPlayerClick }) => {
    const [activeCard, setActiveCard] = useState(initialCard);

    useEffect(() => {
        setActiveCard(initialCard);
    }, [initialCard]);

    if (!activeCard) return null;

    const club = CLUBS.find(c => c.id === activeCard.clubId);

    const parseBiography = (text) => {
        if (!text) return '';
        
        // Regex to match [[p_ID|Player Name]] or [[leg_ID|Player Name]] or [[ign_ID|Player Name]]
        const regex = /\[\[([a-zA-Z0-9_]+)\|([^\]]+)\]\]/g;
        const parts = [];
        let lastIndex = 0;
        let match;
        
        while ((match = regex.exec(text)) !== null) {
            const matchIndex = match.index;
            const playerId = match[1];
            const playerName = match[2];
            
            if (matchIndex > lastIndex) {
                parts.push(text.substring(lastIndex, matchIndex));
            }
            
            parts.push(
                <span 
                    key={matchIndex} 
                    className="lore-player-link" 
                    onClick={(e) => {
                        e.stopPropagation();
                        const foundPlayer = PLAYERS.find(p => p.id === playerId);
                        if (foundPlayer) {
                            setActiveCard(foundPlayer);
                            if (onPlayerClick) {
                                onPlayerClick(foundPlayer);
                            }
                        }
                    }}
                >
                    {playerName}
                </span>
            );
            
            lastIndex = regex.lastIndex;
        }
        
        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }
        
        return parts.length > 0 ? parts : text;
    };

    // Close on ESC key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const themeStyle = {
        '--club-primary': club ? club.primaryColor : 'hsl(220, 80%, 35%)',
        '--club-secondary': club ? club.secondaryColor : 'hsl(45, 100%, 60%)'
    };

    const suitIcon = activeCard.position === 'FW' ? '⚔️' : activeCard.position === 'MF' ? '⚜️' : activeCard.position === 'DF' ? '🛡️' : '🧤';
    const posFullTitle = activeCard.position === 'FW' ? 'Forward / Striker' : activeCard.position === 'MF' ? 'Midfielder / Playmaker' : activeCard.position === 'DF' ? 'Defender / Fortress' : 'Goalkeeper / Warden';

    // Helper to render circular spec gauge SVG
    const renderGauge = (value, label, max = 100) => {
        const radius = 24;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (value / max) * circumference;

        return (
            <div className="spec-gauge-wrapper">
                <svg width="64" height="64" className="spec-svg-gauge">
                    <circle cx="32" cy="32" r={radius} className="gauge-bg" />
                    <circle 
                        cx="32" 
                        cy="32" 
                        r={radius} 
                        className="gauge-fill" 
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                    />
                </svg>
                <div className="gauge-value">{value}</div>
                <div className="gauge-label">{label}</div>
            </div>
        );
    };

    const modalContent = (
        <div className="inspect-overlay" onClick={onClose} style={themeStyle}>
            <div className="inspect-modal-body glass-panel" onClick={(e) => e.stopPropagation()}>
                {/* Royal Heraldic Header Bar */}
                <div className="inspect-modal-top-bar">
                    <div className="heraldic-seal-badge">
                        <span className="seal-icon">📜</span>
                        <span className="seal-text">SOVEREIGN CODEX INSPECTION</span>
                    </div>
                    <button className="inspect-close-btn" onClick={onClose} title="Close Inspection">×</button>
                </div>

                <div className="inspect-grid">
                    {/* Left Column: Interactive Playing Card Display */}
                    <div className="inspect-left-col">
                        <div className="inspect-card-scaler">
                            <Card data={activeCard} isFlipped={true} size="normal" />
                        </div>

                        {/* Player Hero Badges */}
                        <div className="inspect-hero-pill-group">
                            <span className={`hero-pill rarity-${activeCard.rarity.toLowerCase()}`}>
                                {activeCard.rarity} CHAMPION
                            </span>
                            <span className="hero-pill pos-pill">
                                {suitIcon} {activeCard.position}
                            </span>
                            <span className="hero-pill ovr-pill">
                                OVR {activeCard.rating}
                            </span>
                        </div>

                        {activeCard.rarity === 'LEGEND' && <div className="legend-aura-effect"></div>}
                    </div>

                    {/* Right Column: Expansive Lore, House Philosophy & Stats */}
                    <div className="inspect-right-col">
                        {/* Player Enshrining Banner */}
                        <div className="inspect-player-header">
                            <div className="player-title-row">
                                <h1 className="inspect-player-name text-gradient-gold">{activeCard.name}</h1>
                            </div>
                            <div className="player-sub-title">
                                <span className="pos-full-name">{posFullTitle}</span>
                                <span className="dot">•</span>
                                <span className="club-full-name">{club ? club.name : 'Unassigned Faction'}</span>
                            </div>
                        </div>

                        {/* House Crest Header */}
                        {club && (
                            <div className="inspect-club-banner glass-card">
                                <div className="club-badge-wrapper">
                                    <ClubBadge club={club} size="medium" />
                                </div>
                                <div className="club-info-block">
                                    <div className="club-name-row">
                                        <span className="club-name-text">{club.name}</span>
                                        <span className="league-badge">{club.league}</span>
                                    </div>
                                    <p className="club-motto-quote">"{club.motto}"</p>
                                </div>
                            </div>
                        )}

                        {/* Section 1: Player Biography */}
                        <div className="inspect-section">
                            <div className="section-header-title">
                                <span className="header-icon">🖋️</span>
                                <h3>KNIGHT BIOGRAPHY & LORE</h3>
                            </div>
                            <div className="lore-text-box glass-card">
                                <p className="lore-text-content">{parseBiography(activeCard.lore)}</p>
                            </div>
                        </div>

                        {/* Section 2: Martial Stat Matrix */}
                        <div className="inspect-section">
                            <div className="section-header-title">
                                <span className="header-icon">⚔️</span>
                                <h3>TACTICAL ATTRIBUTE MATRIX</h3>
                            </div>
                            <div className="stat-matrix-grid">
                                <div className="matrix-card stat-att">
                                    <span className="matrix-icon">⚔️</span>
                                    <span className="matrix-name">ATTACK</span>
                                    <span className="matrix-val">{activeCard.stats.ATT}</span>
                                </div>
                                <div className="matrix-card stat-mid">
                                    <span className="matrix-icon">⚜️</span>
                                    <span className="matrix-name">MIDFIELD</span>
                                    <span className="matrix-val">{activeCard.stats.MID}</span>
                                </div>
                                <div className="matrix-card stat-def">
                                    <span className="matrix-icon">🛡️</span>
                                    <span className="matrix-name">DEFENSE</span>
                                    <span className="matrix-val">{activeCard.stats.DEF}</span>
                                </div>
                                <div className="matrix-card stat-gk">
                                    <span className="matrix-icon">🧤</span>
                                    <span className="matrix-name">GOALKEEPING</span>
                                    <span className="matrix-val">{activeCard.stats.GK}</span>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Active Trait Skill */}
                        {activeCard.trait && (
                            <div className="inspect-section">
                                <div className="section-header-title">
                                    <span className="header-icon">⚡</span>
                                    <h3>SOVEREIGN PASSIVE TRAIT</h3>
                                </div>
                                <div className="trait-card-detail glass-card">
                                    <span className="trait-badge-icon">⚡</span>
                                    <div className="trait-info-text">
                                        <div className="trait-name-bold">{activeCard.trait.name}</div>
                                        <div className="trait-desc-text">{activeCard.trait.desc}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section 4: Physical & Mental Profile Gauges */}
                        <div className="inspect-section">
                            <div className="section-header-title">
                                <span className="header-icon">📊</span>
                                <h3>PHYSICAL & MENTAL PROFILE</h3>
                            </div>
                            <div className="spec-gauges-row glass-card">
                                {renderGauge(activeCard.stamina, 'Stamina')}
                                {renderGauge(activeCard.aggression, 'Aggression')}
                                <div className="work-rate-gauge">
                                    <div className="work-rate-display">
                                        <span className={`wr-bar wr-${(activeCard.workRate || 'High').toLowerCase()}`}></span>
                                        <span className="wr-val">{activeCard.workRate || 'High'}</span>
                                    </div>
                                    <div className="gauge-label">Work Rate</div>
                                </div>
                            </div>
                        </div>

                        {/* Section 5: House Tactical Philosophy */}
                        {club && (
                            <div className="inspect-section">
                                <div className="section-header-title">
                                    <span className="header-icon">🏰</span>
                                    <h3>HOUSE TACTICAL PHILOSOPHY</h3>
                                </div>
                                <div className="philosophy-card glass-card">
                                    <div className="philosophy-title-row">
                                        <span className="philosophy-title">{club.philosophy}</span>
                                        <span className="attr-highlight">Focus: {club.focusAttribute}</span>
                                    </div>
                                    <div className="philosophy-details">
                                        <div className="detail-item"><strong className="text-green">Strengths:</strong> {club.strengths}</div>
                                        <div className="detail-item"><strong className="text-red">Weaknesses:</strong> {club.weaknesses}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default CardInspectModal;
