import React from 'react';
import './Card.css';

const Card = ({ data, isFlipped = false, onClick, size = 'normal', className = '', highlightAttribute }) => {
    const { name, position, rating, stats, rarity, image } = data;

    // Calculate stat polygon points (normalized 0-100 to polygon coordinates)
    const getPolyPoints = () => {
        const center = 50;
        const radius = 40;
        const statsList = [stats.ATT, stats.MID, stats.DEF, stats.GK]; // Top, Right, Bottom, Left

        const points = statsList.map((val, i) => {
            const angle = (i * 90 - 90) * (Math.PI / 180);
            const r = (val / 100) * radius;
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            return `${x},${y}`;
        });

        return points.join(' ');
    };

    return (
        <div
            className={`card-container ${size} ${className}`}
            onClick={onClick}
        >
            <div className={`card-inner ${isFlipped ? 'flipped' : ''}`}>
                {/* Card Back */}
                <div className="card-back">
                    <div className="card-pattern"></div>
                    <div className="card-logo">PC</div>
                </div>

                {/* Card Front */}
                <div className={`card-front rarity-${rarity.toLowerCase()}`}>
                    <div className="card-header">
                        <div className="card-rating">
                            {highlightAttribute && stats[highlightAttribute] !== undefined ? stats[highlightAttribute] : rating}
                        </div>
                        <div className="card-position">{position}</div>
                    </div>

                    <div className="card-image-container">
                        {/* Placeholder for player image */}
                        <div className="player-silhouette"></div>
                    </div>

                    <div className="card-name">{name}</div>

                    <div className="card-stats-viz">
                        <svg viewBox="0 0 100 100" className="stat-radar">
                            {/* Background Grid */}
                            <polygon points="50,10 90,50 50,90 10,50" className="radar-grid" />
                            <polygon points="50,30 70,50 50,70 30,50" className="radar-grid-inner" />
                            {/* Stat Shape */}
                            <polygon points={getPolyPoints()} className="radar-shape" />
                        </svg>

                        <div className="stat-labels">
                            <span className="stat-label top">ATT</span>
                            <span className="stat-label right">MID</span>
                            <span className="stat-label bottom">DEF</span>
                            <span className="stat-label left">GK</span>
                        </div>
                    </div>

                    <div className="card-stats-text">
                        <div className="stat-row">
                            <span className={highlightAttribute === 'ATT' ? 'highlighted-stat' : ''}>ATT {stats.ATT}</span>
                            <span className={highlightAttribute === 'MID' ? 'highlighted-stat' : ''}>MID {stats.MID}</span>
                        </div>
                        <div className="stat-row">
                            <span className={highlightAttribute === 'DEF' ? 'highlighted-stat' : ''}>DEF {stats.DEF}</span>
                            <span className={highlightAttribute === 'GK' ? 'highlighted-stat' : ''}>GK {stats.GK}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Card;
