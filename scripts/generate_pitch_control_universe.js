import fs from 'fs';
import path from 'path';

// Pitch Control Universe Builder

// 1. CLUBS DATA
const CLUBS = [
    {
        id: "club_1",
        name: "Ignis Wanderers",
        moniker: "Ignis",
        league: "Apex Division",
        leagueId: "apex",
        tier: 1,
        position: 1,
        motto: "We do not play with fire — we ARE the fire.",
        philosophy: "Route One Direct",
        focusAttribute: "ATT",
        primaryColor: "hsl(14, 85%, 40%)",
        secondaryColor: "hsl(45, 100%, 55%)",
        lore: "Born in the subterranean steam-bays and volcanic foundries of the Southern Ridge, Ignis Wanderers were forged by thermal engineers and magma-smiths who weaponized kinetic momentum into a terrifying sport. Their home pitch, The Ember Cauldron, is suspended directly over an active magma vault, causing steam to vent through the grass and radiating heat through boots during winter matches. Led by the fiery Sir Tristan Fireblade and the relentless Sir Lamorak, Ignis plays a brutal, relentless direct style where every long ball carries the explosive force of a volcanic eruption.",
        stadium: "The Ember Cauldron",
        strengths: "Devastating forward momentum, explosive ATT combination rolls, terrifying aerial physical duels.",
        weaknesses: "High defensive line leaves open counter-attack corridors; heavy stamina drain in late rounds.",
        manager: {
            name: "Enzo Pyrehart",
            role: "Grand Tactician & Furnace Master",
            bio: "A former thermal forge worker turned football theorist who views tactics through the lens of thermodynamics. Enzo believes that any defense can be melted if subjected to sufficient continuous pressure."
        },
        staff: [
            { name: "Atticus Dale", role: "Scouting Director", bio: "Scouts the volcanic borderlands for raw physical specimens with unyielding stamina." },
            { name: "Magma-Smith Vulcan", role: "Armor Specialist", bio: "Custom-forges lightweight heat-tempered plate armor for the Ignis starting XI." }
        ],
        bestPlayer: "Sir Tristan Fireblade (LEGEND FW)"
    },
    {
        id: "club_2",
        name: "Zenith Knights",
        moniker: "Zenith",
        league: "Apex Division",
        leagueId: "apex",
        tier: 1,
        position: 2,
        motto: "From the highest citadel, we descend upon all.",
        philosophy: "Tiki-Taka Possession",
        focusAttribute: "MID",
        primaryColor: "hsl(220, 80%, 35%)",
        secondaryColor: "hsl(45, 100%, 60%)",
        lore: "The Zenith Knights are the undisputed aristocracy of the realm's pitch leagues. Established by the imperial decree of the Aurelius royal dynasty, their home stadium—The Grand Spire Coliseum—sits atop the highest mountain peak in Aurelia, surrounded by soaring marble arches and royal banners. Zenith fields noble knights trained from childhood in the imperial academies, blending exquisite geometric ball retention with overwhelming individual brilliance. Boasting superstars like Sir Lancelot the Swift, Sir Bors the Iron Bastion, Erling the Dragon Striker, and Crown Prince Arturo, Zenith treats every match as a royal exhibition of technical perfection.",
        stadium: "The Grand Spire Coliseum",
        strengths: "Peerless central possession control, world-class individual ratings, impenetrable goalkeeper foundation.",
        weaknesses: "Prone to aristocratic arrogance; occasionally over-complicates straightforward scoring chances.",
        manager: {
            name: "Lord Cassian Aurelius",
            role: "Grand Commander & High Chancellor",
            bio: "Direct descendant of the royal commissioners who drafted the Lex Calibrata in 1880. Cassian demands tactical perfection and views anything less than a 3-goal victory as a failure of court etiquette."
        },
        staff: [
            { name: "Magistra Lyra", role: "Chief Tactical Analyst", bio: "Architect of Zenith's famous high-altitude spatial pressing matrices." },
            { name: "High Chaplain Valerius", role: "Morale Director", bio: "Ensures the squad maintains absolute mental composure during high-stakes finals." }
        ],
        bestPlayer: "Sir Lancelot the Swift (LEGEND FW) / Erling the Dragon Striker"
    },
    {
        id: "club_3",
        name: "Wildwood United",
        moniker: "Wildwood",
        league: "Apex Division",
        leagueId: "apex",
        tier: 1,
        position: 3,
        motto: "Roots in the soil, hearts in the match.",
        philosophy: "Possession Control",
        focusAttribute: "MID",
        primaryColor: "hsl(140, 60%, 30%)",
        secondaryColor: "hsl(45, 80%, 60%)",
        lore: "Nestled deep within the ancient Sylvan Forest, Wildwood United was founded by a guild of druidic rangers and woodland cartographers. Their pitch, The Forest Arena, is carved out of a clearing surrounded by giant elderwood trees whose canopy forms a natural cathedral. Wildwood plays a fluid, organic style of football based on intricate passing triangles and spatial harmony. Under the leadership of Jude the Playmaker, Sir Ywain the Lionheart, Sir Gawain the Verdant, and Dame Isolde, Wildwood suffocates opponents in a web of relentless short passes before striking like an adder through the central corridor.",
        stadium: "The Forest Arena",
        strengths: "Dominant midfield triangle control, exceptional stamina endurance, fluid positional rotation.",
        weaknesses: "Vulnerable to extreme physical long balls against heavy defensive units.",
        manager: {
            name: "Fabian Finch",
            role: "Grandmaster Tactician",
            bio: "A scholar from the Royal Cartography Guild who mapped the woodland ley lines. Fabian treats the football pitch as a living musical score."
        },
        staff: [
            { name: "Bran Mossworth", role: "Conditioning Master", bio: "Formulates herbal restorative remedies that keep Wildwood players at peak stamina in extra time." },
            { name: "Ranger Silas", role: "Tactical Scout", bio: "Tracks opponent movement patterns through subtle pitch boundary observations." }
        ],
        bestPlayer: "Jude the Playmaker (LEGEND MF)"
    },
    {
        id: "club_4",
        name: "Solaris FC",
        moniker: "Solaris",
        league: "Challenger League",
        leagueId: "challenger",
        tier: 2,
        position: 6,
        motto: "The sun sets only for those who stop fighting.",
        philosophy: "Gegenpressing",
        focusAttribute: "DEF",
        primaryColor: "hsl(35, 90%, 45%)",
        secondaryColor: "hsl(200, 70%, 50%)",
        lore: "Solaris FC hails from the sun-scorched Eastern Steppes, where military fortresses were built to withstand endless sieges. Their stadium, The Citadel Grounds, is an ancient stone fortress whose high ramparts catch the scorching midday heat. Solaris soccer philosophy is rooted in iron defensive discipline, aggressive low-block positioning, and explosive counter-pressing. Sir Kay the Seneschal, Sir Hector of the Citadel, Sir Palamedes, and Sir Agravain form a defensive phalanx that has thwarted the realm's most decorated strikers.",
        stadium: "The Citadel Grounds",
        strengths: "Impenetrable central defensive shape, deadly dead-ball set pieces, suffocating counter-press.",
        weaknesses: "Limited creative flair in open-field transition; struggles when forced to chase matches.",
        manager: {
            name: "Commander Aldric Vale",
            role: "Supreme Siege Master",
            bio: "A veteran garrison general who transferred military siege tactics directly onto the tactical card board."
        },
        staff: [
            { name: "Wren Caldwell", role: "Set-Piece Strategist", bio: "Engineers unstoppable aerial corner routines using military catapult trajectory formulas." },
            { name: "Captain Rampart", role: "Defensive Drill Instructor", bio: "Instills iron discipline into Solaris defenders from dawn to dusk." }
        ],
        bestPlayer: "Sir Kay the Seneschal (RARE MF) / Commander Thaddeus Sol"
    },
    {
        id: "club_5",
        name: "Zephyr Rovers",
        moniker: "Zephyr",
        league: "Challenger League",
        leagueId: "challenger",
        tier: 2,
        position: 9,
        motto: "We ride the wind. The wind does not ride us.",
        philosophy: "Wing Attack",
        focusAttribute: "ATT",
        primaryColor: "hsl(200, 70%, 40%)",
        secondaryColor: "hsl(160, 50%, 55%)",
        lore: "Formed along the jagged sea cliffs of the Western Coastlines, Zephyr Rovers are the intrepid mariners and coastal knights of Aurelia. Their home, The Gale Grounds, sits on an ocean bluff where sea spray and howling coastal winds test every aerial cross. Zephyr plays a high-tempo, wide-attacking game, overloading the flanks before whipping curved crosses into the penalty box. Anchored defensively by legendary wall Dame Brienne the Ironclad, Sir Percival the Pure, Sir Morien, and Sir Bedivere, Zephyr balances terrifying defensive stoicism with lightning wing bursts.",
        stadium: "The Gale Grounds",
        strengths: "Devastating wing play, unmatched aerial header threats, elite defensive shield foundations.",
        weaknesses: "Can be exploited in central midfield space if wide wing-backs push too far forward.",
        manager: {
            name: "Sigrid Waveborn",
            role: "Captain & Head Tactician",
            bio: "A former naval captain who reads pitch wind patterns and opponent momentum like sea tides."
        },
        staff: [
            { name: "Aldous Crane", role: "Keeper Mentor", bio: "Former elite keeper who trained Sir Dagonet to execute impossible acrobatic saves." },
            { name: "Navigator Drake", role: "Flank Specialist", bio: "Analyzes touchline spatial zones to maximize wing speed overlap." }
        ],
        bestPlayer: "Sir Percival the Pure (LEGEND DF) / Dame Brienne the Ironclad"
    }
];

