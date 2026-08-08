import React from 'react';
import './ClubBadge.css';

const ClubBadge = ({ club, size = 'medium', className = '' }) => {
    if (!club) return null;

    const { primaryColor, secondaryColor, philosophy, name } = club;

    // Define unique SVG paths/elements for each philosophy
    const renderPhilosophyGraphic = () => {
        const primary = primaryColor || 'hsl(210, 80%, 40%)';
        const secondary = secondaryColor || 'hsl(45, 100%, 50%)';

        switch (philosophy) {
            case 'Low Block Defense':
                // Shield + Towers
                return (
                    <g>
                        {/* Shield base */}
                        <path 
                            d="M12 2 L20 5 V11 C20 16 17 20 12 22 C7 20 4 16 4 11 V5 Z" 
                            fill={primary} 
                            stroke={secondary} 
                            strokeWidth="1.5"
                        />
                        {/* Fortress Towers inside */}
                        <path 
                            d="M8 9 H10 V14 H8 Z M11 7 H13 V14 H11 Z M14 9 H16 V14 H14 Z" 
                            fill="rgba(255,255,255,0.85)"
                        />
                        {/* Shield border line */}
                        <path 
                            d="M12 4 L18 6.5 V10.5 C18 14.5 15.5 18 12 19.5 C8.5 18 6 14.5 6 10.5 V6.5 Z" 
                            fill="none" 
                            stroke="rgba(255,255,255,0.3)" 
                            strokeWidth="1"
                        />
                    </g>
                );

            case 'Gegenpressing':
                // Honeycomb Nodes / Network
                return (
                    <g>
                        {/* Outer hexagon */}
                        <polygon 
                            points="12,2 21,7 21,17 12,22 3,17 3,7" 
                            fill={primary} 
                            stroke={secondary} 
                            strokeWidth="1.5"
                        />
                        {/* Interconnecting neural lines */}
                        <line x1="12" y1="2" x2="12" y2="22" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                        <line x1="3" y1="7" x2="21" y2="17" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                        <line x1="3" y1="17" x2="21" y2="7" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                        
                        {/* Central swarm nodes */}
                        <circle cx="12" cy="7" r="2" fill={secondary} />
                        <circle cx="12" cy="17" r="2" fill={secondary} />
                        <circle cx="7.5" cy="9.5" r="2.5" fill="#fff" />
                        <circle cx="16.5" cy="9.5" r="2.5" fill="#fff" />
                        <circle cx="7.5" cy="14.5" r="2.5" fill="#fff" />
                        <circle cx="16.5" cy="14.5" r="2.5" fill="#fff" />
                        <circle cx="12" cy="12" r="3.5" fill={secondary} stroke="#fff" strokeWidth="1" />
                    </g>
                );

            case 'Possession Control':
                // Concentric circles + Geometric compass/star
                return (
                    <g>
                        {/* Outer circular badge */}
                        <circle cx="12" cy="12" r="10" fill={primary} stroke={secondary} strokeWidth="1.5" />
                        {/* Orbit rings */}
                        <circle cx="12" cy="12" r="7" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="2,2" />
                        <circle cx="12" cy="12" r="4.5" fill="none" stroke={secondary} strokeWidth="0.8" />
                        
                        {/* Center compass points */}
                        <polygon points="12,5 13.5,10.5 19,12 13.5,13.5 12,19 10.5,13.5 5,12 10.5,10.5" fill="#fff" />
                        <circle cx="12" cy="12" r="1.5" fill={primary} />
                    </g>
                );

            case 'Wing Attack & Cross':
                // Dynamic Wings + Center Ball
                return (
                    <g>
                        {/* Wings backdrop shield */}
                        <path 
                            d="M12 2 C16 2 20 6 20 12 C20 18 16 22 12 22 C8 22 4 18 4 12 C4 6 8 2 12 2 Z" 
                            fill={primary} 
                            stroke={secondary} 
                            strokeWidth="1.5"
                        />
                        {/* Left Wing */}
                        <path 
                            d="M5 8 C7 8 9 10 9 13 C9 15 7 17 5 15 C4.5 14.5 4 12 5 8 Z" 
                            fill="rgba(255,255,255,0.8)" 
                            stroke={secondary}
                            strokeWidth="0.5"
                        />
                        {/* Right Wing */}
                        <path 
                            d="M19 8 C17 8 15 10 15 13 C15 15 17 17 19 15 C19.5 14.5 20 12 19 8 Z" 
                            fill="rgba(255,255,255,0.8)" 
                            stroke={secondary}
                            strokeWidth="0.5"
                        />
                        {/* Rising center soccer ball */}
                        <circle cx="12" cy="12" r="3.5" fill={secondary} stroke="#fff" strokeWidth="1" />
                        <path d="M12 8.5 V15.5 M8.5 12 H15.5" stroke="rgba(0,0,0,0.4)" strokeWidth="0.8" />
                    </g>
                );

            case 'Route One Direct':
                // Spearhead + Lightning Bolt
                return (
                    <g>
                        {/* Diamond base */}
                        <polygon 
                            points="12,2 21,12 12,22 3,12" 
                            fill={primary} 
                            stroke={secondary} 
                            strokeWidth="1.5"
                        />
                        {/* Vertical Spear */}
                        <line x1="12" y1="4" x2="12" y2="20" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                        
                        {/* Sharp glowing lightning bolt */}
                        <polygon 
                            points="13,5 7,13 11.5,13 10.5,19 17,11 12.5,11" 
                            fill={secondary} 
                            stroke="#fff" 
                            strokeWidth="0.8"
                        />
                    </g>
                );

            case 'Counter-Attack Press':
                // Hexagon + Gears
                return (
                    <g>
                        {/* Shield border */}
                        <path 
                            d="M12 2 L21 6 V16 L12 22 L3 16 V6 Z" 
                            fill={primary} 
                            stroke={secondary} 
                            strokeWidth="1.5"
                        />
                        {/* Industrial Cogwheel representation */}
                        <circle cx="12" cy="12" r="5" fill="none" stroke="#fff" strokeWidth="1.5" strokeDasharray="3,1" />
                        <circle cx="12" cy="12" r="3.5" fill={secondary} />
                        <circle cx="12" cy="12" r="1.5" fill={primary} />
                        {/* Arrow snapping outwards */}
                        <path d="M12 7 L14 9 H10 Z" fill="#fff" />
                    </g>
                );

            default:
                // Default classic stripe crest
                return (
                    <g>
                        <path 
                            d="M12 2 L20 5 V11 C20 16 17 20 12 22 C7 20 4 16 4 11 V5 Z" 
                            fill={primary} 
                            stroke={secondary} 
                            strokeWidth="1.5"
                        />
                        <path d="M7 6 L17 18" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
                        <path d="M17 6 L7 18" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
                        <circle cx="12" cy="12" r="2.5" fill="#fff" />
                    </g>
                );
        }
    };

    return (
        <div 
            className={`club-badge-container badge-size-${size} ${className}`}
            title={`${name} (${philosophy})`}
        >
            <svg 
                viewBox="0 0 24 24" 
                className="club-badge-svg"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <filter id="badge-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="1" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>
                {renderPhilosophyGraphic()}
            </svg>
        </div>
    );
};

export default ClubBadge;
