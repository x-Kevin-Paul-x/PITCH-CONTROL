import React, { useState, useMemo } from 'react';
import { useGameState } from '../hooks/useGameState';
import { CLUBS, PLAYERS } from '../utils/cardsDatabase';
import CardInspectModal from './CardInspectModal';
import Card from './Card';
import ClubBadge from './ClubBadge';
import { sound } from '../utils/soundEngine';
import { getUnlockedCardIds } from '../utils/collectionStore';
import './LoreBinder.css';

const LoreBinder = () => {
    const { setPhase } = useGameState();
    const [activeTab, setActiveTab] = useState('HOUSES'); // CHRONICLE, HOUSES, COMPENDIUM, HALL_OF_FAME
    const [selectedLeague, setSelectedLeague] = useState('all'); // all, apex, challenger, foundation
    const [selectedClubId, setSelectedClubId] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    // Search and Filters for Compendium & Houses & Hall of Fame
    const [searchQuery, setSearchQuery] = useState('');
    const [posFilter, setPosFilter] = useState('ALL');
    const [rarityFilter, setRarityFilter] = useState('ALL');
    const [hallPosFilter, setHallPosFilter] = useState('ALL');
    const [chronicleChapter, setChronicleChapter] = useState('ch1'); // ch1, ch2, ch3, ch4, ch5

    // Unlocked Card IDs
    const unlockedIds = useMemo(() => getUnlockedCardIds(), []);

    const leagues = [
        { id: 'all', name: 'All Realms', desc: '5 Houses' },
        { id: 'apex', name: 'Apex Division', desc: 'Tier I Elite' },
        { id: 'challenger', name: 'Challenger League', desc: 'Tier II Contenders' }
    ];

    // Filter Clubs based on league and search query
    const filteredClubs = useMemo(() => {
        return CLUBS.filter(c => {
            const matchesLeague = selectedLeague === 'all' || c.leagueId === selectedLeague;
            const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  c.philosophy.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  c.motto.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesLeague && matchesSearch;
        }).sort((a, b) => a.position - b.position);
    }, [selectedLeague, searchQuery]);

    // Selected Club & Squad Roster
    const selectedClub = CLUBS.find(c => c.id === selectedClubId);
    const clubSquad = useMemo(() => {
        if (!selectedClub) return [];
        return PLAYERS.filter(p => p.clubId === selectedClub.id).sort((a, b) => {
            const posOrder = { FW: 1, MF: 2, DF: 3, GK: 4 };
            if (posOrder[a.position] !== posOrder[b.position]) {
                return posOrder[a.position] - posOrder[b.position];
            }
            return b.rating - a.rating;
        });
    }, [selectedClub]);

    // Master Compendium Card List with Filters
    const compendiumPlayers = useMemo(() => {
        return PLAYERS.filter(p => {
            const matchesPos = posFilter === 'ALL' || p.position === posFilter;
            const matchesRarity = rarityFilter === 'ALL' || p.rarity === rarityFilter;
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  p.position.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesPos && matchesRarity && matchesSearch;
        }).sort((a, b) => b.rating - a.rating);
    }, [posFilter, rarityFilter, searchQuery]);

    // Hall of Fame — all named Legend/Elite knight characters (leg_001 – leg_023)
    const LEGEND_IDS = [
        'leg_001', 'leg_002', 'leg_003', 'leg_004', 'leg_005', 'leg_006',
        'leg_007', 'leg_008', 'leg_009', 'leg_010', 'leg_011', 'leg_012',
        'leg_013', 'leg_014', 'leg_015', 'leg_016', 'leg_017', 'leg_018',
        'leg_019', 'leg_020', 'leg_021', 'leg_022', 'leg_023'
    ];

    const hallOfFameLegends = useMemo(() => {
        return PLAYERS.filter(p => {
            const isLegend = LEGEND_IDS.includes(p.id);
            const matchesPos = hallPosFilter === 'ALL' || p.position === hallPosFilter;
            return isLegend && matchesPos;
        }).sort((a, b) => b.rating - a.rating);
    }, [hallPosFilter]);

    const handleTabChange = (tab) => {
        sound.playCardFlip();
        setActiveTab(tab);
        setSelectedClubId(null);
    };

    return (
        <div className="lore-binder full-screen">
            {/* Background Atmosphere */}
            <div className="bg-castle-pitch"></div>

            <div className="binder-container glass-panel">
                {/* Royal Codex Header */}
                <div className="binder-header">
                    <button className="back-menu-btn" onClick={() => { sound.playWaxSealClick(); setPhase('MENU'); }}>
                        ← Main Menu
                    </button>

                    <div className="binder-title-group">
                        <h1 className="game-title text-gradient-gold">ROYAL LORE BINDER</h1>
                        <p className="binder-subtitle">Codex of Realms, Houses, Champions & Tactical Archives</p>
                    </div>

                    <div className="album-progress-badge" title="Unlocked Cards in Collection">
                        📜 Album: {unlockedIds.length} / {PLAYERS.length} Cards
                    </div>
                </div>

                {/* Primary Codex Navigation Tabs */}
                <div className="codex-nav-bar">
                    <button
                        className={`codex-nav-btn ${activeTab === 'HOUSES' ? 'active' : ''}`}
                        onClick={() => handleTabChange('HOUSES')}
                    >
                        🏰 Houses of the Realm
                    </button>
                    <button
                        className={`codex-nav-btn ${activeTab === 'COMPENDIUM' ? 'active' : ''}`}
                        onClick={() => handleTabChange('COMPENDIUM')}
                    >
                        🃏 Card Compendium
                    </button>
                    <button
                        className={`codex-nav-btn ${activeTab === 'HALL_OF_FAME' ? 'active' : ''}`}
                        onClick={() => handleTabChange('HALL_OF_FAME')}
                    >
                        👑 Hall of Fame
                    </button>
                    <button
                        className={`codex-nav-btn ${activeTab === 'CHRONICLE' ? 'active' : ''}`}
                        onClick={() => handleTabChange('CHRONICLE')}
                    >
                        📜 Realm Chronicle
                    </button>
                </div>

                {/* TAB I: HOUSES OF THE REALM */}
                {activeTab === 'HOUSES' && (
                    <div className="tab-view-container">
                        {!selectedClubId ? (
                            <div className="houses-directory-view">
                                {/* Search & League Tier Filter Header */}
                                <div className="directory-filter-bar">
                                    <input
                                        type="text"
                                        className="search-input-field"
                                        placeholder="🔍 Search House name, motto, or philosophy..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <div className="league-tier-buttons">
                                        {leagues.map(l => (
                                            <button
                                                key={l.id}
                                                className={`tier-filter-btn ${selectedLeague === l.id ? 'active' : ''}`}
                                                onClick={() => { sound.playWaxSealClick(); setSelectedLeague(l.id); }}
                                            >
                                                {l.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Houses Scroll Grid */}
                                <div className="houses-grid">
                                    {filteredClubs.map(club => {
                                        const clubTheme = {
                                            '--club-primary': club.primaryColor,
                                            '--club-secondary': club.secondaryColor
                                        };
                                        return (
                                            <div
                                                key={club.id}
                                                className="house-card-item"
                                                style={clubTheme}
                                                onClick={() => { sound.playWaxSealClick(); setSelectedClubId(club.id); }}
                                            >
                                                <ClubBadge club={club} size="small" className="house-crest" />
                                                <div className="house-info">
                                                    <span className="house-rank">RANK #{club.position} • {club.league}</span>
                                                    <h3 className="house-name">{club.name}</h3>
                                                    <p className="house-philosophy">{club.philosophy}</p>
                                                    <p className="house-motto">"{club.motto}"</p>
                                                </div>
                                                <span className="house-arrow">→</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            /* Illuminated House Book View */
                            <div className="house-book-view">
                                <button className="back-directory-btn btn-wax-seal" onClick={() => { sound.playWaxSealClick(); setSelectedClubId(null); }}>
                                    ← Back to House Directory
                                </button>

                                <div className="book-layout" style={{
                                    '--club-primary': selectedClub.primaryColor,
                                    '--club-secondary': selectedClub.secondaryColor
                                }}>
                                    {/* Left Page: History, Tactics & Staff */}
                                    <div className="book-page book-left-page">
                                        <div className="book-club-header">
                                            <ClubBadge club={selectedClub} size="medium" />
                                            <div className="book-club-title-group">
                                                <h2>{selectedClub.name}</h2>
                                                <p className="book-club-meta">{selectedClub.league} • Standings Rank #{selectedClub.position}</p>
                                            </div>
                                        </div>

                                        <p className="book-motto">"{selectedClub.motto}"</p>

                                        <div className="book-section">
                                            <h4>HOUSE CHRONICLE & LORE</h4>
                                            <p className="book-lore-text">{selectedClub.lore}</p>
                                        </div>

                                        <div className="book-section">
                                            <h4>TACTICAL BLUEPRINT</h4>
                                            <div className="book-tactics-box">
                                                <p><strong>Style:</strong> {selectedClub.philosophy}</p>
                                                <p><strong>Primary Focus:</strong> <span className="focus-badge">{selectedClub.focusAttribute}</span></p>
                                                <p><strong>Arena Grounds:</strong> {selectedClub.stadium}</p>
                                                <p><strong>Tactical Strengths:</strong> {selectedClub.strengths}</p>
                                                <p><strong>Vulnerabilities:</strong> {selectedClub.weaknesses}</p>
                                            </div>
                                        </div>

                                        {selectedClub.manager && (
                                            <div className="book-section">
                                                <h4>COMMANDER & STAFF LEADERSHIP</h4>
                                                <div className="book-staff-box">
                                                    <div className="staff-member">
                                                        <div className="staff-header" style={{ marginBottom: '8px' }}>
                                                            <span className="staff-role-badge manager-badge">Grandmaster Manager</span>
                                                            <span className="staff-name">{selectedClub.manager.name}</span>
                                                        </div>
                                                        <p className="staff-bio">{selectedClub.manager.bio}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Spine */}
                                    <div className="book-center-spine"></div>

                                    {/* Right Page: Knights Roster */}
                                    <div className="book-page book-right-page">
                                        <h3>HOUSE KNIGHTS ROSTER ({clubSquad.length} Champions)</h3>
                                        <p className="squad-helper-text">Click any champion to inspect their full attribute radar, traits, and bio.</p>

                                        <div className="book-squad-scroll-list">
                                            {clubSquad.map(player => (
                                                <div
                                                    key={player.id}
                                                    className={`roster-player-item rarity-${player.rarity.toLowerCase()}`}
                                                    onClick={() => { sound.playWaxSealClick(); setSelectedPlayer(player); }}
                                                >
                                                    <div className="player-rating-badge">{player.rating}</div>
                                                    <div className="player-meta-info">
                                                        <div className="player-name-text">{player.name}</div>
                                                        <div className="player-pos-rarity">
                                                            <span className="pos-badge">{player.position}</span>
                                                            <span className="rarity-badge">{player.rarity}</span>
                                                            {player.trait && <span className="trait-icon-indicator" title={player.trait.name}>⚡</span>}
                                                        </div>
                                                    </div>
                                                    <div className="player-card-stats-strip">
                                                        <span>AT <strong>{player.stats.ATT}</strong></span>
                                                        <span>MD <strong>{player.stats.MID}</strong></span>
                                                        <span>DF <strong>{player.stats.DEF}</strong></span>
                                                        <span>GK <strong>{player.stats.GK}</strong></span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB II: MASTER CARD COMPENDIUM */}
                {activeTab === 'COMPENDIUM' && (
                    <div className="tab-view-container compendium-view">
                        <div className="compendium-filter-bar">
                            <input
                                type="text"
                                className="search-input-field"
                                placeholder="🔍 Search champion name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />

                            <div className="filter-group">
                                <span className="filter-label">Role:</span>
                                {['ALL', 'FW', 'MF', 'DF', 'GK'].map(pos => (
                                    <button
                                        key={pos}
                                        className={`filter-btn ${posFilter === pos ? 'active' : ''}`}
                                        onClick={() => setPosFilter(pos)}
                                    >
                                        {pos === 'FW' ? '⚔️ FW' : pos === 'MF' ? '⚜️ MF' : pos === 'DF' ? '🛡️ DF' : pos === 'GK' ? '🧤 GK' : 'ALL'}
                                    </button>
                                ))}
                            </div>

                            <div className="filter-group">
                                <span className="filter-label">Rarity:</span>
                                {['ALL', 'COMMON', 'RARE', 'ELITE', 'LEGEND'].map(r => (
                                    <button
                                        key={r}
                                        className={`filter-btn ${rarityFilter === r ? 'active' : ''}`}
                                        onClick={() => setRarityFilter(r)}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="compendium-grid">
                            {compendiumPlayers.map(player => {
                                const isUnlocked = unlockedIds.includes(player.id);
                                return (
                                    <div
                                        key={player.id}
                                        className={`compendium-card-wrapper ${isUnlocked ? 'unlocked' : 'locked'}`}
                                        onClick={() => { sound.playWaxSealClick(); setSelectedPlayer(player); }}
                                    >
                                        <Card data={player} isFlipped={true} size="small" />
                                        {!isUnlocked && (
                                            <div className="locked-card-overlay" title="Card not yet pulled in packs">
                                                🔒
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* TAB III: HALL OF FAME */}
                {activeTab === 'HALL_OF_FAME' && (
                    <div className="tab-view-container hall-of-fame-view">
                        <div className="hall-header">
                            <h2>👑 SOVEREIGN LEGENDS — HALL OF CHAMPIONS</h2>
                            <p>The immortalised knight soccer champions of the realm ({hallOfFameLegends.length} Champions Enshrined)</p>
                        </div>

                        <div className="compendium-filter-bar" style={{ marginBottom: '12px' }}>
                            <div className="filter-group">
                                <span className="filter-label">Filter Role:</span>
                                {['ALL', 'FW', 'MF', 'DF', 'GK'].map(pos => (
                                    <button
                                        key={pos}
                                        className={`filter-btn ${hallPosFilter === pos ? 'active' : ''}`}
                                        onClick={() => { sound.playWaxSealClick(); setHallPosFilter(pos); }}
                                    >
                                        {pos === 'FW' ? '⚔️ Attackers' : pos === 'MF' ? '⚜️ Playmakers' : pos === 'DF' ? '🛡️ Defenders' : pos === 'GK' ? '🧤 Goalkeepers' : 'ALL LEGENDS'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="hall-legends-grid">
                            {hallOfFameLegends.map(legend => (
                                <div
                                    key={legend.id}
                                    className="legend-pedestal-item"
                                    onClick={() => { sound.playWaxSealClick(); setSelectedPlayer(legend); }}
                                >
                                    <div className="pedestal-card">
                                        <Card data={legend} isFlipped={true} size="normal" />
                                    </div>
                                    <div className="pedestal-base">
                                        <span className="pedestal-title">{legend.name}</span>
                                        <span className="pedestal-rating">OVR {legend.rating} • {legend.position} • {legend.rarity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB IV: REALM CHRONICLE */}
                {activeTab === 'CHRONICLE' && (
                    <div className="tab-view-container chronicle-view">
                        {/* Chapter Navigation Bar */}
                        <div className="chronicle-chapter-nav">
                            <button 
                                className={`chapter-nav-btn ${chronicleChapter === 'ch1' ? 'active' : ''}`}
                                onClick={() => { sound.playWaxSealClick(); setChronicleChapter('ch1'); }}
                            >
                                📜 I. Old Aurelia
                            </button>
                            <button 
                                className={`chapter-nav-btn ${chronicleChapter === 'ch2' ? 'active' : ''}`}
                                onClick={() => { sound.playWaxSealClick(); setChronicleChapter('ch2'); }}
                            >
                                ⚖️ II. Lex Calibrata
                            </button>
                            <button 
                                className={`chapter-nav-btn ${chronicleChapter === 'ch3' ? 'active' : ''}`}
                                onClick={() => { sound.playWaxSealClick(); setChronicleChapter('ch3'); }}
                            >
                                🏰 III. Five Houses
                            </button>
                            <button 
                                className={`chapter-nav-btn ${chronicleChapter === 'ch4' ? 'active' : ''}`}
                                onClick={() => { sound.playWaxSealClick(); setChronicleChapter('ch4'); }}
                            >
                                ⚔️ IV. Destinies
                            </button>
                            <button 
                                className={`chapter-nav-btn ${chronicleChapter === 'ch5' ? 'active' : ''}`}
                                onClick={() => { sound.playWaxSealClick(); setChronicleChapter('ch5'); }}
                            >
                                👑 V. Tournament
                            </button>
                        </div>

                        {/* Chapter Body Container */}
                        <div className="chronicle-content-box glass-panel">
                            {chronicleChapter === 'ch1' && (
                                <div className="chapter-article animated-fade-in">
                                    <div className="chapter-header">
                                        <span className="chapter-num">CHAPTER I</span>
                                        <h2 className="chapter-title text-gradient-gold">THE BLOODSHED OF OLD AURELIA</h2>
                                    </div>
                                    <div className="article-body">
                                        <p className="lead-paragraph">
                                            For five centuries, the continent of Aurelia was torn apart by perpetual feudal warfare. The great fiefdoms—the geothermal clans of the Southern Ridge, the highborn imperial dynasts of the Zenith Peak, the druidic wardens of the Sylvan Forests, the fortress garrisons of the Eastern Steppes, and the mariner lords of the Western Coastlines—fought endless bloody wars for territory, mineral rights, and sacred ley-line control.
                                        </p>
                                        <p>
                                            Trench warfare, siege catapults, and dragon-fire armor devastated the realm. Whole generations of valiant knights perished in mud and flame, leaving fields fertile only with rusted mail and forgotten swords.
                                        </p>
                                        <div className="chronicle-callout-card">
                                            <span className="callout-icon">❄️</span>
                                            <div className="callout-text">
                                                <strong>The Turning Point of 1879:</strong> The Great Frost of the Southern Ridge caused catastrophic food shortages, while dragon warfare emptied royal treasuries. It became clear to all five sovereign rulers that continued conflict meant total extinction.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {chronicleChapter === 'ch2' && (
                                <div className="chapter-article animated-fade-in">
                                    <div className="chapter-header">
                                        <span className="chapter-num">CHAPTER II</span>
                                        <h2 className="chapter-title text-gradient-gold">THE GREAT CALIBRATION OF 1880 & LEX CALIBRATA</h2>
                                    </div>
                                    <div className="article-body">
                                        <p className="lead-paragraph">
                                            In the spring of 1880, High Chancellor Cassian Aurelius invited the leaders of all major warlord houses to the neutral ground of the Zenith Mountain Spire. There, surrounded by snowy peaks and ancient marble archways, the leaders spent forty days and forty nights negotiating a permanent peace protocol.
                                        </p>
                                        <div className="lex-rules-grid">
                                            <div className="lex-rule-card">
                                                <span className="rule-num">I</span>
                                                <h4>War Outlawed</h4>
                                                <p>Open battlefield combat, military invasions, and bloodshed between sovereign houses were permanently banned on pain of realm outlawry.</p>
                                            </div>
                                            <div className="lex-rule-card">
                                                <span className="rule-num">II</span>
                                                <h4>Pitch Control</h4>
                                                <p>All territorial, political, and honor disputes were transitioned into a high-stakes tactical card jousting sport known as Pitch Control.</p>
                                            </div>
                                            <div className="lex-rule-card">
                                                <span className="rule-num">III</span>
                                                <h4>5-Round Duels</h4>
                                                <p>Battles occur across 5 tactical rounds testing fundamental martial attributes: Attack (ATT), Midfield (MID), Defense (DEF), and Goalkeeping (GK).</p>
                                            </div>
                                            <div className="lex-rule-card">
                                                <span className="rule-num">IV</span>
                                                <h4>The Codex Cards</h4>
                                                <p>Each knight's combat capability, armor weight, and tactical discipline were abstracted into a sovereign playing card registered in the Royal Codex.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {chronicleChapter === 'ch3' && (
                                <div className="chapter-article animated-fade-in">
                                    <div className="chapter-header">
                                        <span className="chapter-num">CHAPTER III</span>
                                        <h2 className="chapter-title text-gradient-gold">THE FIVE SOVEREIGN HOUSES</h2>
                                    </div>
                                    <div className="houses-chronicle-list">
                                        {CLUBS.map(club => (
                                            <div key={club.id} className="house-chronicle-card glass-card" onClick={() => { sound.playWaxSealClick(); setActiveTab('HOUSES'); setSelectedClubId(club.id); }}>
                                                <div className="house-card-header">
                                                    <ClubBadge club={club} size="medium" />
                                                    <div className="house-title-group">
                                                        <h3>{club.name}</h3>
                                                        <span className="house-stadium">🏟️ {club.stadium} • {club.league}</span>
                                                    </div>
                                                    <span className="house-focus-badge">{club.focusAttribute} FOCUS</span>
                                                </div>
                                                <p className="house-motto-line">"{club.motto}"</p>
                                                <p className="house-lore-excerpt">{club.lore}</p>
                                                <div className="house-star-player">
                                                    <strong>Star Champion:</strong> {club.bestPlayer}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {chronicleChapter === 'ch4' && (
                                <div className="chapter-article animated-fade-in">
                                    <div className="chapter-header">
                                        <span className="chapter-num">CHAPTER IV</span>
                                        <h2 className="chapter-title text-gradient-gold">LEGEND DESTINIES & FAMOUS RIVALRIES</h2>
                                    </div>
                                    <div className="destinies-grid">
                                        <div className="destiny-card glass-card">
                                            <span className="destiny-tag">THE DUEL OF FIRE AND STEEL</span>
                                            <h4>Sir Tristan vs. Dame Brienne</h4>
                                            <p>In the legendary 1884 Final at Zenith Spire, Sir Tristan Fireblade's scorching magma volley hit Dame Brienne's steel shield with such force that the pitch reverberated for ten seconds. Brienne held her ground, establishing the eternal rule that no forward breaks an Oathkeeper without paying in blood.</p>
                                        </div>
                                        <div className="destiny-card glass-card">
                                            <span className="destiny-tag">THE ROYAL ACADEMY SCHISM</span>
                                            <h4>Jude the Playmaker & Crown Prince Arturo</h4>
                                            <p>Educated in the same imperial tactical academy, Jude refused to play second fiddle when Arturo inherited Zenith's captaincy. Jude migrated to Wildwood United, bringing royal passing geometry to the druidic forest. Matches between Zenith and Wildwood are known as the Schism Derbies.</p>
                                        </div>
                                        <div className="destiny-card glass-card">
                                            <span className="destiny-tag">BEAST OF THE DRAGON SCALE</span>
                                            <h4>Erling's Golden Dragon Armor</h4>
                                            <p>Erling joined Zenith Knights after taming a rogue dragon in the Northern Frostlands. His golden dragon-scale armor grants him terrifying explosive force on opening goals. Only Sir Bors and Sir Percival have ever blocked his dragon-surge shot in open play.</p>
                                        </div>
                                        <div className="destiny-card glass-card">
                                            <span className="destiny-tag">THE MASTER CODEX</span>
                                            <h4>Sir Palamedes' Tactical Treatise</h4>
                                            <p>Sir Palamedes of Solaris FC spent three years traveling between all five houses, documenting every knight's movement pattern into the Master Codex of Pitch Coordinates. His insights allow Solaris to anticipate opponent tactical cards before they are played.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {chronicleChapter === 'ch5' && (
                                <div className="chapter-article animated-fade-in">
                                    <div className="chapter-header">
                                        <span className="chapter-num">CHAPTER V</span>
                                        <h2 className="chapter-title text-gradient-gold">THE SOVEREIGN CODEX TOURNAMENT</h2>
                                    </div>
                                    <div className="article-body">
                                        <p className="lead-paragraph">
                                            Today, managers from across Aurelia take command of these five legendary houses. By drafting squads from the 88 registered sovereign knights, managing stamina, timing passive traits, and mastering the 5-round tactical duel, managers fight for the ultimate prize: The Sovereign Codex Crown.
                                        </p>
                                        <div className="tournament-steps-card glass-card">
                                            <div className="step-item">
                                                <span className="step-badge">1</span>
                                                <div>
                                                    <strong>Draft Squad:</strong> Build an 11-player squad of Attackers, Playmakers, Defenders, and Goalkeepers.
                                                </div>
                                            </div>
                                            <div className="step-item">
                                                <span className="step-badge">2</span>
                                                <div>
                                                    <strong>Tactical Rounds:</strong> Deploy 5 tactical rounds matching active attributes to claim point superiority.
                                                </div>
                                            </div>
                                            <div className="step-item">
                                                <span className="step-badge">3</span>
                                                <div>
                                                    <strong>Claim Glory:</strong> Enshrine your victory in the Royal Lore Binder and unlock rare knight cards!
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Render Player Detail Modal */}
            {selectedPlayer && (
                <CardInspectModal
                    card={selectedPlayer}
                    onClose={() => setSelectedPlayer(null)}
                    onPlayerClick={setSelectedPlayer}
                />
            )}
        </div>
    );
};

export default LoreBinder;