// 2. PLAYERS DATA SETUP (88 Players)
const PLAYERS = [
    // ════════════════════════════════════════════════════════════
    // 1. IGNIS WANDERERS (club_1) — 18 PLAYERS
    // ════════════════════════════════════════════════════════════
    {
        id: "leg_001", name: "Sir Tristan Fireblade", position: "FW", rating: 89,
        rarity: "LEGEND", clubId: "club_1",
        stats: { ATT: 89, MID: 70, DEF: 38, GK: 10 },
        stamina: 86, aggression: 90,
        image: "/images/knights/knight_tristan.jpeg",
        trait: { name: "Dragon Breath Shot", desc: "+20 ATT when trailing by one goal — geothermal fury ignites." },
        lore: "Forged in the geothermal foundries of Ignis Wanderers, Sir Tristan unleashes blistering curve shots that leave goalkeepers blinded by sheer friction. His boots leave scorch marks on the turf."
    },
    {
        id: "leg_002", name: "Sir Lamorak the Unbroken", position: "FW", rating: 89,
        rarity: "LEGEND", clubId: "club_1",
        stats: { ATT: 89, MID: 65, DEF: 48, GK: 10 },
        stamina: 87, aggression: 92,
        image: "/images/knights/knight_lamorak.jpeg",
        trait: { name: "Berserker Shot", desc: "+20 ATT when playing with stamina below 40 — desperation becomes devastation." },
        lore: "Battle-worn and scarred from a hundred pitch wars, Sir Lamorak plants his foot on the ball and dares any defender to take it from him. His presence alone shakes opposition backlines."
    },
    {
        id: "ign_003", name: "Captain Pyre Vane", position: "FW", rating: 85,
        rarity: "ELITE", clubId: "club_1",
        stats: { ATT: 85, MID: 68, DEF: 42, GK: 10 },
        stamina: 88, aggression: 86,
        image: "/images/knight_striker.jpg",
        trait: { name: "Thermal Ignition", desc: "+15 ATT during second-half offensive duels." },
        lore: "Commander of Ignis' secondary assault line, Pyre Vane wears armor laced with smoldering brass coils. His headers strike the crossbar with the force of a siege catapult."
    },
    {
        id: "ign_004", name: "Sir Ignatius Cinder", position: "MF", rating: 84,
        rarity: "ELITE", clubId: "club_1",
        stats: { ATT: 76, MID: 84, DEF: 65, GK: 10 },
        stamina: 90, aggression: 82,
        image: "/images/knight_midfielder.jpg",
        trait: { name: "Magma Pulse", desc: "+12 MID when distributing long balls to forwards." },
        lore: "Ignatius fuels the engine room of Ignis Wanderers. Raised in the steam caverns, his lung capacity allows him to cover every blade of hot grass without missing a step."
    },
    {
        id: "ign_005", name: "Vulcan Drake", position: "FW", rating: 79,
        rarity: "RARE", clubId: "club_1",
        stats: { ATT: 79, MID: 60, DEF: 36, GK: 10 },
        stamina: 80, aggression: 84,
        image: "/images/knight_striker.jpg",
        trait: { name: "Ash Cannon", desc: "+10 ATT on direct volley attempts." },
        lore: "A brute forward who specializes in first-time volleys. Vulcan's shots fly with such velocity that ball-boys wear iron gauntlets behind his net."
    },
    {
        id: "ign_006", name: "Garrick Flamehand", position: "GK", rating: 78,
        rarity: "RARE", clubId: "club_1",
        stats: { ATT: 10, MID: 14, DEF: 38, GK: 78 },
        stamina: 82, aggression: 65,
        image: "/images/knight_goalkeeper.jpg",
        trait: { name: "Scorch Grip", desc: "+12 GK against power strikes." },
        lore: "Garrick wears dragon-skin gloves lined with heat-resistant mesh. He catches smoldering leather shots with unyielding hands."
    },
    {
        id: "ign_007", name: "Axel Pyros", position: "DF", rating: 77,
        rarity: "RARE", clubId: "club_1",
        stats: { ATT: 34, MID: 60, DEF: 77, GK: 10 },
        stamina: 84, aggression: 88,
        image: "/images/knight_defender.jpg",
        trait: { name: "Basalt Wall", desc: "+10 DEF against physical strikers." },
        lore: "Axel guards the Ignis low block with a volcanic basalt shield. He relishes physical tackles and leaves opposing wingers bruised."
    },
    {
        id: "ign_008", name: "Cinder Vance", position: "MF", rating: 76,
        rarity: "RARE", clubId: "club_1",
        stats: { ATT: 68, MID: 76, DEF: 58, GK: 10 },
        stamina: 85, aggression: 78,
        image: "/images/knight_midfielder.jpg",
        trait: { name: "Steam Surge", desc: "+10 MID during counter-attack transit." },
        lore: "Cinder provides the spark between defense and attack, darting through midfield smoke to release Ignis' deadly wingers."
    },
    {
        id: "ign_009", name: "Silas Ember", position: "FW", rating: 75,
        rarity: "RARE", clubId: "club_1",
        stats: { ATT: 75, MID: 64, DEF: 32, GK: 10 },
        stamina: 78, aggression: 76,
        image: "/images/knight_striker.jpg",
        trait: { name: "Flare Sprint", desc: "+10 ATT when chasing wide long balls." },
        lore: "A rapid wing-forward who thrives in open ocean-breeze matches. Silas cuts inward from the right flank to unleash far-post curved shots."
    },
    {
        id: "ign_010", name: "Brennan Cole", position: "FW", rating: 68,
        rarity: "COMMON", clubId: "club_1",
        stats: { ATT: 68, MID: 52, DEF: 30, GK: 10 },
        stamina: 72, aggression: 70,
        image: "/images/knight_striker.jpg",
        trait: null,
        lore: "A young whelp from the volcanic outskirts who dreams of the great leagues. Cole's pace is his only weapon, but it is a sharp one."
    },
    {
        id: "ign_011", name: "Aldric Vane", position: "MF", rating: 62,
        rarity: "COMMON", clubId: "club_1",
        stats: { ATT: 55, MID: 62, DEF: 48, GK: 10 },
        stamina: 78, aggression: 55,
        image: "/images/knight_midfielder.jpg",
        trait: null,
        lore: "A steadfast journeyman who has served Ignis Wanderers faithfully for three seasons without fanfare."
    },
    {
        id: "ign_012", name: "Colt Ashburn", position: "DF", rating: 65,
        rarity: "COMMON", clubId: "club_1",
        stats: { ATT: 30, MID: 50, DEF: 65, GK: 10 },
        stamina: 80, aggression: 68,
        image: "/images/knight_defender.jpg",
        trait: null,
        lore: "Hard as the volcanic rock he trains on. Not elegant, but reliably brutal in the tackle."
    },
    {
        id: "ign_013", name: "Garrus Flint", position: "GK", rating: 64,
        rarity: "COMMON", clubId: "club_1",
        stats: { ATT: 10, MID: 15, DEF: 35, GK: 64 },
        stamina: 74, aggression: 50,
        image: "/images/knight_goalkeeper.jpg",
        trait: null,
        lore: "Steady under the firestorm. Garrus has a habit of saving shots with his face and calling it a clean sheet."
    },
    {
        id: "ign_014", name: "Jaxon Scoria", position: "DF", rating: 66,
        rarity: "COMMON", clubId: "club_1",
        stats: { ATT: 28, MID: 52, DEF: 66, GK: 10 },
        stamina: 76, aggression: 72,
        image: "/images/knight_defender.jpg",
        trait: null,
        lore: "Scoria anchors the left side of Ignis' defensive line. He lacks technical elegance but never shies away from a crunching challenge."
    },
    {
        id: "ign_015", name: "Kieran Furnace", position: "MF", rating: 64,
        rarity: "COMMON", clubId: "club_1",
        stats: { ATT: 56, MID: 64, DEF: 50, GK: 10 },
        stamina: 75, aggression: 60,
        image: "/images/knight_midfielder.jpg",
        trait: null,
        lore: "Furnace acts as a defensive screen in front of the back four, breaking up opponent passing lanes before they develop."
    },
    {
        id: "ign_016", name: "Torin Molten", position: "FW", rating: 67,
        rarity: "COMMON", clubId: "club_1",
        stats: { ATT: 67, MID: 50, DEF: 28, GK: 10 },
        stamina: 70, aggression: 74,
        image: "/images/knight_striker.jpg",
        trait: null,
        lore: "A physical target man who uses his massive frame to hold off defenders while waiting for midfield support."
    },
    {
        id: "ign_017", name: "Damon Charcoal", position: "DF", rating: 63,
        rarity: "COMMON", clubId: "club_1",
        stats: { ATT: 25, MID: 45, DEF: 63, GK: 10 },
        stamina: 78, aggression: 65,
        image: "/images/knight_defender.jpg",
        trait: null,
        lore: "Charcoal is a reliable backup defender known for his tireless marking and disciplined positioning."
    },
    {
        id: "ign_018", name: "Rylan Hearth", position: "GK", rating: 61,
        rarity: "COMMON", clubId: "club_1",
        stats: { ATT: 10, MID: 12, DEF: 30, GK: 61 },
        stamina: 70, aggression: 48,
        image: "/images/knight_goalkeeper.jpg",
        trait: null,
        lore: "An apprentice keeper learning the craft under Garrick's stern tutelage in the Ember Cauldron."
    },

    // ════════════════════════════════════════════════════════════
    // 2. ZENITH KNIGHTS (club_2) — 18 PLAYERS
    // ════════════════════════════════════════════════════════════
    {
        id: "leg_003", name: "Sir Lancelot the Swift", position: "FW", rating: 98,
        rarity: "LEGEND", clubId: "club_2",
        stats: { ATT: 98, MID: 86, DEF: 42, GK: 10 },
        stamina: 92, aggression: 85,
        image: "/images/knights/knight_lancelot.jpeg",
        trait: { name: "Lance Strike", desc: "+25 ATT on open-field counter-attacks — none have ever caught him." },
        lore: "The paragon of striker chivalry. Lancelot cuts through defensive lines like a lance through silk. His volcanic volleys are the stuff of legend across every pitch arena in the realm."
    },
    {
        id: "leg_004", name: "Sir Bors the Iron Bastion", position: "GK", rating: 97,
        rarity: "LEGEND", clubId: "club_2",
        stats: { ATT: 10, MID: 15, DEF: 50, GK: 97 },
        stamina: 90, aggression: 60,
        image: "/images/knights/knight_bors.jpeg",
        trait: { name: "Impenetrable Citadel", desc: "Wins all ties on GK rolls — the ball simply refuses to pass." },
        lore: "Sir Bors wears heavy chainmail beneath his jersey. His gauntleted grip on a soccer ball has never once been broken. Opposing strikers have described him as 'a moving wall with opinions.'"
    },
    {
        id: "leg_005", name: "Crown Prince Arturo", position: "MF", rating: 91,
        rarity: "ELITE", clubId: "club_2",
        stats: { ATT: 78, MID: 91, DEF: 68, GK: 10 },
        stamina: 88, aggression: 72,
        image: "/images/knights/knight_crown_prince.jpeg",
        trait: { name: "Royal Command", desc: "+15 MID to all teammates if played as captain in Round 1." },
        lore: "Born to the purple, trained in the golden academies of the realm. Crown Prince Arturo descended from his throne to prove that royal blood runs fastest on the pitch. The crowd always rises when he touches the ball."
    },
    {
        id: "leg_006", name: "Erling the Dragon Striker", position: "FW", rating: 98,
        rarity: "LEGEND", clubId: "club_2",
        stats: { ATT: 98, MID: 72, DEF: 35, GK: 10 },
        stamina: 94, aggression: 88,
        image: "/images/knights/legend_erling.jpg",
        trait: { name: "Golden Dragon Surge", desc: "+25 ATT when scoring the opening goal — the beast awakens." },
        lore: "Where Erling walks, rivals part. His golden dragon armour is said to be forged from the scales of a beast that challenged the realm's founding matches. He has never met a goal he could not score."
    },
    {
        id: "zen_005", name: "Lord Valerius Goldwing", position: "MF", rating: 86,
        rarity: "ELITE", clubId: "club_2",
        stats: { ATT: 76, MID: 86, DEF: 70, GK: 10 },
        stamina: 86, aggression: 74,
        image: "/images/knight_midfielder.jpg",
        trait: { name: "Gilded Vision", desc: "+15 MID when linking with royal forwards." },
        lore: "Valerius plays with an effortless elegance that borders on disdain for the opposition. His long-range passes drop onto teammates' boots like gold coins onto silk."
    },
    {
        id: "zen_006", name: "Dame Genevieve Aurelius", position: "DF", rating: 85,
        rarity: "ELITE", clubId: "club_2",
        stats: { ATT: 40, MID: 72, DEF: 85, GK: 12 },
        stamina: 88, aggression: 78,
        image: "/images/knight_defender.jpg",
        trait: { name: "Sovereign Shield", desc: "+15 DEF during goal-line scrambles." },
        lore: "High Captain of the Royal Spire Guard, Genevieve defends Zenith's penalty area with imperial steel. She has never surrendered a duel on home turf."
    },
    {
        id: "zen_007", name: "Sir Cassian Crest", position: "MF", rating: 80,
        rarity: "RARE", clubId: "club_2",
        stats: { ATT: 70, MID: 80, DEF: 62, GK: 10 },
        stamina: 82, aggression: 68,
        image: "/images/knight_midfielder.jpg",
        trait: { name: "Diamond Pass", desc: "+10 MID when executing one-touch tiki-taka turns." },
        lore: "Cassian is the master of the quick touch. He operates in tight central spaces, threading passes through needle-eye gaps in enemy lines."
    },
    {
        id: "zen_008", name: "Lucian Spire", position: "FW", rating: 79,
        rarity: "RARE", clubId: "club_2",
        stats: { ATT: 79, MID: 65, DEF: 34, GK: 10 },
        stamina: 80, aggression: 75,
        image: "/images/knight_striker.jpg",
        trait: { name: "Highborn Sprint", desc: "+10 ATT on wide diagonal runs." },
        lore: "Lucian combines aristocratic posture with devastating acceleration down the left flank, cutting inside to curl shots into the upper corner."
    },
    {
        id: "zen_009", name: "Lady Aurelia Vance", position: "DF", rating: 78,
        rarity: "RARE", clubId: "club_2",
        stats: { ATT: 32, MID: 64, DEF: 78, GK: 10 },
        stamina: 83, aggression: 72,
        image: "/images/knight_defender.jpg",
        trait: { name: "Court Intercept", desc: "+10 DEF when anticipating thru-balls." },
        lore: "A cerebral defender who reads opponent intentions two steps before they materialize on the pitch."
    },
    {
        id: "zen_010", name: "Otto Blaze", position: "FW", rating: 70,
        rarity: "RARE", clubId: "club_2",
        stats: { ATT: 70, MID: 58, DEF: 32, GK: 10 },
        stamina: 76, aggression: 74,
        image: "/images/knight_striker.jpg",
        trait: { name: "Opportunist", desc: "+10 ATT when a teammate has already scored this match." },
        lore: "A quick-footed opportunist who lurks in the shadow of greatness, waiting for the rebound."
    },
    {
        id: "zen_011", name: "Marcus Dawnwall", position: "DF", rating: 67,
        rarity: "COMMON", clubId: "club_2",
        stats: { ATT: 28, MID: 48, DEF: 67, GK: 10 },
        stamina: 79, aggression: 65,
        image: "/images/knight_defender.jpg",
        trait: null,
        lore: "The definition of dependable. Dawnwall has made 200 appearances without once getting lost."
    },
    {
        id: "zen_012", name: "Cassian Bray", position: "MF", rating: 66,
        rarity: "COMMON", clubId: "club_2",
        stats: { ATT: 52, MID: 66, DEF: 54, GK: 10 },
        stamina: 80, aggression: 58,
        image: "/images/knight_midfielder.jpg",
        trait: null,
        lore: "An industrious mid who has never met a sprinting duel he refused."
    },
    {
        id: "zen_013", name: "Julian Sterling", position: "GK", rating: 68,
        rarity: "COMMON", clubId: "club_2",
        stats: { ATT: 10, MID: 14, DEF: 36, GK: 68 },
        stamina: 76, aggression: 50,
        image: "/images/knight_goalkeeper.jpg",
        trait: null,
        lore: "Julian guards Zenith's backup net with silent discipline, ready whenever Sir Bors rests."
    },
    {
        id: "zen_014", name: "Alistair Gilded", position: "FW", rating: 69,
        rarity: "COMMON", clubId: "club_2",
        stats: { ATT: 69, MID: 54, DEF: 30, GK: 10 },
        stamina: 74, aggression: 70,
        image: "/images/knight_striker.jpg",
        trait: null,
        lore: "A promising academy graduate with a silky touch and a penchant for audacious chip shots."
    },
    {
        id: "zen_015", name: "Evander Crown", position: "MF", rating: 65,
        rarity: "COMMON", clubId: "club_2",
        stats: { ATT: 56, MID: 65, DEF: 52, GK: 10 },
        stamina: 77, aggression: 56,
        image: "/images/knight_midfielder.jpg",
        trait: null,
        lore: "Evander keeps the ball moving cleanly in central midfield, serving as Zenith's tactical pendulum."
    },
    {
        id: "zen_016", name: "Lysander Herald", position: "DF", rating: 64,
        rarity: "COMMON", clubId: "club_2",
        stats: { ATT: 26, MID: 48, DEF: 64, GK: 10 },
        stamina: 75, aggression: 62,
        image: "/images/knight_defender.jpg",
        trait: null,
        lore: "Herald guards the right touchline with disciplined positioning, rarely caught out of place."
    },
    {
        id: "zen_017", name: "Dorian Sol", position: "MF", rating: 63,
        rarity: "COMMON", clubId: "club_2",
        stats: { ATT: 54, MID: 63, DEF: 48, GK: 10 },
        stamina: 72, aggression: 54,
        image: "/images/knight_midfielder.jpg",
        trait: null,
        lore: "Dorian brings energy off the bench in the late stages of matches when Zenith needs to control tempo."
    },
    {
        id: "zen_018", name: "Benedict Aegis", position: "GK", rating: 62,
        rarity: "COMMON", clubId: "club_2",
        stats: { ATT: 10, MID: 12, DEF: 32, GK: 62 },
        stamina: 72, aggression: 45,
        image: "/images/knight_goalkeeper.jpg",
        trait: null,
        lore: "A young shot-stopper from the Spire academy who models his game after Sir Bors."
    },

    // ════════════════════════════════════════════════════════════
    // 3. WILDWOOD UNITED (club_3) — 17 PLAYERS
    // ════════════════════════════════════════════════════════════
    {
        id: "leg_007", name: "Sir Ywain the Lionheart", position: "MF", rating: 87,
        rarity: "ELITE", clubId: "club_3",
        stats: { ATT: 79, MID: 87, DEF: 75, GK: 10 },
        stamina: 90, aggression: 79,
        image: "/images/knights/knight_ywain.jpeg",
        trait: { name: "Roar of Valor", desc: "+15 MID when team holds the lead — the lion does not ease up." },
        lore: "Sir Ywain's lion-crested armour gleams in the forest light as he commands Wildwood's midfield. His passing range is surgical, his tackles thunderous."
    },
    {
        id: "leg_008", name: "Sir Gawain the Verdant", position: "MF", rating: 88,
        rarity: "ELITE", clubId: "club_3",
        stats: { ATT: 75, MID: 88, DEF: 72, GK: 12 },
        stamina: 98, aggression: 70,
        image: "/images/knights/knight_gawain.jpeg",
        trait: { name: "Solar Surge", desc: "+15 MID and DEF during high-tempo duels — stamina is his greatest weapon." },
        lore: "Sir Gawain trains by chasing deer through the ancient forest. His box-to-box endurance is unmatched, and the Wildwood faithful call him 'the Forest Wind' for his relentless movement."
    },
    {
        id: "leg_009", name: "Dame Isolde of the Silver Light", position: "MF", rating: 80,
        rarity: "ELITE", clubId: "club_3",
        stats: { ATT: 68, MID: 80, DEF: 64, GK: 10 },
        stamina: 85, aggression: 55,
        image: "/images/knights/knight_isolde.jpeg",
        trait: { name: "Graceful Recovery", desc: "Restores 10 stamina to adjacent card slots when winning a MID duel." },
        lore: "Dame Isolde's silver-fleur armour flows like water on the pitch. She does not fight for the ball — she persuades it to come to her. Wildwood's heartbeat is her tempo."
    },
    {
        id: "leg_010", name: "Jude the Playmaker", position: "MF", rating: 95,
        rarity: "LEGEND", clubId: "club_3",
        stats: { ATT: 84, MID: 95, DEF: 62, GK: 10 },
        stamina: 90, aggression: 76,
        image: "/images/knights/legend_jude.jpg",
        trait: { name: "Crown Pass", desc: "+20 MID when orchestrating from deep — every ball he plays is a statement." },
        lore: "Jude descended from the royal academies to grace Wildwood's midfield with his aristocratic vision. His crown-adorned blue armour is as recognisable as his signature whipped through-ball."
    },
    {
        id: "wil_005", name: "Master Rowan Oakheart", position: "DF", rating: 84,
        rarity: "ELITE", clubId: "club_3",
        stats: { ATT: 42, MID: 70, DEF: 84, GK: 14 },
        stamina: 92, aggression: 80,
        image: "/images/knight_defender.jpg",
        trait: { name: "Ancient Bark Shield", desc: "+15 DEF against physical aerial balls." },
        lore: "Oldest defender in the realm, Master Rowan wears ancient ironwood pauldrons. Strikers bouncing off his chest feel like running into a 300-year-old oak tree."
    },
    {
        id: "wil_006", name: "Orion Bramble", position: "FW", rating: 79,
        rarity: "RARE", clubId: "club_3",
        stats: { ATT: 79, MID: 62, DEF: 32, GK: 10 },
        stamina: 82, aggression: 78,
        image: "/images/knight_striker.jpg",
        trait: { name: "Thorn Strike", desc: "+10 ATT when finishing inside the 6-yard box." },
        lore: "Orion weaves through defender foliage like a wild stag, finishing with clinical precision."
    },
    {
        id: "wil_007", name: "Freya Moss", position: "MF", rating: 78,
        rarity: "RARE", clubId: "club_3",
        stats: { ATT: 66, MID: 78, DEF: 62, GK: 10 },
        stamina: 88, aggression: 65,
        image: "/images/knight_midfielder.jpg",
        trait: { name: "Glade Weave", desc: "+10 MID when playing under heavy press." },
        lore: "Freya glides over muddy pitch terrain without losing speed, connecting Wildwood's druidic passing networks."
    },
    {
        id: "wil_008", name: "Thorin Ironwood", position: "DF", rating: 77,
        rarity: "RARE", clubId: "club_3",
        stats: { ATT: 30, MID: 58, DEF: 77, GK: 10 },
        stamina: 86, aggression: 82,
        image: "/images/knight_defender.jpg",
        trait: { name: "Timber Lock", desc: "+10 DEF when making ground slide tackles." },
        lore: "Thorin enforces the physical perimeter of the Forest Arena with unyielding timber toughness."
    },
    {
        id: "wil_009", name: "Nils Greenwood", position: "FW", rating: 69,
        rarity: "RARE", clubId: "club_3",
        stats: { ATT: 69, MID: 60, DEF: 28, GK: 10 },
        stamina: 82, aggression: 72,
        image: "/images/knight_striker.jpg",
        trait: { name: "Poacher", desc: "+20 ATT if opponent plays a GK card." },
        lore: "Quick as a hare and twice as slippery. Nils Greenwood will score from any angle if given half a yard."
    },
    {
        id: "wil_010", name: "Braden Moss", position: "DF", rating: 64,
        rarity: "COMMON", clubId: "club_3",
        stats: { ATT: 28, MID: 50, DEF: 64, GK: 10 },
        stamina: 77, aggression: 66,
        image: "/images/knight_defender.jpg",
        trait: null,
        lore: "As reliable as the forest floor. Braden Moss simply does not lose his footing."
    },
    {
        id: "wil_011", name: "Taron Fern", position: "GK", rating: 66,
        rarity: "COMMON", clubId: "club_3",
        stats: { ATT: 10, MID: 12, DEF: 32, GK: 66 },
        stamina: 75, aggression: 55,
        image: "/images/knight_goalkeeper.jpg",
        trait: null,
        lore: "Calm under the forest canopy or under a barrage of shots. Taron Fern rarely panics."
    },
    {
        id: "wil_012", name: "Cormac Pine", position: "FW", rating: 67,
        rarity: "COMMON", clubId: "club_3",
        stats: { ATT: 67, MID: 52, DEF: 30, GK: 10 },
        stamina: 74, aggression: 70,
        image: "/images/knight_striker.jpg",
        trait: null,
        lore: "Cormac provides physical presence up front when Wildwood needs to play aerial long balls into the wood canopy."
    },
    {
        id: "wil_013", name: "Silas Thistle", position: "MF", rating: 65,
        rarity: "COMMON", clubId: "club_3",
        stats: { ATT: 55, MID: 65, DEF: 52, GK: 10 },
        stamina: 78, aggression: 62,
        image: "/images/knight_midfielder.jpg",
        trait: null,
        lore: "Thistle is a tenacious pressing midfielder who nips at opponent heels until they surrender possession."
    },
    {
        id: "wil_014", name: "Finnian Willow", position: "DF", rating: 63,
        rarity: "COMMON", clubId: "club_3",
        stats: { ATT: 26, MID: 48, DEF: 63, GK: 10 },
        stamina: 76, aggression: 60,
        image: "/images/knight_defender.jpg",
        trait: null,
        lore: "Willow bends under pressure but never breaks, adjusting his shape to cover wide gaps."
    },
    {
        id: "wil_015", name: "Kaelen Canopy", position: "MF", rating: 64,
        rarity: "COMMON", clubId: "club_3",
        stats: { ATT: 54, MID: 64, DEF: 50, GK: 10 },
        stamina: 75, aggression: 54,
        image: "/images/knight_midfielder.jpg",
        trait: null,
        lore: "Canopy acts as a steady link man in Wildwood's secondary midfield unit."
    },
    {
        id: "wil_016", name: "Rowan Birch", position: "FW", rating: 65,
        rarity: "COMMON", clubId: "club_3",
        stats: { ATT: 65, MID: 50, DEF: 28, GK: 10 },
        stamina: 72, aggression: 68,
        image: "/images/knight_striker.jpg",
        trait: null,
        lore: "Birch brings raw pace to the left wing, stretching opponent backlines during late-game transitions."
    },
    {
        id: "wil_017", name: "Gavin Sylvan", position: "GK", rating: 62,
        rarity: "COMMON", clubId: "club_3",
        stats: { ATT: 10, MID: 12, DEF: 30, GK: 62 },
        stamina: 72, aggression: 48,
        image: "/images/knight_goalkeeper.jpg",
        trait: null,
        lore: "A quiet forest keeper who trains diligently in the shade of the ancient elderwoods."
    },

    // ════════════════════════════════════════════════════════════
    // 4. SOLARIS FC (club_4) — 17 PLAYERS
    // ════════════════════════════════════════════════════════════
    {
        id: "leg_011", name: "Sir Kay the Seneschal", position: "MF", rating: 84,
        rarity: "RARE", clubId: "club_4",
        stats: { ATT: 78, MID: 84, DEF: 65, GK: 10 },
        stamina: 82, aggression: 80,
        image: "/images/knights/knight_kay.jpeg",
        trait: { name: "Tactical Command", desc: "+10 MID to adjacent midfielder cards on the bench." },
        lore: "Sharp-tongued and sharper-minded. Sir Kay keeps Solaris FC's tactical formations in immaculate order, and woe betide the player who ignores his instructions."
    },
    {
        id: "leg_012", name: "Sir Hector of the Citadel", position: "DF", rating: 75,
        rarity: "RARE", clubId: "club_4",
        stats: { ATT: 30, MID: 58, DEF: 75, GK: 12 },
        stamina: 81, aggression: 73,
        image: "/images/knights/knight_hector.jpeg",
        trait: { name: "Shield Block", desc: "+10 DEF when defending inside the penalty area." },
        lore: "Sir Hector has guarded Solaris FC's solar sanctuary through three league seasons. His Solaris-crested shield is more famous than his face."
    },
    {
        id: "leg_013", name: "Sir Palamedes the Questing Knight", position: "MF", rating: 82,
        rarity: "RARE", clubId: "club_4",
        stats: { ATT: 74, MID: 82, DEF: 68, GK: 10 },
        stamina: 89, aggression: 68,
        image: "/images/knights/knight_palamedes.jpeg",
        trait: { name: "Questing Vision", desc: "Reveals the opponent's highest stat card before Round 3." },
        lore: "Sir Palamedes, the scholar-knight, studies opponents like ancient manuscripts. His unpredictable passing routes have baffled every defensive coordinator in the Challenger League."
    },
    {
        id: "leg_014", name: "Sir Agravain the Cold", position: "DF", rating: 76,
        rarity: "COMMON", clubId: "club_4",
        stats: { ATT: 35, MID: 62, DEF: 76, GK: 10 },
        stamina: 78, aggression: 86,
        image: "/images/knights/knight_agravain_cold.jpeg",
        trait: { name: "Ruthless Intercept", desc: "+10 DEF when facing a Forward with rating above 85." },
        lore: "Calculating and cold-blooded. Sir Agravain uses every legal pressure tactic available to him. His opponents call him unfair. He calls it efficient."
    },
    {
        id: "sol_005", name: "Commander Thaddeus Sol", position: "DF", rating: 85,
        rarity: "ELITE", clubId: "club_4",
        stats: { ATT: 38, MID: 72, DEF: 85, GK: 15 },
        stamina: 90, aggression: 86,
        image: "/images/knight_defender.jpg",
        trait: { name: "Sun Rampart", desc: "+15 DEF when protecting a lead in Round 5." },
        lore: "Commander of the Citadel Gate Garrison. Thaddeus stands 6'5\" in gold-studded plate armor and commands the backline with military trumpet calls."
    },
    {
        id: "sol_006", name: "Sir Gideon Ironwall", position: "DF", rating: 83,
        rarity: "ELITE", clubId: "club_4",
        stats: { ATT: 32, MID: 68, DEF: 83, GK: 12 },
        stamina: 88, aggression: 84,
        image: "/images/knight_defender.jpg",
        trait: { name: "Phalanx Lock", desc: "+12 DEF when paired with another Solaris defender." },
        lore: "Gideon treats every penalty box entry as a breach of castle perimeter, throwing his body into every block."
    },
    {
        id: "sol_007", name: "Helios Vance", position: "MF", rating: 79,
        rarity: "RARE", clubId: "club_4",
        stats: { ATT: 72, MID: 79, DEF: 65, GK: 10 },
        stamina: 84, aggression: 78,
        image: "/images/knight_midfielder.jpg",
        trait: { name: "Solar Disruptor", desc: "+10 MID when pressing enemy playmakers." },
        lore: "Helios disrupts opposition midfield rhythm through fierce man-marking and relentless tackling."
    },
    {
        id: "sol_008", name: "Rayna Sunburst", position: "FW", rating: 78,
        rarity: "RARE", clubId: "club_4",
        stats: { ATT: 78, MID: 60, DEF: 32, GK: 10 },
        stamina: 80, aggression: 76,
        image: "/images/knight_striker.jpg",
        trait: { name: "Citadel Sniper", desc: "+10 ATT on long-range free kicks." },
        lore: "Rayna possesses a lethal right foot, blasting free kicks over enemy walls like cannon fire."
    },
    {
        id: "sol_009", name: "Duncan Flare", position: "FW", rating: 67,
        rarity: "COMMON", clubId: "club_4",
        stats: { ATT: 67, MID: 55, DEF: 30, GK: 10 },
        stamina: 74, aggression: 72,
        image: "/images/knight_striker.jpg",
        trait: null,
        lore: "All fire and no precision, but occasionally the furnace produces gold."
    },
    {
        id: "sol_010", name: "Serra Dawnlight", position: "GK", rating: 65,
        rarity: "COMMON", clubId: "club_4",
        stats: { ATT: 10, MID: 14, DEF: 32, GK: 65 },
        stamina: 76, aggression: 52,
        image: "/images/knight_goalkeeper.jpg",
        trait: null,
        lore: "Serra stands in Solaris goal like a sundial — always present, always measuring."
    },
    {
        id: "sol_011", name: "Leon Ashcroft", position: "MF", rating: 63,
        rarity: "COMMON", clubId: "club_4",
        stats: { ATT: 54, MID: 63, DEF: 52, GK: 10 },
        stamina: 80, aggression: 60,
        image: "/images/knight_midfielder.jpg",
        trait: null,
        lore: "Dependable, invisible, and strangely essential. Leon Ashcroft just gets things done."
    },
    {
        id: "sol_012", name: "Marcus Rampart", position: "DF", rating: 68,
        rarity: "COMMON", clubId: "club_4",
        stats: { ATT: 26, MID: 48, DEF: 68, GK: 10 },
        stamina: 80, aggression: 75,
        image: "/images/knight_defender.jpg",
        trait: null,
        lore: "Marcus holds down the right side of Solaris' low-block phalanx with stoic determination."
    },
    {
        id: "sol_013", name: "Tobias Bulwark", position: "DF", rating: 66,
        rarity: "COMMON", clubId: "club_4",
        stats: { ATT: 25, MID: 46, DEF: 66, GK: 10 },
        stamina: 78, aggression: 72,
        image: "/images/knight_defender.jpg",
        trait: null,
        lore: "Bulwark lives up to his name, throwing his massive frame into passing lanes to block driven crosses."
    },
    {
        id: "sol_014", name: "Simeon Solstice", position: "MF", rating: 64,
        rarity: "COMMON", clubId: "club_4",
        stats: { ATT: 52, MID: 64, DEF: 54, GK: 10 },
        stamina: 76, aggression: 58,
        image: "/images/knight_midfielder.jpg",
        trait: null,
        lore: "Solstice works tirelessly in central midfield, recovering second balls during intense counter-presses."
    },
    {
        id: "sol_015", name: "Dominic Sentry", position: "GK", rating: 63,
        rarity: "COMMON", clubId: "club_4",
        stats: { ATT: 10, MID: 12, DEF: 30, GK: 63 },
        stamina: 74, aggression: 50,
        image: "/images/knight_goalkeeper.jpg",
        trait: null,
        lore: "Dominic guards Solaris' secondary goal with steady hands and clear communication."
    },
    {
        id: "sol_016", name: "Conrad Shield", position: "DF", rating: 65,
        rarity: "COMMON", clubId: "club_4",
        stats: { ATT: 24, MID: 44, DEF: 65, GK: 10 },
        stamina: 75, aggression: 68,
        image: "/images/knight_defender.jpg",
        trait: null,
        lore: "Conrad provides physical backup across the defensive backline when fatigue sets in."
    },
    {
        id: "sol_017", name: "Fabian Beam", position: "FW", rating: 66,
        rarity: "COMMON", clubId: "club_4",
        stats: { ATT: 66, MID: 50, DEF: 28, GK: 10 },
        stamina: 72, aggression: 65,
        image: "/images/knight_striker.jpg",
        trait: null,
        lore: "Fabian offers direct pace up front during late counter-attacking transitions."
    },

    // ════════════════════════════════════════════════════════════
    // 5. ZEPHYR ROVERS (club_5) — 18 PLAYERS
    // ════════════════════════════════════════════════════════════
    {
        id: "leg_015", name: "Dame Brienne the Ironclad", position: "DF", rating: 91,
        rarity: "LEGEND", clubId: "club_5",
        stats: { ATT: 52, MID: 74, DEF: 91, GK: 20 },
        stamina: 96, aggression: 88,
        image: "/images/knights/knight_brienne.jpeg",
        trait: { name: "Oathkeeper Defense", desc: "Halves the opponent's MID stat during tackle duels — an oath never broken." },
        lore: "Dame Brienne towers over wingers with her imposing steel pauldrons. No forward has ever breached her tactical sector twice and lived to brag about it."
    },
    {
        id: "leg_016", name: "Sir Percival the Pure", position: "DF", rating: 96,
        rarity: "LEGEND", clubId: "club_5",
        stats: { ATT: 45, MID: 78, DEF: 96, GK: 15 },
        stamina: 94, aggression: 78,
        image: "/images/knights/knight_percival.jpeg",
        trait: { name: "Aegis Wall", desc: "+30 DEF when resisting a direct Attack duel — the purest shield in the realm." },
        lore: "Sir Percival is the realm's most celebrated defender. His silver plate armour has deflected more strikes than any shield in recorded pitch history."
    },
    {
        id: "leg_017", name: "Sir Morien the Shadow Crusader", position: "DF", rating: 90,
        rarity: "ELITE", clubId: "club_5",
        stats: { ATT: 58, MID: 76, DEF: 90, GK: 18 },
        stamina: 91, aggression: 94,
        image: "/images/knights/knight_morien.jpeg",
        trait: { name: "Shadow Tackle", desc: "Steals 10 ATT from the opponent during slide-tackle duels." },
        lore: "Clad in green-shadowed dusk armour, Sir Morien drifts across the pitch like a dark tide. Opponents rarely see his sliding challenge until they are already on the turf."
    },
    {
        id: "leg_018", name: "Sir Bedivere the Guardian", position: "DF", rating: 83,
        rarity: "RARE", clubId: "club_5",
        stats: { ATT: 40, MID: 72, DEF: 83, GK: 15 },
        stamina: 85, aggression: 76,
        image: "/images/knights/knight_bedivere.jpeg",
        trait: { name: "Excalibur Return", desc: "+15 DEF when intercepting a long ball — loyalty is his armour." },
        lore: "Sir Bedivere is the loyal backbone of Zephyr Rovers. He positions himself on the windswept sidelines like a green falcon, tracking every long ball with uncanny foresight."
    },
    {
        id: "leg_019", name: "Sir Gareth Beaumains", position: "FW", rating: 81,
        rarity: "RARE", clubId: "club_5",
        stats: { ATT: 81, MID: 68, DEF: 35, GK: 10 },
        stamina: 88, aggression: 74,
        image: "/images/knights/knight_gareth.jpeg",
        trait: { name: "Swift Joust", desc: "+15 ATT on aerial header attempts — the sky is his kingdom." },
        lore: "Starting as a humble academy student, Sir Gareth earned his Zephyr crest through fearless aerial headers and relentless pressing. His blue cape trails in the coastal wind."
    },
    {
        id: "leg_020", name: "Sir Pellinore the Tracker", position: "DF", rating: 83,
        rarity: "RARE", clubId: "club_5",
        stats: { ATT: 48, MID: 68, DEF: 83, GK: 15 },
        stamina: 88, aggression: 84,
        image: "/images/knights/knight_pellinore.jpeg",
        trait: { name: "Relentless Pursuit", desc: "+15 DEF when tracking wingers on the flanks." },
        lore: "Sir Pellinore hunts the realm's top scorers like a hawk on the moor. Behind every great striker's bad day is a Sir Pellinore shadow-marking them from the first whistle."
    },
    {
        id: "leg_021", name: "Sir Dinadan the Wit", position: "MF", rating: 74,
        rarity: "RARE", clubId: "club_5",
        stats: { ATT: 65, MID: 74, DEF: 58, GK: 10 },
        stamina: 79, aggression: 50,
        image: "/images/knights/knight_dinadan.jpeg",
        trait: { name: "Trickster Dribble", desc: "+10 MID against aggressive tackling opponents." },
        lore: "Sir Dinadan uses humour and step-overs to disarm opponents. He once bamboozled three defenders with a feint so absurd they stopped to applaud him."
    },
    {
        id: "leg_022", name: "Sir Dagonet the Warden", position: "GK", rating: 72,
        rarity: "RARE", clubId: "club_5",
        stats: { ATT: 10, MID: 12, DEF: 30, GK: 72 },
        stamina: 75, aggression: 62,
        image: "/images/knights/knight_dagonet.jpeg",
        trait: { name: "Wild Reflexes", desc: "+12 GK against long-range strikes from outside the area." },
        lore: "Unpredictable and acrobatic. Sir Dagonet's diving saves have been described as 'physically impossible' by three separate tactical analysts. He does not care."
    },
    {
        id: "leg_023", name: "Sir Agravain Slide-Tackle", position: "DF", rating: 76,
        rarity: "COMMON", clubId: "club_5",
        stats: { ATT: 36, MID: 60, DEF: 76, GK: 10 },
        stamina: 79, aggression: 90,
        image: "/images/knights/knight_agravain.jpeg",
        trait: { name: "Ice Wall", desc: "Wins all ties on DEF rolls when facing Common or Rare attackers." },
        lore: "The cold pragmatist. Sir Agravain sees emotion as inefficiency. He slide-tackles with mathematical precision and shows no remorse."
    },
    {
        id: "zep_010", name: "Aero Tempest", position: "FW", rating: 86,
        rarity: "ELITE", clubId: "club_5",
        stats: { ATT: 86, MID: 74, DEF: 38, GK: 10 },
        stamina: 88, aggression: 80,
        image: "/images/knight_striker.jpg",
        trait: { name: "Gale Burst", desc: "+15 ATT when receiving wide crosses in coastal weather." },
        lore: "Zephyr's premier wing-forward, Aero Tempest runs so fast that spectators claim he leaves whirlpools in the grass."
    },
    {
        id: "zep_011", name: "Zephyr Tide", position: "MF", rating: 80,
        rarity: "RARE", clubId: "club_5",
        stats: { ATT: 72, MID: 80, DEF: 65, GK: 10 },
        stamina: 86, aggression: 72,
        image: "/images/knight_midfielder.jpg",
        trait: { name: "Storm Surge", desc: "+10 MID on wide transition passes." },
        lore: "Tide dictates the tempo of Zephyr's ocean attacks, whipping passes across the pitch like incoming high tide."
    },
    {
        id: "zep_012", name: "Marina Breeze", position: "DF", rating: 78,
        rarity: "RARE", clubId: "club_5",
        stats: { ATT: 35, MID: 66, DEF: 78, GK: 10 },
        stamina: 84, aggression: 74,
        image: "/images/knight_defender.jpg",
        trait: { name: "Cliff Guard", desc: "+10 DEF when defending wide touchlines." },
        lore: "Marina anchors the right flank, using her speed and sea-forged armor to deny wingers any space to cross."
    },
    {
        id: "zep_013", name: "Wren Ashford", position: "FW", rating: 66,
        rarity: "COMMON", clubId: "club_5",
        stats: { ATT: 66, MID: 52, DEF: 28, GK: 10 },
        stamina: 72, aggression: 70,
        image: "/images/knight_striker.jpg",
        trait: null,
        lore: "Wren Ashford runs like the gale wind but shoots like a gentle breeze — promising, not yet complete."
    },
    {
        id: "zep_014", name: "Kira Stormfield", position: "GK", rating: 63,
        rarity: "COMMON", clubId: "club_5",
        stats: { ATT: 10, MID: 12, DEF: 30, GK: 63 },
        stamina: 74, aggression: 55,
        image: "/images/knight_goalkeeper.jpg",
        trait: null,
        lore: "Kira keeps goal with both hands and no small amount of luck, which some say counts for everything."
    },
    {
        id: "zep_015", name: "Talon Squall", position: "FW", rating: 67,
        rarity: "COMMON", clubId: "club_5",
        stats: { ATT: 67, MID: 50, DEF: 28, GK: 10 },
        stamina: 75, aggression: 72,
        image: "/images/knight_striker.jpg",
        trait: null,
        lore: "A rapid wing prospect who uses unpredictable sudden changes of direction to throw off marking defenders."
    },
    {
        id: "zep_016", name: "Reef Waveborn", position: "MF", rating: 64,
        rarity: "COMMON", clubId: "club_5",
        stats: { ATT: 54, MID: 64, DEF: 52, GK: 10 },
        stamina: 76, aggression: 58,
        image: "/images/knight_midfielder.jpg",
        trait: null,
        lore: "Reef covers central midfield space with high work rate, supporting both defensive shifts and wide counters."
    },
    {
        id: "zep_017", name: "Sandy Gale", position: "DF", rating: 65,
        rarity: "COMMON", clubId: "club_5",
        stats: { ATT: 26, MID: 48, DEF: 65, GK: 10 },
        stamina: 78, aggression: 66,
        image: "/images/knight_defender.jpg",
        trait: null,
        lore: "Sandy provides sturdy cover on the left back position, executing clean tackles along the wet touchline."
    },
    {
        id: "zep_018", name: "Gale Current", position: "MF", rating: 63,
        rarity: "COMMON", clubId: "club_5",
        stats: { ATT: 52, MID: 63, DEF: 50, GK: 10 },
        stamina: 74, aggression: 52,
        image: "/images/knight_midfielder.jpg",
        trait: null,
        lore: "A coastal academy player with great stamina who assists in recycling possession in the middle third."
    }
];

// Assign images from team directories if available
const ignisFiles = fs.existsSync(path.join(process.cwd(), 'public', 'images', 'ignis')) 
    ? fs.readdirSync(path.join(process.cwd(), 'public', 'images', 'ignis')).sort() : [];
const zenithFiles = fs.existsSync(path.join(process.cwd(), 'public', 'images', 'zenith')) 
    ? fs.readdirSync(path.join(process.cwd(), 'public', 'images', 'zenith')).sort() : [];
const wildwoodFiles = fs.existsSync(path.join(process.cwd(), 'public', 'images', 'wildwood')) 
    ? fs.readdirSync(path.join(process.cwd(), 'public', 'images', 'wildwood')).sort() : [];
const solarisFiles = fs.existsSync(path.join(process.cwd(), 'public', 'images', 'solaris')) 
    ? fs.readdirSync(path.join(process.cwd(), 'public', 'images', 'solaris')).sort() : [];
const zephyrFiles = fs.existsSync(path.join(process.cwd(), 'public', 'images', 'zephyr')) 
    ? fs.readdirSync(path.join(process.cwd(), 'public', 'images', 'zephyr')).sort() : [];

let ignisIdx = 0;
let zenithIdx = 0;
let wildwoodIdx = 0;
let solarisIdx = 0;
let zephyrIdx = 0;

PLAYERS.forEach(p => {
    // Ensure workRate exists on every player
    if (!p.workRate) {
        p.workRate = p.rarity === 'LEGEND' || p.rarity === 'ELITE' ? 'High' : (p.stamina > 75 ? 'Medium' : 'Low');
    }

    if (!p.id.startsWith('leg_')) {
        if (p.clubId === 'club_1' && ignisFiles[ignisIdx]) {
            p.image = `/images/ignis/${ignisFiles[ignisIdx]}`;
            ignisIdx++;
        } else if (p.clubId === 'club_2' && zenithFiles[zenithIdx]) {
            p.image = `/images/zenith/${zenithFiles[zenithIdx]}`;
            zenithIdx++;
        } else if (p.clubId === 'club_3' && wildwoodFiles[wildwoodIdx]) {
            p.image = `/images/wildwood/${wildwoodFiles[wildwoodIdx]}`;
            wildwoodIdx++;
        } else if (p.clubId === 'club_4' && solarisFiles[solarisIdx]) {
            p.image = `/images/solaris/${solarisFiles[solarisIdx]}`;
            solarisIdx++;
        } else if (p.clubId === 'club_5' && zephyrFiles[zephyrIdx]) {
            p.image = `/images/zephyr/${zephyrFiles[zephyrIdx]}`;
            zephyrIdx++;
        }
    }
});

// Write cardsDatabase.js
const dbContent = `// Pitch Control - Full Knight Cards Database
// 5 Houses | 88 Players total (16-18 players per squad)

export const CLUBS = ${JSON.stringify(CLUBS, null, 4)};

export const PLAYERS = ${JSON.stringify(PLAYERS, null, 4)};
`;

fs.writeFileSync(
    path.join(process.cwd(), 'src', 'utils', 'cardsDatabase.js'),
    dbContent,
    'utf-8'
);
console.log('✅ Updated src/utils/cardsDatabase.js (88 players across 5 teams)');

// 3. GENERATE BackCharacterArtPrompt.md for non-legend / squad players
const nonLegendPlayers = PLAYERS.filter(p => !p.id.startsWith('leg_'));

let promptMd = `# Back Character AI Art Prompts — Pitch Control Squad Players

This file contains the complete AI image generation prompts (formatted for Midjourney, DALL-E 3, or Stable Diffusion) for all **${nonLegendPlayers.length} non-legend squad players** across the 5 Sovereign Houses.

Each prompt strictly enforces:
- **Style**: Vintage knight playing card portrait with ornate filigree frame and medieval heraldic background.
- **Armor**: House-themed medieval plate armor with crests and helm detail.
- **Soccer Equipment**: A classic round black-and-white paneled soccer ball on green grass pitch turf under or near their leather soccer boots.
- **Aspect Ratio & Resolution**: Optimized for **3:4 aspect ratio** (\`--ar 3:4\`) and high detail (\`x2\` scale).

---

`;

let count = 1;
nonLegendPlayers.forEach(p => {
    const club = CLUBS.find(c => c.id === p.clubId);
    let themeDesc = "";
    if (p.clubId === "club_1") {
        themeDesc = "smoldering magma-infused bronze and dark iron plate armor with flame-crested pauldrons, set against a smoldering volcanic stadium backdrop with embers";
    } else if (p.clubId === "club_2") {
        themeDesc = "gleaming polished silver and royal navy blue steel plate armor with ornate gold leaf scrollwork, set against a mountain spire stadium backdrop with royal heraldic banners";
    } else if (p.clubId === "club_3") {
        themeDesc = "emerald green and silver engraved leaf-patterned steel armor with oak branch crests, set against an ancient druidic forest arena pitch surrounded by giant elderwood trees";
    } else if (p.clubId === "club_4") {
        themeDesc = "golden-sun-embossed heavy brass and iron fortress plate armor with lion-and-sun shield studs, set against a sun-scorched stone citadel stadium backdrop";
    } else {
        themeDesc = "sea-blue and silver wind-sculpted chainmail and plate armor with falcon wing pauldrons, set against a windswept ocean cliff stadium backdrop with sea spray";
    }

    const posTerm = p.position === 'FW' ? 'soccer striker knight' : p.position === 'MF' ? 'soccer playmaker midfielder knight' : p.position === 'DF' ? 'soccer defender knight' : 'soccer goalkeeper knight';
    const actionDesc = p.position === 'FW' ? 'controlling a classic round black-and-white paneled soccer ball under their boot on green grass turf' : p.position === 'MF' ? 'passing a classic round black-and-white paneled soccer ball across green pitch turf' : p.position === 'DF' ? 'standing firmly with a leather boot atop a classic round black-and-white paneled soccer ball on grass' : 'holding a classic round black-and-white paneled soccer ball securely in heavy leather goalkeeper gloves';

    promptMd += `### ${count}. ${p.name} (${p.position} • OVR ${p.rating} • ${club.name})
- **Player ID**: \`${p.id}\`
- **Rarity**: ${p.rarity}
> **Prompt:**  
> A vintage playing card portrait of ${p.name} as a noble ${posTerm} in ${themeDesc}. They are ${actionDesc}. Ornate heraldic card border frame, gold and silver filigree scrollwork trim, vintage parchment paper texture, high fantasy oil painting illustration style --ar 3:4

---

`;
    count++;
});

fs.writeFileSync(
    path.join(process.cwd(), 'public', 'prompts', 'BackCharacterArtPrompt.md'),
    promptMd,
    'utf-8'
);
console.log('✅ Generated public/prompts/BackCharacterArtPrompt.md');

// 4. GENERATE Lore.md (Master World Story)
const loreMd = `# THE SOVEREIGN CHRONICLE: THE AGE OF PITCH CONTROL
*An Expansive History of Aurelia, the Lex Calibrata of 1880, and the Five Sovereign Houses*

---

## CHAPTER I: THE BLOODSHED OF OLD AURELIA

For five centuries, the continent of Aurelia was torn apart by perpetual feudal warfare. The great fiefdoms—the geothermal clans of the Southern Ridge, the highborn imperial dynasts of the Zenith Peak, the druidic wardens of the Sylvan Forests, the fortress garrisons of the Eastern Steppes, and the mariner lords of the Western Coastlines—fought endless bloody wars for territory, mineral rights, and sacred ley-line control.

Trench warfare, siege catapults, and dragon-fire armor devastated the realm. Whole generations of valiant knights perished in mud and flame, leaving fields fertile only with rusted mail and forgotten swords.

By the winter of 1879, the realm reached a breaking point. The Great Frost of the Southern Ridge caused food shortages across all five realms, while a devastating dragon war exhausted the coffers of the Zenith throne. It became clear to the rulers of Aurelia that if war continued, there would be no realm left to rule.

---

## CHAPTER II: THE GREAT CALIBRATION OF 1880 & THE LEX CALIBRATA

In the spring of 1880, High Chancellor Cassian Aurelius invited the leaders of all major warlord houses to the neutral ground of the Zenith Mountain Spire. There, surrounded by snowy peaks and ancient marble archways, the leaders spent forty days and forty nights negotiating a permanent peace.

The result of this historical summit was **The Great Calibration of 1880** and the promulgation of the **Lex Calibrata**.

Under the Lex Calibrata:
1. **Physical War is Outlawed**: Open battlefield combat, military invasions, and bloodshed between sovereign houses were permanently banned on pain of total realm outlawry.
2. **Creation of Pitch Control**: All territorial, political, and honor disputes were transitioned into a high-stakes tactical card jousting sport known as **Pitch Control**.
3. **The 5-Round Duel Protocol**: Battles would take place on sacred grass pitches using standardized 11-player knight rosters. Each match would be played across 5 tactical rounds testing four fundamental martial stats:
   - **ATT (Attack)**: Penetration, shot velocity, and forward surge momentum.
   - **MID (Midfield)**: Spatial control, passing geometry, and tactical vision.
   - **DEF (Defense)**: Iron tackle discipline, interception instinct, and structural positioning.
   - **GK (Goalkeeping)**: Unyielding reflexes, shot-stopping aura, and aerial interception.
4. **The Enshrined Cards**: Each knight's combat capability, armor weight, tactical discipline, and mental fortitude were abstracted into a sovereign playing card registered in the Royal Codex.

---

## CHAPTER III: THE FIVE SOVEREIGN HOUSES & THEIR PITCH COLOSSEUMS

### 1. IGNIS WANDERERS — *The Volcanic Furnace*
- **Moniker**: Ignis
- **Colosseum**: *The Ember Cauldron*
- **Philosophy**: *Route One Direct (ATT Focus)*
- **Motto**: *"We do not play with fire — we ARE the fire."*
- **Lore & Identity**: Born in the subterranean steam-bays and lava foundries of the Southern Ridge, Ignis Wanderers were founded by geothermal engineers and magma-smiths. Their pitch is suspended directly over an active volcanic magma vault, causing steam to vent through the turf during matches. Ignis plays a terrifying direct style. Led by **Sir Tristan Fireblade**—whose boots leave scorch marks on the turf—and the unbroken **Sir Lamorak**, Ignis treats every long ball as a mortar shell designed to melt opponent backlines.

### 2. ZENITH KNIGHTS — *The Imperial Spire*
- **Moniker**: Zenith
- **Colosseum**: *The Grand Spire Coliseum*
- **Philosophy**: *Tiki-Taka Possession (MID Focus)*
- **Motto**: *"From the highest citadel, we descend upon all."*
- **Lore & Identity**: The undisputed aristocracy of Aurelia. Formed by imperial decree of the Aurelius dynasty, Zenith fields highborn knights trained from childhood in the imperial academies. Sitting atop the highest peak in Aurelia, Zenith combines exquisite passing geometry with terrifying individual quality. Featuring superstars like **Sir Lancelot the Swift** (the fast striker in history), **Sir Bors the Iron Bastion** (whose goalkeeper grip has never failed), **Erling the Dragon Striker** (clad in golden dragon-scale armor), and **Crown Prince Arturo**, Zenith plays tiki-taka football with royal superiority.

### 3. WILDWOOD UNITED — *The Forest Sanctuary*
- **Moniker**: Wildwood
- **Colosseum**: *The Forest Arena*
- **Philosophy**: *Possession Control (MID Focus)*
- **Motto**: *"Roots in the soil, hearts in the match."*
- **Lore & Identity**: Nestled deep in the ancient Sylvan Forest, Wildwood United was established by druidic rangers and woodland cartographers. Their pitch is surrounded by 300-year-old elderwood trees whose canopy forms a cathedral ceiling. Wildwood plays a fluid, organic style based on passing triangles and spatial harmony. Under **Jude the Playmaker**, **Sir Ywain the Lionheart**, **Sir Gawain the Verdant**, and **Dame Isolde**, Wildwood weaves a spiderweb of short passes that starves opponents of possession before delivering a surgical killer ball.

### 4. SOLARIS FC — *The Sun-Scorched Citadel*
- **Moniker**: Solaris
- **Colosseum**: *The Citadel Grounds*
- **Philosophy**: *Gegenpressing & Low Block (DEF Focus)*
- **Motto**: *"The sun sets only for those who stop fighting."*
- **Lore & Identity**: Solaris FC emerged from the sun-drenched Eastern Steppes, where garrisons defended stone fortresses against relentless sieges. Their stadium is an ancient sandstone fortress whose high walls trap midday heat. Solaris soccer is built on military discipline, low-block defensive phalanxes, and aggressive counter-pressing. Governed by **Sir Kay the Seneschal**, **Sir Hector of the Citadel**, **Sir Palamedes**, and **Commander Thaddeus Sol**, Solaris repels opponent attacks like waves crashing against stone before launching lethal set-piece catapults.

### 5. ZEPHYR ROVERS — *The Coastal Mariners*
- **Moniker**: Zephyr
- **Colosseum**: *The Gale Grounds*
- **Philosophy**: *Wing Attack & Counter-Press (ATT/DF Hybrid)*
- **Motto**: *"We ride the wind. The wind does not ride us."*
- **Lore & Identity**: Hailing from the ocean bluffs of the Western Coastlines, Zephyr Rovers are intrepid sea-knights and coastal wardens. Their pitch rests on a cliff edge where howling sea gales test every aerial cross. Zephyr specializes in wide attacking speed and elite defensive walls. Anchored by legendary defenders **Dame Brienne the Ironclad** (the Oathkeeper), **Sir Percival the Pure** (the Aegis Wall), **Sir Morien the Shadow Crusader**, and **Sir Bedivere**, Zephyr absorbs pressure with impenetrable grace before springing **Sir Gareth Beaumains** and **Aero Tempest** down the touchline like naval storm arrows.

---

## CHAPTER IV: THE SOVEREIGN LEGENDS & INTERCONNECTED DESTINIES

The story of Pitch Control is driven by the personal rivalries and chivalric oaths of its enshrinees:

- **The Duel of Fire and Steel**: Sir Tristan Fireblade (Ignis) and Dame Brienne the Ironclad (Zephyr) met in the legendary 1884 Final at Zenith Spire. Tristan's scorching magma volley hit Brienne's steel shield with such force that the pitch reverberated for ten seconds. Brienne held her ground, establishing the eternal rule that no forward can break an Oathkeeper without paying in blood.
- **The Royal Academy Schism**: Jude the Playmaker and Crown Prince Arturo were educated in the same imperial tactical academy. When Arturo inherited Zenith's captaincy, Jude refused to play second fiddle and migrated to Wildwood United, bringing imperial passing geometry to the druidic forest. Matches between Zenith and Wildwood are known as the *Schism Derbies*.
- **The Beast of the Dragon Scale**: Erling joined Zenith Knights after taming a rogue dragon in the Northern Frostlands. His golden dragon-scale armor grants him terrifying explosive force on opening goals. Only Sir Bors and Sir Percival have ever blocked his dragon-surge shot in open play.
- **The Questing Scholar**: Sir Palamedes of Solaris FC spent three years traveling between all five houses, documenting every knight's movement pattern into the *Master Codex of Pitch Coordinates*. His insights allow Solaris to anticipate opponent tactical cards before they are played.

---

## CHAPTER V: THE SOVEREIGN CODEX TOURNAMENT

Today, managers from across Aurelia take command of these five legendary houses. By drafting squads from the 88 registered sovereign knights, managing stamina, timing passive traits, and mastering the 5-round tactical duel, managers fight for the ultimate prize: **The Sovereign Codex Crown**.

The pitch is set. The heraldic banners ripple in the wind. The cards are drawn.

*Let the duels begin!*
`;

const docsDir = path.join(process.cwd(), 'public', 'docs');
if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
}
fs.writeFileSync(
    path.join(docsDir, 'Lore.md'),
    loreMd,
    'utf-8'
);
fs.writeFileSync(
    path.join(process.cwd(), 'public', 'Lore.md'),
    loreMd,
    'utf-8'
);
console.log('✅ Generated public/docs/Lore.md and public/Lore.md');
