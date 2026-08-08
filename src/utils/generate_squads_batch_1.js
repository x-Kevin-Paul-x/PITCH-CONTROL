import fs from 'fs';
import path from 'path';

// Define the traits
const TRAITS = {
    'Poacher': { id: 'Poacher', name: 'Poacher', desc: '+20 ATT if opponent plays a GK card' },
    'Captain': { id: 'Captain', name: 'Captain', desc: '+10 to all stats if played in Round 5' },
    'Super Sub': { id: 'Super Sub', name: 'Super Sub', desc: '+15 to active stat if drawn from bench' },
    'Enforcer': { id: 'Enforcer', name: 'Enforcer', desc: "Win a DEF duel to halve opponent's next card stats" },
    'Playmaker': { id: 'Playmaker', name: 'Playmaker', desc: 'Win a MID duel to choose next round\'s attribute' },
    'False Nine': { id: 'False Nine', name: 'False Nine', desc: 'Can use MID stat instead of ATT stat on Attack rolls' },
    'Wall': { id: 'Wall', name: 'Wall', desc: 'Wins all ties on DEF rolls' }
};

// Define the 10 clubs from league_blueprint.json
const CLUBS = [
    { id: 'club_1', name: 'Aegis Citadel FC', managerName: 'Enzo Bolt', starPlayerId: 'p_1', rivalStarId: 'p_21', rivalStarName: 'Zane Bow' },
    { id: 'club_2', name: 'Cyber Nexus FC', managerName: 'Axel Howl', starPlayerId: 'p_21', rivalStarId: 'p_161', rivalStarName: 'Matteo Glacier' },
    { id: 'club_3', name: 'Valhalla Sentinels', managerName: 'Hugo Wolf', starPlayerId: 'p_41', rivalStarId: 'p_301', rivalStarName: 'Jaxon Hammer' },
    { id: 'club_4', name: 'Helios Sovereign', managerName: 'Gulliver Dune', starPlayerId: 'p_61', rivalStarId: 'p_41', rivalStarName: 'Barnaby Capella' },
    { id: 'club_5', name: 'Crystalline Palace', managerName: 'Leander Wind', starPlayerId: 'p_81', rivalStarId: 'p_201', rivalStarName: 'Atticus Roar' },
    { id: 'club_6', name: 'Solaris Vanguard', managerName: 'Haruto Finch', starPlayerId: 'p_101', rivalStarId: 'p_341', rivalStarName: 'Leopold Vassal' },
    { id: 'club_7', name: 'Zenith Ascendants', managerName: 'Clara Fletcher', starPlayerId: 'p_121', rivalStarId: 'p_81', rivalStarName: 'Barnaby Compiler' },
    { id: 'club_8', name: 'Aethelgard Royal FC', managerName: 'Javier Lake', starPlayerId: 'p_141', rivalStarId: 'p_241', rivalStarName: 'Reginald Lake' },
    { id: 'club_9', name: 'Titan Foundry FC', managerName: 'Caspian Zephyr', starPlayerId: 'p_161', rivalStarId: 'p_381', rivalStarName: 'Zephyr Matrix' },
    { id: 'club_10', name: 'Ironclad Harbors', managerName: 'Simeon Sword', starPlayerId: 'p_181', rivalStarId: 'p_121', rivalStarName: 'Fabian Thunder' }
];

const players = [];

// Helper to add player
function addPlayer(playerData) {
    players.push(playerData);
}

// Generate the squads data
// We will populate 20 players for each club.
// Let's write out the configuration for the players.

const SQUAD_TEMPLATES = [
    // --- Aegis Citadel FC (club_1) ---
    [
        {
            name: "Benedict Williams",
            position: "FW",
            rarity: "LEGEND",
            stats: { ATT: 145, MID: 75, DEF: 40, GK: 10 },
            trait: "Captain",
            workRate: "High",
            stamina: 95,
            aggression: 80,
            lore: "A generational talent and the captain of Aegis Citadel FC. Known affectionately as the Shield at The Bastion Citadel, he famously secured his legacy by scoring a 45-yard volley against rival star [[p_21|Zane Bow]]. Under the guidance of Manager Enzo Bolt, he has fully mastered the Low Block Defense philosophy."
        },
        {
            name: "Bruce Vance",
            position: "FW",
            rarity: "ELITE",
            stats: { ATT: 125, MID: 70, DEF: 35, GK: 10 },
            trait: "Poacher",
            workRate: "Medium",
            stamina: 85,
            aggression: 75,
            lore: "Bruce Vance is a clinical striker who thrives under the tactical setups of Manager Enzo Bolt. Often supporting [[p_1|Benedict Williams]] in two-striker systems, his movement off the ball creates crucial space in tight defenses. He is praised by the coaching staff for his dedication to defensive pressing."
        },
        {
            name: "Keith Sky",
            position: "FW",
            rarity: "RARE",
            stats: { ATT: 110, MID: 60, DEF: 30, GK: 10 },
            trait: "Super Sub",
            workRate: "High",
            stamina: 90,
            aggression: 65,
            lore: "Recruited by Enzo Bolt as an impact forward, Keith Sky uses his raw acceleration to bypass fatigued defenders. He operates in close coordination with [[p_1|Benedict Williams]] to sustain Aegis's rare counter-offensive pushes. His tactical discipline makes him a trusted option late in matches."
        },
        {
            name: "Logan Jet",
            position: "FW",
            rarity: "COMMON",
            stats: { ATT: 95, MID: 50, DEF: 25, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 70,
            lore: "Logan Jet is a hardworking squad player who came up through the Aegis youth academy. Discovered by Chief Analyst Fang Byte, he spends hours studying [[p_1|Benedict Williams]]'s positioning on the hard-light simulator. Off the pitch, he is an avid collector of antique copper coins."
        },
        {
            name: "Jax Sol",
            position: "FW",
            rarity: "COMMON",
            stats: { ATT: 90, MID: 55, DEF: 25, GK: 10 },
            trait: null,
            workRate: "Low",
            stamina: 70,
            aggression: 55,
            lore: "Jax Sol provides vital depth to the Aegis frontline during intense league campaigns. He works closely with Fang Byte to analyze opposition low blocks and improve his link-up play. Jax is highly superstitious and always laces his left boot first before entering the pitch."
        },
        {
            name: "Vance Sol",
            position: "MF",
            rarity: "ELITE",
            stats: { ATT: 60, MID: 110, DEF: 60, GK: 10 },
            trait: "Playmaker",
            workRate: "High",
            stamina: 90,
            aggression: 80,
            lore: "Brought to Aegis Citadel FC to anchor the central channels, Vance Sol is the engine room of Enzo Bolt's midfield. He works tirelessly to break up attacks and feed balls directly to [[p_1|Benedict Williams]]. His positional awareness is highly praised by the technical staff."
        },
        {
            name: "Knox Steel",
            position: "MF",
            rarity: "RARE",
            stats: { ATT: 55, MID: 95, DEF: 50, GK: 10 },
            trait: "Captain",
            workRate: "Medium",
            stamina: 80,
            aggression: 70,
            lore: "Knox Steel is a composed midfielder who commands respect on the pitch. Under Manager Enzo Bolt, he has adapted to a more defensive role, shielding the backline and assisting [[p_1|Benedict Williams]] with transition play. He is known to study mechanical blueprints to relax before games."
        },
        {
            name: "Beck Thorne",
            position: "MF",
            rarity: "RARE",
            stats: { ATT: 50, MID: 100, DEF: 50, GK: 10 },
            trait: "Playmaker",
            workRate: "Medium",
            stamina: 85,
            aggression: 60,
            lore: "Beck Thorne is an elegant passer who provides the creative spark in Aegis's midfield. He maintains a close connection on the pitch with [[p_1|Benedict Williams]], looking to trigger quick transitions. Enzo Bolt values his calmness under high-pressing situations."
        },
        {
            name: "Cruz Iron",
            position: "MF",
            rarity: "COMMON",
            stats: { ATT: 45, MID: 80, DEF: 45, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 65,
            lore: "Cruz Iron is an industrious midfielder who helps maintain the central blockade. Originally a steel welder in the industrial sector, he was signed after impressing Enzo Bolt in an open trial. He rarely joins the attack, focusing entirely on spatial containment."
        },
        {
            name: "Drake Taylor",
            position: "MF",
            rarity: "COMMON",
            stats: { ATT: 40, MID: 85, DEF: 45, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 70,
            aggression: 70,
            lore: "Drake Taylor is a steady presence who excels in keeping possession under pressure. He spends his training sessions simulating tight-space scenarios with Chief Analyst Fang Byte. He wears a lucky copper wristband in honor of his father's mining days."
        },
        {
            name: "Gavin Bright",
            position: "MF",
            rarity: "COMMON",
            stats: { ATT: 50, MID: 75, DEF: 45, GK: 10 },
            trait: null,
            workRate: "Low",
            stamina: 65,
            aggression: 60,
            lore: "Gavin Bright is a technical midfielder who provides support during squad rotations. He works hard to emulate the defensive positioning of star midfielder [[p_1|Benedict Williams]] and follows Enzo Bolt's strict physical guidelines. He is an amateur painter of coastal landscapes."
        },
        {
            name: "Kaelen Finch",
            position: "DF",
            rarity: "ELITE",
            stats: { ATT: 35, MID: 70, DEF: 125, GK: 10 },
            trait: "Wall",
            workRate: "High",
            stamina: 95,
            aggression: 85,
            lore: "Kaelen Finch is a mountain of a defender who forms the cornerstone of Enzo Bolt's Low Block Defense. He works in tandem with [[p_1|Benedict Williams]] to clear aerial threats and lock down the box. Opposing forwards find it almost impossible to win physical duels against him."
        },
        {
            name: "Devin Kepler",
            position: "DF",
            rarity: "RARE",
            stats: { ATT: 30, MID: 60, DEF: 110, GK: 10 },
            trait: "Enforcer",
            workRate: "Medium",
            stamina: 80,
            aggression: 90,
            lore: "Devin Kepler is a ferocious defender known for his bone-crunching tackles. He is Enzo Bolt's primary weapon to neutralize fast wingers, shielding [[p_1|Benedict Williams]] from having to drop deep. His aggressive style has made him a fan favorite at the Bastion Citadel."
        },
        {
            name: "Brody Flare",
            position: "DF",
            rarity: "RARE",
            stats: { ATT: 25, MID: 65, DEF: 110, GK: 10 },
            trait: "Wall",
            workRate: "Medium",
            stamina: 85,
            aggression: 75,
            lore: "Brody Flare provides absolute reliability in the heart of the Aegis defense. He organizes the low block lines under the instruction of Enzo Bolt, ensuring that [[p_1|Benedict Williams]] can stay forward. His intercepting skill is refined through daily physical drilling."
        },
        {
            name: "Keegan Jones",
            position: "DF",
            rarity: "COMMON",
            stats: { ATT: 25, MID: 50, DEF: 95, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 80,
            lore: "Keegan Jones is a gritty defender who spent years in the lower amateur circuits before being noticed by Fang Byte. He trains endlessly to match the tactical speed of [[p_1|Benedict Williams]]. He keeps a small gear token in his sock for luck during high-stakes games."
        },
        {
            name: "Ronan Ramirez",
            position: "DF",
            rarity: "COMMON",
            stats: { ATT: 20, MID: 55, DEF: 95, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 70,
            aggression: 85,
            lore: "Ronan Ramirez is a tough fullback who focuses entirely on block containment. He relies on Chief Analyst Fang Byte's tactical charts to study opponent wing patterns. Outside of football, he helps build scale models of historic Aegis fortresses."
        },
        {
            name: "Declan Void",
            position: "DF",
            rarity: "COMMON",
            stats: { ATT: 30, MID: 45, DEF: 95, GK: 10 },
            trait: null,
            workRate: "Low",
            stamina: 60,
            aggression: 75,
            lore: "Declan Void is a defensive backup who offers physical presence in the air. He spends his mornings studying the positioning of [[p_1|Benedict Williams]] to understand how to transition out of deep pressure. He is an avid player of strategy board games."
        },
        {
            name: "Kian Bold",
            position: "GK",
            rarity: "RARE",
            stats: { ATT: 10, MID: 10, DEF: 30, GK: 160 },
            trait: "Super Sub",
            workRate: "Medium",
            stamina: 85,
            aggression: 60,
            lore: "Kian Bold is a highly responsive goalkeeper who serves as Aegis's last line of defense. He communicates constantly with Enzo Bolt to organize the low block, protecting [[p_1|Benedict Williams]]'s offensive leads. His sharp reflexes have saved Aegis in numerous close derbies."
        },
        {
            name: "Rowan Stone",
            position: "GK",
            rarity: "COMMON",
            stats: { ATT: 10, MID: 10, DEF: 20, GK: 140 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 50,
            lore: "Rowan Stone is a backup goalkeeper who represents the working-class roots of the club. Discovered by Fang Byte in the harbor docks, he works tirelessly to improve his diving range. He wears faded green wristbands as a personal superstition."
        },
        {
            name: "Cassian Shield",
            position: "GK",
            rarity: "COMMON",
            stats: { ATT: 10, MID: 10, DEF: 25, GK: 135 },
            trait: null,
            workRate: "Low",
            stamina: 70,
            aggression: 55,
            lore: "Cassian Shield provides security in the goalkeeper rotation for Aegis. He trains hard under Enzo Bolt's strict defensive drills to master post positioning. Off the pitch, he spends hours studying aeromechanics and flying amateur drones."
        }
    ],
    // --- Cyber Nexus FC (club_2) ---
    [
        {
            name: "Zane Bow",
            position: "FW",
            rarity: "LEGEND",
            stats: { ATT: 145, MID: 75, DEF: 40, GK: 10 },
            trait: "Poacher",
            workRate: "High",
            stamina: 95,
            aggression: 70,
            lore: "Zane Bow is the crown jewel of Cyber Nexus, possessing a neural-linked targeting visor that predicts ball trajectories. In the tense 1882 championship match, he scored a brilliant curler past [[p_161|Matteo Glacier]], answering Axel Howl's tactical call. Bow spends his off-time coding custom path-finding algorithms to refine his positioning."
        },
        {
            name: "Lysander Crown",
            position: "FW",
            rarity: "ELITE",
            stats: { ATT: 125, MID: 70, DEF: 35, GK: 10 },
            trait: "Poacher",
            workRate: "High",
            stamina: 90,
            aggression: 65,
            lore: "Lysander Crown is an elite winger whose speed stretches opposing defenses. He works in perfect synchronization with [[p_21|Zane Bow]], creating overlap opportunities that manager Axel Howl exploits. His technical proficiency makes him a constant threat in transition play."
        },
        {
            name: "Gideon Sato",
            position: "FW",
            rarity: "RARE",
            stats: { ATT: 110, MID: 60, DEF: 30, GK: 10 },
            trait: "False Nine",
            workRate: "Medium",
            stamina: 80,
            aggression: 60,
            lore: "Gideon Sato is a versatile forward who often drops deep to link midfield possession. His clever runs open up channels for [[p_21|Zane Bow]] to exploit in the final third. Axel Howl values his high spatial intelligence in possession control setups."
        },
        {
            name: "Simeon Byte",
            position: "FW",
            rarity: "COMMON",
            stats: { ATT: 95, MID: 50, DEF: 25, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 55,
            lore: "Simeon Byte is a hardworking forward who came through the Cyber Nexus academy. Discovered by Lucian Nova, he uses data-driven reports to analyze gaps in opponent backlines to assist [[p_21|Zane Bow]]. He is known to play competitive retro video games before matches."
        },
        {
            name: "Thaddeus Sol",
            position: "FW",
            rarity: "COMMON",
            stats: { ATT: 90, MID: 55, DEF: 25, GK: 10 },
            trait: null,
            workRate: "Low",
            stamina: 70,
            aggression: 50,
            lore: "Thaddeus Sol provides reliable offensive depth during intensive tournaments. He works closely with Lucian Nova to correct his run timings and support [[p_21|Zane Bow]]. He always keeps a copper data chip in his left pocket for good luck."
        },
        {
            name: "Tobias Forest",
            position: "MF",
            rarity: "ELITE",
            stats: { ATT: 60, MID: 110, DEF: 60, GK: 10 },
            trait: "Playmaker",
            workRate: "High",
            stamina: 95,
            aggression: 75,
            lore: "Tobias Forest is the midfield conductor for Cyber Nexus FC. Under Axel Howl's possession control system, he maintains a 98% passing accuracy, constantly feeding line-breaking passes to [[p_21|Zane Bow]]. The technical department ranks his neural processing speed among the highest in the league."
        },
        {
            name: "Dominic Adams",
            position: "MF",
            rarity: "RARE",
            stats: { ATT: 55, MID: 95, DEF: 50, GK: 10 },
            trait: "Captain",
            workRate: "Medium",
            stamina: 85,
            aggression: 70,
            lore: "Dominic Adams is a veteran midfielder who controls the tempo of the match. He acts as Axel Howl's voice on the pitch, translating complex possession tactics and organizing support for [[p_21|Zane Bow]]. He is an avid collector of historical Spatian military maps."
        },
        {
            name: "Sebastian Miller",
            position: "MF",
            rarity: "RARE",
            stats: { ATT: 50, MID: 100, DEF: 50, GK: 10 },
            trait: "Playmaker",
            workRate: "Medium",
            stamina: 80,
            aggression: 65,
            lore: "Sebastian Miller uses his exceptional vision to slice through low blocks. He works closely with [[p_21|Zane Bow]] to orchestrate dynamic attacking triangles. He spent his early career as an optical alignment engineer in the processor factories."
        },
        {
            name: "Julian Wave",
            position: "MF",
            rarity: "COMMON",
            stats: { ATT: 45, MID: 80, DEF: 45, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 60,
            lore: "Julian Wave is a consistent squad midfielder who excels at keeping short passing lanes open. Discovered by Lucian Nova, he trains extensively on holographic simulator grids. He is superstitious about wearing a blue sweatband on his right wrist."
        },
        {
            name: "Adrian Davis",
            position: "MF",
            rarity: "COMMON",
            stats: { ATT: 40, MID: 85, DEF: 45, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 70,
            aggression: 70,
            lore: "Adrian Davis is a defensive midfielder who focuses on recycling possession. Under Axel Howl's direction, he helps stabilize the center to free up [[p_21|Zane Bow]] from defensive duties. Outside of soccer, he builds custom water-cooled computers."
        },
        {
            name: "Dante Shores",
            position: "MF",
            rarity: "COMMON",
            stats: { ATT: 50, MID: 75, DEF: 45, GK: 10 },
            trait: null,
            workRate: "Low",
            stamina: 65,
            aggression: 55,
            lore: "Dante Shores is a technical midfielder who provides valuable squad depth during congested fixtures. He trains hard to match the tactical movement of [[p_21|Zane Bow]] and follows Axel Howl's strict guidelines. He relaxes by playing chess."
        },
        {
            name: "Marco Thunder",
            position: "DF",
            rarity: "ELITE",
            stats: { ATT: 35, MID: 70, DEF: 125, GK: 10 },
            trait: "Wall",
            workRate: "High",
            stamina: 90,
            aggression: 80,
            lore: "Marco Thunder is an imposing center-back who dominates the defensive third. He works in tandem with [[p_21|Zane Bow]]'s attacking line, providing solid security that allows the team to commit players forward. Axel Howl praises his aerial interception rate."
        },
        {
            name: "Enzo Shields",
            position: "DF",
            rarity: "RARE",
            stats: { ATT: 30, MID: 60, DEF: 110, GK: 10 },
            trait: "Enforcer",
            workRate: "Medium",
            stamina: 85,
            aggression: 85,
            lore: "Enzo Shields is a fierce defender whose physical tackles disrupt opposition counters. He acts as the main security guard for Cyber Nexus's high-possession block, shielding [[p_21|Zane Bow]] from turnover pressure. He spends his off-time studying neural networks."
        },
        {
            name: "Matteo Trickster",
            position: "DF",
            rarity: "RARE",
            stats: { ATT: 25, MID: 65, DEF: 110, GK: 10 },
            trait: "Wall",
            workRate: "Medium",
            stamina: 80,
            aggression: 75,
            lore: "Matteo Trickster is a calm fullback who excels at positioning and intercepting passes. He maintains the defensive shape under Axel Howl's possession system, allowing [[p_21|Zane Bow]] to focus on deep runs. He spends hours reviewing game tapes with Lucian Nova."
        },
        {
            name: "Nico Pride",
            position: "DF",
            rarity: "COMMON",
            stats: { ATT: 25, MID: 50, DEF: 95, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 70,
            lore: "Nico Pride is a reliable defender who was signed from a local cyber-athletics club. Discovered by Lucian Nova, he trains diligently to emulate the tactical vision of [[p_21|Zane Bow]]. He is known to carry a lucky silver bolt in his kit bag."
        },
        {
            name: "Giovanni Roberts",
            position: "DF",
            rarity: "COMMON",
            stats: { ATT: 20, MID: 55, DEF: 95, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 70,
            aggression: 80,
            lore: "Giovanni Roberts is a disciplined defender who focuses on blocking wing crosses. He relies heavily on Lucian Nova's tactical reports to adjust his marking angles. He enjoys designing holographic art for the stadium screens."
        },
        {
            name: "Angelo Wolf",
            position: "DF",
            rarity: "COMMON",
            stats: { ATT: 30, MID: 45, DEF: 95, GK: 10 },
            trait: null,
            workRate: "Low",
            stamina: 60,
            aggression: 75,
            lore: "Angelo Wolf is a physical defender who provides backup depth for the backline. He studies the movement patterns of [[p_21|Zane Bow]] to coordinate long ball clearances out of the defensive block. He is an amateur robotics enthusiast."
        },
        {
            name: "Rico Hawthorne",
            position: "GK",
            rarity: "RARE",
            stats: { ATT: 10, MID: 10, DEF: 30, GK: 160 },
            trait: "Super Sub",
            workRate: "Medium",
            stamina: 85,
            aggression: 55,
            lore: "Rico Hawthorne is a highly analytical goalkeeper who acts as the distributor in Axel Howl's possession build-ups. He coordinates with [[p_21|Zane Bow]] to initiate counter-offenses from the back. His calm demeanor has earned him immense praise from fans."
        },
        {
            name: "Antonio Blackwood",
            position: "GK",
            rarity: "COMMON",
            stats: { ATT: 10, MID: 10, DEF: 20, GK: 140 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 50,
            lore: "Antonio Blackwood is a backup goalkeeper who came through the metropolitan junior leagues. Discovered by Lucian Nova, he works hard to perfect his ball distribution. He wears a specific blue glove on his left hand for superstition."
        },
        {
            name: "Carlos Redwood",
            position: "GK",
            rarity: "COMMON",
            stats: { ATT: 10, MID: 10, DEF: 25, GK: 135 },
            trait: null,
            workRate: "Low",
            stamina: 70,
            aggression: 60,
            lore: "Carlos Redwood provides backup support in the goalkeeper slot for Cyber Nexus. He trains extensively under Axel Howl's possession drills to improve his sweeping range. He spends his free time constructing model skyships."
        }
    ],
    // --- Valhalla Sentinels (club_3) ---
    [
        {
            name: "Barnaby Capella",
            position: "FW",
            rarity: "LEGEND",
            stats: { ATT: 145, MID: 75, DEF: 40, GK: 10 },
            trait: "Captain",
            workRate: "High",
            stamina: 95,
            aggression: 85,
            lore: "Known as the Peak Hunter of Valhalla, Barnaby Capella is an aerially dominant forward who thrives in freezing high-altitude matches. He famously headed home a last-minute corner over the defensive wall of [[p_301|Jaxon Hammer]] to seal the Peak Derby under Hugo Wolf. Capella trains by running up the volcanic slopes of the Sentinel range."
        },
        {
            name: "Mateo Frost",
            position: "FW",
            rarity: "ELITE",
            stats: { ATT: 125, MID: 70, DEF: 35, GK: 10 },
            trait: "Poacher",
            workRate: "Medium",
            stamina: 85,
            aggression: 80,
            lore: "Mateo Frost is a robust striker who excels in physical hold-up play under Hugo Wolf. He forms a devastating strike partnership with [[p_41|Barnaby Capella]], occupying defenders with his sheer strength. His high work rate in the box has been commended by the coaching staff."
        },
        {
            name: "Diego Winter",
            position: "FW",
            rarity: "RARE",
            stats: { ATT: 110, MID: 60, DEF: 30, GK: 10 },
            trait: "Super Sub",
            workRate: "High",
            stamina: 90,
            aggression: 75,
            lore: "Diego Winter is an explosive winger who provides width to Valhalla's attacks. Under Hugo Wolf's low block system, he acts as the primary outlet, targeting [[p_41|Barnaby Capella]] with high-velocity crosses. He is a passionate winter sports athlete off the pitch."
        },
        {
            name: "Santiago Snow",
            position: "FW",
            rarity: "COMMON",
            stats: { ATT: 95, MID: 50, DEF: 25, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 70,
            lore: "Santiago Snow is a dedicated young forward who progressed through Valhalla's academy. Discovered by Oliver Rivet, he spends hours studying [[p_41|Barnaby Capella]]'s heading technique on the tactical grid. He enjoys wood carving during the off-season."
        },
        {
            name: "Alejandro Glacier",
            position: "FW",
            rarity: "COMMON",
            stats: { ATT: 90, MID: 55, DEF: 25, GK: 10 },
            trait: null,
            workRate: "Low",
            stamina: 70,
            aggression: 60,
            lore: "Alejandro Glacier provides offensive reinforcement in Valhalla's squad rotation. He works closely with Oliver Rivet to improve his spatial awareness and support [[p_41|Barnaby Capella]]. He wears a lucky carved bone amulet during matches."
        },
        {
            name: "Javier Ice",
            position: "MID",
            rarity: "ELITE",
            stats: { ATT: 60, MID: 110, DEF: 60, GK: 10 },
            trait: "Playmaker",
            workRate: "High",
            stamina: 90,
            aggression: 80,
            lore: "Javier Ice is the midfield engine for Valhalla Sentinels. He thrives in Hugo Wolf's defensive system, covering massive ground to intercept opposition passes and launch long-distance direct balls to [[p_41|Barnaby Capella]]. The staff values his immense stamina and leadership."
        },
        {
            name: "Miguel Stone",
            position: "MF",
            rarity: "RARE",
            stats: { ATT: 55, MID: 95, DEF: 50, GK: 10 },
            trait: "Captain",
            workRate: "Medium",
            stamina: 80,
            aggression: 75,
            lore: "Miguel Stone is a battle-hardened midfielder who anchors Valhalla's central channels. He helps enforce Hugo Wolf's strict defensive discipline, allowing [[p_41|Barnaby Capella]] to remain high up the pitch. He is known to study Nordic history to relax."
        },
        {
            name: "Luis Rock",
            position: "MF",
            rarity: "RARE",
            stats: { ATT: 50, MID: 100, DEF: 50, GK: 10 },
            trait: "Playmaker",
            workRate: "Medium",
            stamina: 85,
            aggression: 65,
            lore: "Luis Rock is a creative passer who orchestrates transitions from deep defensive blocks. He maintains an excellent connection with [[p_41|Barnaby Capella]], targeting him with vertical direct launches. Hugo Wolf praises his resilience in freezing conditions."
        },
        {
            name: "Manuel Clay",
            position: "MF",
            rarity: "COMMON",
            stats: { ATT: 45, MID: 80, DEF: 45, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 70,
            lore: "Manuel Clay is an industrious midfielder who helps protect the central space. Originally a construction worker in the mountain quarries, he was signed after an impressive open trial scouted by Oliver Rivet. He focuses entirely on breaking up opposition play."
        },
        {
            name: "Rafael Flint",
            position: "MF",
            rarity: "COMMON",
            stats: { ATT: 40, MID: 85, DEF: 45, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 70,
            aggression: 75,
            lore: "Rafael Flint is a dedicated midfielder who excels at retrieving loose balls. He spends his training sessions reviewing coordinates with Chief Analyst Oliver Rivet to coordinate support for [[p_41|Barnaby Capella]]. He wears a lucky flint stone in his boot."
        },
        {
            name: "Kaito Slate",
            position: "MF",
            rarity: "COMMON",
            stats: { ATT: 50, MID: 75, DEF: 45, GK: 10 },
            trait: null,
            workRate: "Low",
            stamina: 65,
            aggression: 60,
            lore: "Kaito Slate is a tactical midfielder who provides depth during squad rotations. He works hard to emulate the defensive positioning of star forward [[p_41|Barnaby Capella]] and follows Hugo Wolf's strict physical guidelines. He enjoys playing acoustic guitar."
        },
        {
            name: "Hiroto Ridge",
            position: "DF",
            rarity: "ELITE",
            stats: { ATT: 35, MID: 70, DEF: 125, GK: 10 },
            trait: "Wall",
            workRate: "High",
            stamina: 95,
            aggression: 85,
            lore: "Hiroto Ridge is a towering center-back who forms the heart of Valhalla's Low Block Defense. He works closely with [[p_41|Barnaby Capella]] during set pieces, creating an impenetrable defensive wall. Hugo Wolf values his strength and physical dominance."
        },
        {
            name: "Ren Peak",
            position: "DF",
            rarity: "RARE",
            stats: { ATT: 30, MID: 60, DEF: 110, GK: 10 },
            trait: "Enforcer",
            workRate: "Medium",
            stamina: 80,
            aggression: 90,
            lore: "Ren Peak is a tough-tackling defender who neutralizes fast opponent wingers. He acts as the main enforcer in the Valhalla defense, shielding [[p_41|Barnaby Capella]] from pressure during transitions. He spends his free time climbing the northern peaks."
        },
        {
            name: "Haruto Vale",
            position: "DF",
            rarity: "RARE",
            stats: { ATT: 25, MID: 65, DEF: 110, GK: 10 },
            trait: "Wall",
            workRate: "Medium",
            stamina: 85,
            aggression: 80,
            lore: "Haruto Vale is a reliable fullback who excels in aerial clearances. He maintains defensive coordination under Hugo Wolf's low block system, ensuring [[p_41|Barnaby Capella]] can focus on deep runs. He spends hours reviewing game tape with Oliver Rivet."
        },
        {
            name: "Sota Dale",
            position: "DF",
            rarity: "COMMON",
            stats: { ATT: 25, MID: 50, DEF: 95, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 80,
            lore: "Sota Dale is a gritty defender who was signed from a local mountain league. Discovered by Oliver Rivet, he trains hard to match the physical output of [[p_41|Barnaby Capella]]. He keeps a small carved wooden token in his kit bag."
        },
        {
            name: "Yuto Canyon",
            position: "DF",
            rarity: "COMMON",
            stats: { ATT: 20, MID: 55, DEF: 95, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 70,
            aggression: 85,
            lore: "Yuto Canyon is a disciplined defender who focuses on blocking opposition shots. He relies on Oliver Rivet's tactical charts to adjust his marking angles. He enjoys constructing wooden scale models of local arenas."
        },
        {
            name: "Riku Gorge",
            position: "DF",
            rarity: "COMMON",
            stats: { ATT: 30, MID: 45, DEF: 95, GK: 10 },
            trait: null,
            workRate: "Low",
            stamina: 60,
            aggression: 75,
            lore: "Riku Gorge is a physical defender who provides backup support for the backline. He studies the movement patterns of [[p_41|Barnaby Capella]] to coordinate defensive clearances out of the box. He is an amateur astronomer."
        },
        {
            name: "Sora River",
            position: "GK",
            rarity: "RARE",
            stats: { ATT: 10, MID: 10, DEF: 30, GK: 160 },
            trait: "Super Sub",
            workRate: "Medium",
            stamina: 85,
            aggression: 60,
            lore: "Sora River is a highly responsive goalkeeper who anchors Valhalla's defense. He communicates constantly with Hugo Wolf to organize the low block, protecting [[p_41|Barnaby Capella]]'s offensive leads. His reflexes have saved Valhalla in several close derbies."
        },
        {
            name: "Takuya Brook",
            position: "GK",
            rarity: "COMMON",
            stats: { ATT: 10, MID: 10, DEF: 20, GK: 140 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 55,
            lore: "Takuya Brook is a backup goalkeeper who came through the northern junior leagues. Discovered by Oliver Rivet, he works hard to perfect his positioning. He wears a specific blue glove on his left hand for superstition."
        },
        {
            name: "Ryouta Lake",
            position: "GK",
            rarity: "COMMON",
            stats: { ATT: 10, MID: 10, DEF: 25, GK: 135 },
            trait: null,
            workRate: "Low",
            stamina: 70,
            aggression: 60,
            lore: "Ryouta Lake provides backup support in the goalkeeper slot for Valhalla. He trains hard under Hugo Wolf's defensive drills to master post positioning. He spends his free time constructing model skyships."
        }
    ],
    // --- Helios Sovereign (club_4) ---
    [
        {
            name: "Rayna Ice",
            position: "FW",
            rarity: "LEGEND",
            stats: { ATT: 145, MID: 75, DEF: 40, GK: 10 },
            trait: "Poacher",
            workRate: "High",
            stamina: 95,
            aggression: 85,
            lore: "Helios's star forward Rayna Ice is renowned for her lightning counter-pressing and clinical accuracy. During the hot summer cup final, she intercepted a pass meant for [[p_41|Barnaby Capella]] and went coast-to-coast to score, fulfilling manager Gulliver Dune's high-press directive. She regularly visualizes match scenarios in solar-reactor chambers."
        },
        {
            name: "Sven Ocean",
            position: "FW",
            rarity: "ELITE",
            stats: { ATT: 125, MID: 70, DEF: 35, GK: 10 },
            trait: "Poacher",
            workRate: "High",
            stamina: 90,
            aggression: 80,
            lore: "Sven Ocean is a clinical striker who thrives under Gulliver Dune's Gegenpressing system. He works closely with [[p_61|Rayna Ice]], leading the first line of the press to force turnovers deep in the opponent's half. The coaching staff highly praises his high intensity and positioning."
        },
        {
            name: "Lars Tide",
            position: "FW",
            rarity: "RARE",
            stats: { ATT: 110, MID: 60, DEF: 30, GK: 10 },
            trait: "Super Sub",
            workRate: "High",
            stamina: 85,
            aggression: 75,
            lore: "Lars Tide is a rapid winger who provides dynamic width to Helios's front line. He acts as a key outlet for [[p_61|Rayna Ice]], providing precise cutbacks under Gulliver Dune's tactical system. He spends his free time studying coastal wind currents."
        },
        {
            name: "Nils Current",
            position: "FW",
            rarity: "COMMON",
            stats: { ATT: 95, MID: 50, DEF: 25, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 70,
            lore: "Nils Current is an energetic young forward who developed in the Helios youth system. Discovered by Chief Analyst Marco Sword, he spends hours studying [[p_61|Rayna Ice]]'s movement patterns. He enjoys paint-balling and competitive simulation games."
        },
        {
            name: "Erik Wave",
            position: "FW",
            rarity: "COMMON",
            stats: { ATT: 90, MID: 55, DEF: 25, GK: 10 },
            trait: null,
            workRate: "Low",
            stamina: 70,
            aggression: 60,
            lore: "Erik Wave provides valuable depth in the striker rotation for Helios. He works closely with Marco Sword to analyze the opponent's high line and assist [[p_61|Rayna Ice]]. He wears a lucky copper coin in his left shoe for matches."
        },
        {
            name: "Magnus Sands",
            position: "MF",
            rarity: "ELITE",
            stats: { ATT: 60, MID: 110, DEF: 60, GK: 10 },
            trait: "Playmaker",
            workRate: "High",
            stamina: 95,
            aggression: 80,
            lore: "Magnus Sands is the midfield coordinator for Helios Sovereign. He thrives in Gulliver Dune's Gegenpressing style, swarming the ball immediately upon turnover and supplying quick, vertical passes to [[p_61|Rayna Ice]]. The staff ranks his work rate among the best in the league."
        },
        {
            name: "Olaf Dune",
            position: "MF",
            rarity: "RARE",
            stats: { ATT: 55, MID: 95, DEF: 50, GK: 10 },
            trait: "Captain",
            workRate: "Medium",
            stamina: 85,
            aggression: 75,
            lore: "Olaf Dune is a gritty central midfielder who excels at breaking up transition plays. He translates Gulliver Dune's tactical demands on the pitch, ensuring that [[p_61|Rayna Ice]] is supported during intensive pressing sequences. He studies celestial navigation to relax."
        },
        {
            name: "Gunnar Beach",
            position: "MF",
            rarity: "RARE",
            stats: { ATT: 50, MID: 100, DEF: 50, GK: 10 },
            trait: "Playmaker",
            workRate: "Medium",
            stamina: 80,
            aggression: 70,
            lore: "Gunnar Beach uses his exceptional spatial vision to orchestrate quick transition moves. He works in close coordination with [[p_61|Rayna Ice]] to carve open opposition blocks. He spent his early years working in solar-cell assembly units."
        },
        {
            name: "Leif Shore",
            position: "MF",
            rarity: "COMMON",
            stats: { ATT: 45, MID: 80, DEF: 45, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 65,
            lore: "Leif Shore is a steady squad midfielder who excels in maintaining the mid-block shape. Discovered by Marco Sword, he trains tirelessly on hard-light simulator grids. He is superstitious about always stepping onto the pitch with his right foot."
        },
        {
            name: "Bjarni Storm",
            position: "MF",
            rarity: "COMMON",
            stats: { ATT: 40, MID: 85, DEF: 45, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 70,
            aggression: 70,
            lore: "Bjarni Storm is an aggressive midfielder who specializes in reclaiming possession in high areas. Under Gulliver Dune's direction, he shields the backline to free [[p_61|Rayna Ice]] from defensive chores. He enjoys building custom drones."
        },
        {
            name: "Torstein Gale",
            position: "MF",
            rarity: "COMMON",
            stats: { ATT: 50, MID: 75, DEF: 45, GK: 10 },
            trait: null,
            workRate: "Low",
            stamina: 65,
            aggression: 60,
            lore: "Torstein Gale is a technical midfielder who provides support during squad rotations. He works hard to emulate the defensive positioning of star forward [[p_61|Rayna Ice]] and follows Gulliver Dune's strict physical guidelines. He is an amateur painter."
        },
        {
            name: "Winston Tempest",
            position: "DF",
            rarity: "ELITE",
            stats: { ATT: 35, MID: 70, DEF: 125, GK: 10 },
            trait: "Wall",
            workRate: "High",
            stamina: 90,
            aggression: 85,
            lore: "Winston Tempest is an imposing center-back who anchors Helios's high line. He works in tandem with [[p_61|Rayna Ice]]'s front pressing line, cleaning up long clearance balls and keeping the pressure sustained. Gulliver Dune highly values his defensive anticipation."
        },
        {
            name: "Clement Breeze",
            position: "DF",
            rarity: "RARE",
            stats: { ATT: 30, MID: 60, DEF: 110, GK: 10 },
            trait: "Enforcer",
            workRate: "Medium",
            stamina: 80,
            aggression: 90,
            lore: "Clement Breeze is a tenacious defender who uses aggressive physical containment to stop counterattacks. He protects Helios's central channels, allowing [[p_61|Rayna Ice]] to remain advanced. He spends his off-time studying meteorology."
        },
        {
            name: "Barnaby Zephyr",
            position: "DF",
            rarity: "RARE",
            stats: { ATT: 25, MID: 65, DEF: 110, GK: 10 },
            trait: "Wall",
            workRate: "Medium",
            stamina: 85,
            aggression: 75,
            lore: "Barnaby Zephyr is a tactical fullback who coordinates the offside trap under Gulliver Dune's Gegenpressing style. He provides defensive support that enables [[p_61|Rayna Ice]] to high press. He reviews game footage daily with Marco Sword."
        },
        {
            name: "Archibald Wind",
            position: "DF",
            rarity: "COMMON",
            stats: { ATT: 25, MID: 50, DEF: 95, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 80,
            lore: "Archibald Wind is a physical defender who was signed from a local wind-farm community. Discovered by Marco Sword, he trains hard to match the stamina standards of [[p_61|Rayna Ice]]. He keeps a small windmill model in his locker for luck."
        },
        {
            name: "Reginald Cloud",
            position: "DF",
            rarity: "COMMON",
            stats: { ATT: 20, MID: 55, DEF: 95, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 70,
            aggression: 85,
            lore: "Reginald Cloud is a disciplined fullback who focuses on intercepting wing passes. He relies on Marco Sword's tactical reports to adjust his positioning. He enjoys painting miniature skyships during his rest days."
        },
        {
            name: "Percival Sky",
            position: "DF",
            rarity: "COMMON",
            stats: { ATT: 30, MID: 45, DEF: 95, GK: 10 },
            trait: null,
            workRate: "Low",
            stamina: 60,
            aggression: 75,
            lore: "Percival Sky is a backup center-back who offers height and power in the air. He studies the defensive movements of [[p_61|Rayna Ice]] to understand the timing of high line recovery runs. He is an amateur chess player."
        },
        {
            name: "Leopold Star",
            position: "GK",
            rarity: "RARE",
            stats: { ATT: 10, MID: 10, DEF: 30, GK: 160 },
            trait: "Super Sub",
            workRate: "Medium",
            stamina: 85,
            aggression: 60,
            lore: "Leopold Star is a highly agile goalkeeper who serves as the launchpad for Helios's quick transition counters. He communicates constantly with Gulliver Dune to coordinate high-line coverage, protecting [[p_61|Rayna Ice]]'s offensive leads. He is highly praised by the fans."
        },
        {
            name: "Balthazar Moon",
            position: "GK",
            rarity: "COMMON",
            stats: { ATT: 10, MID: 10, DEF: 20, GK: 140 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 50,
            lore: "Balthazar Moon is a backup goalkeeper who came through the regional junior academy. Discovered by Marco Sword, he works hard to master high-line sweeping. He wears a lucky silver chain under his shirt for superstition."
        },
        {
            name: "Cornelius Sun",
            position: "GK",
            rarity: "COMMON",
            stats: { ATT: 10, MID: 10, DEF: 25, GK: 135 },
            trait: null,
            workRate: "Low",
            stamina: 70,
            aggression: 55,
            lore: "Cornelius Sun provides backup support in the goalkeeper rotation for Helios. He trains hard under Gulliver Dune's high-intensity drills to improve his reaction speed. He spends his free time constructing model skyships."
        }
    ],
    // --- Crystalline Palace (club_5) ---
    [
        {
            name: "Barnaby Compiler",
            position: "FW",
            rarity: "LEGEND",
            stats: { ATT: 145, MID: 75, DEF: 40, GK: 10 },
            trait: "Poacher",
            workRate: "High",
            stamina: 95,
            aggression: 70,
            lore: "Barnaby Compiler is a master tactician on the wing, treating the pitch as an optical canvas for Crystalline Palace. In the glass dome derby, he executed a flawless step-over routine to beat [[p_201|Atticus Roar]] and square the ball for the winning tap-in, earning praise from Leander Wind. He spent his early years polishing silica glass for optical computers."
        },
        {
            name: "Gulliver Solar",
            position: "FW",
            rarity: "ELITE",
            stats: { ATT: 125, MID: 70, DEF: 35, GK: 10 },
            trait: "Poacher",
            workRate: "High",
            stamina: 90,
            aggression: 65,
            lore: "Gulliver Solar is an elite forward who brings technical elegance to Crystalline Palace's frontline. He operates in perfect harmony with [[p_81|Barnaby Compiler]] under Leander Wind's possession system, exploiting half-spaces with precise timing. The training staff highly commends his spatial intelligence."
        },
        {
            name: "Cyrus Nova",
            position: "FW",
            rarity: "RARE",
            stats: { ATT: 110, MID: 60, DEF: 30, GK: 10 },
            trait: "False Nine",
            workRate: "Medium",
            stamina: 80,
            aggression: 60,
            lore: "Cyrus Nova is a creative winger who excels at pulling defenders out of position. Under Leander Wind's possession tactics, he creates overlap lanes for [[p_81|Barnaby Compiler]] to exploit in the box. He spent his early years as an optical technician."
        },
        {
            name: "Darius Kepler",
            position: "FW",
            rarity: "COMMON",
            stats: { ATT: 95, MID: 50, DEF: 25, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 55,
            lore: "Darius Kepler is a hardworking squad forward who came through the Crystalline youth ranks. Discovered by Silas Syntax, he uses data analytics to study the positioning of [[p_81|Barnaby Compiler]]. He is an avid builder of glass sculptures."
        },
        {
            name: "Xerxes Orion",
            position: "FW",
            rarity: "COMMON",
            stats: { ATT: 90, MID: 55, DEF: 25, GK: 10 },
            trait: null,
            workRate: "Low",
            stamina: 70,
            aggression: 50,
            lore: "Xerxes Orion provides solid depth to the Crystalline attack during congested schedules. He works closely with Silas Syntax to refine his passing sequences and support [[p_81|Barnaby Compiler]]. He always carries a lucky glass bead."
        },
        {
            name: "Zephyr Sirius",
            position: "MF",
            rarity: "ELITE",
            stats: { ATT: 60, MID: 110, DEF: 60, GK: 10 },
            trait: "Playmaker",
            workRate: "High",
            stamina: 95,
            aggression: 75,
            lore: "Zephyr Sirius is the midfield orchestrator for Crystalline Palace. Under Leander Wind's possession philosophy, he maintains a near-perfect pass completion rate, feeding creative balls to [[p_81|Barnaby Compiler]]. The technical director praises his spatial analysis and vision."
        },
        {
            name: "Aurelius Vega",
            position: "MF",
            rarity: "RARE",
            stats: { ATT: 55, MID: 95, DEF: 50, GK: 10 },
            trait: "Captain",
            workRate: "Medium",
            stamina: 85,
            aggression: 70,
            lore: "Aurelius Vega is a veteran midfielder who controls the flow of the match. He acts as Leander Wind's tactical general, ensuring [[p_81|Barnaby Compiler]] is constantly integrated into possession triangles. He spends his off-time studying historical stellar maps."
        },
        {
            name: "Tiberius Altair",
            position: "MF",
            rarity: "RARE",
            stats: { ATT: 50, MID: 100, DEF: 50, GK: 10 },
            trait: "Playmaker",
            workRate: "Medium",
            stamina: 80,
            aggression: 65,
            lore: "Tiberius Altair is a technical midfielder who excels at breaking down defensive low blocks. He coordinates with [[p_81|Barnaby Compiler]] to create scoring angles. He spent his early career aligning laser optics in processor labs."
        },
        {
            name: "Hadrian Rigel",
            position: "MF",
            rarity: "COMMON",
            stats: { ATT: 45, MID: 80, DEF: 45, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 60,
            lore: "Hadrian Rigel is a dependable midfielder who helps maintain the tempo of Crystalline's passing. Discovered by Silas Syntax, he trains extensively on holographic simulator grids. He wears a specific green sweatband for superstition."
        },
        {
            name: "Augustus Antares",
            position: "MF",
            rarity: "COMMON",
            stats: { ATT: 40, MID: 85, DEF: 45, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 70,
            aggression: 70,
            lore: "Augustus Antares is a defensive midfielder who excels in recovering loose balls. Under Leander Wind's guidance, he stabilizes the center, allowing [[p_81|Barnaby Compiler]] to remain high. Outside of football, he helps build water-cooled computers."
        },
        {
            name: "Constantine Castor",
            position: "MF",
            rarity: "COMMON",
            stats: { ATT: 50, MID: 75, DEF: 45, GK: 10 },
            trait: null,
            workRate: "Low",
            stamina: 65,
            aggression: 55,
            lore: "Constantine Castor is a technical midfielder who provides valuable squad depth during rotations. He trains to match the tactical positioning of [[p_81|Barnaby Compiler]] and follows Leander Wind's strict guidelines. He relaxes by playing chess."
        },
        {
            name: "Theodore Pollux",
            position: "DF",
            rarity: "ELITE",
            stats: { ATT: 35, MID: 70, DEF: 125, GK: 10 },
            trait: "Wall",
            workRate: "High",
            stamina: 90,
            aggression: 80,
            lore: "Theodore Pollux is an imposing center-back who forms the foundation of Crystalline's defensive line. He works in tandem with [[p_81|Barnaby Compiler]]'s attacking line, providing solid security that allows the team to commit forward. Leander Wind praises his aerial interception rate."
        },
        {
            name: "Felix Capella",
            position: "DF",
            rarity: "RARE",
            stats: { ATT: 30, MID: 60, DEF: 110, GK: 10 },
            trait: "Enforcer",
            workRate: "Medium",
            stamina: 85,
            aggression: 85,
            lore: "Felix Capella is a fierce defender whose physical tackles disrupt opponent counters. He acts as the main security guard for Crystalline's high-possession block, shielding [[p_81|Barnaby Compiler]] from turnover pressure. He spends his off-time studying neural networks."
        },
        {
            name: "Jasper Valerius",
            position: "DF",
            rarity: "RARE",
            stats: { ATT: 25, MID: 65, DEF: 110, GK: 10 },
            trait: "Wall",
            workRate: "Medium",
            stamina: 80,
            aggression: 75,
            lore: "Jasper Valerius is a calm fullback who excels at positioning and intercepting passes. He maintains the defensive shape under Leander Wind's possession system, allowing [[p_81|Barnaby Compiler]] to focus on deep runs. He spends hours reviewing game tapes with Silas Syntax."
        },
        {
            name: "Oliver Sovereign",
            position: "DF",
            rarity: "COMMON",
            stats: { ATT: 25, MID: 50, DEF: 95, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 70,
            lore: "Oliver Sovereign is a reliable defender who was signed from a local cyber-athletics club. Discovered by Silas Syntax, he trains diligently to emulate the tactical vision of [[p_81|Barnaby Compiler]]. He is known to carry a lucky silver bolt in his kit bag."
        },
        {
            name: "Oscar Rex",
            position: "DF",
            rarity: "COMMON",
            stats: { ATT: 20, MID: 55, DEF: 95, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 70,
            aggression: 80,
            lore: "Oscar Rex is a disciplined defender who focuses on blocking wing crosses. He relies heavily on Silas Syntax's tactical reports to adjust his marking angles. He enjoys designing holographic art for the stadium screens."
        },
        {
            name: "Henry Regis",
            position: "DF",
            rarity: "COMMON",
            stats: { ATT: 30, MID: 45, DEF: 95, GK: 10 },
            trait: null,
            workRate: "Low",
            stamina: 60,
            aggression: 75,
            lore: "Henry Regis is a physical defender who provides backup depth for the backline. He studies the movement patterns of [[p_81|Barnaby Compiler]] to coordinate long ball clearances out of the defensive block. He is an amateur robotics enthusiast."
        },
        {
            name: "Milo Vassal",
            position: "GK",
            rarity: "RARE",
            stats: { ATT: 10, MID: 10, DEF: 30, GK: 160 },
            trait: "Super Sub",
            workRate: "Medium",
            stamina: 85,
            aggression: 55,
            lore: "Milo Vassal is a highly analytical goalkeeper who acts as the distributor in Leander Wind's possession build-ups. He coordinates with [[p_81|Barnaby Compiler]] to initiate counter-offenses from the back. His calm demeanor has earned him immense praise from fans."
        },
        {
            name: "Atticus Knight",
            position: "GK",
            rarity: "COMMON",
            stats: { ATT: 10, MID: 10, DEF: 20, GK: 140 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 50,
            lore: "Atticus Knight is a backup goalkeeper who came through the metropolitan junior leagues. Discovered by Silas Syntax, he works hard to perfect his ball distribution. He wears a specific blue glove on his left hand for superstition."
        },
        {
            name: "Ezra Squire",
            position: "GK",
            rarity: "COMMON",
            stats: { ATT: 10, MID: 10, DEF: 25, GK: 135 },
            trait: null,
            workRate: "Low",
            stamina: 70,
            aggression: 60,
            lore: "Ezra Squire provides backup support in the goalkeeper slot for Crystalline Palace. He trains extensively under Leander Wind's possession drills to improve his sweeping range. He spends his free time constructing model skyships."
        }
    ],
    // --- Solaris Vanguard (club_6) ---
    [
        {
            name: "Felix Shields",
            position: "FW",
            rarity: "LEGEND",
            stats: { ATT: 145, MID: 75, DEF: 40, GK: 10 },
            trait: "Poacher",
            workRate: "High",
            stamina: 95,
            aggression: 85,
            lore: "Felix Shields leads the frontline for Solaris with explosive power and a fiery finish. He famously scored a hat-trick against [[p_341|Leopold Vassal]] in the Daybreak Pitch, executing Haruto Finch's route-one long-ball strategy to perfection. Off the pitch, he is a dedicated researcher of solar flares and magnetic anomalies."
        },
        {
            name: "Asher Page",
            position: "FW",
            rarity: "ELITE",
            stats: { ATT: 125, MID: 70, DEF: 35, GK: 10 },
            trait: "Poacher",
            workRate: "High",
            stamina: 90,
            aggression: 80,
            lore: "Asher Page is a clinical striker who excels in direct physical aerial battles under Haruto Finch. He acts as the secondary target man alongside [[p_101|Felix Shields]], nodging down long balls to create immediate shot options. The technical staff commends his finishing under pressure."
        },
        {
            name: "Wyatt Spear",
            position: "FW",
            rarity: "RARE",
            stats: { ATT: 110, MID: 60, DEF: 30, GK: 10 },
            trait: "Super Sub",
            workRate: "High",
            stamina: 85,
            aggression: 75,
            lore: "Wyatt Spear is an explosive winger who stretches opposition backlines during route-one launches. He provides key support to [[p_101|Felix Shields]], exploiting spaces left behind by overcommitting defenses. He trains by sprinting with parachute harnesses on the beach."
        },
        {
            name: "Cormac Lance",
            position: "FW",
            rarity: "COMMON",
            stats: { ATT: 95, MID: 50, DEF: 25, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 70,
            lore: "Cormac Lance is an energetic young striker who came up through the Solaris youth system. Discovered by Chief Analyst Lars Storm, he spends hours studying [[p_101|Felix Shields]]'s vertical leap coordinates. He relaxes by building model steam turbines."
        },
        {
            name: "Bruno Bow",
            position: "FW",
            rarity: "COMMON",
            stats: { ATT: 90, MID: 55, DEF: 25, GK: 10 },
            trait: null,
            workRate: "Low",
            stamina: 70,
            aggression: 60,
            lore: "Bruno Bow provides robust physical presence in the striker rotation for Solaris. He works with Lars Storm to optimize his blocking angles to shield [[p_101|Felix Shields]]. He wears a faded red bandana as a personal match superstition."
        },
        {
            name: "Emil Arrow",
            position: "MF",
            rarity: "ELITE",
            stats: { ATT: 60, MID: 110, DEF: 60, GK: 10 },
            trait: "Playmaker",
            workRate: "High",
            stamina: 95,
            aggression: 80,
            lore: "Emil Arrow is the midfield launcher for Solaris Vanguard. Under Haruto Finch's Route One philosophy, he is tasked with launching instant, high-precision diagonal balls to [[p_101|Felix Shields]]. The coaching staff highly values his quick decision-making and vision."
        },
        {
            name: "Viktor Bolt",
            position: "MF",
            rarity: "RARE",
            stats: { ATT: 55, MID: 95, DEF: 50, GK: 10 },
            trait: "Captain",
            workRate: "Medium",
            stamina: 85,
            aggression: 75,
            lore: "Viktor Bolt is a physical central midfielder who commands the second balls in the center. He ensures Haruto Finch's route-one transition is supported, protecting [[p_101|Felix Shields]] from isolated defensive swarms. He is an avid student of classical military history."
        },
        {
            name: "Stefan Archer",
            position: "MF",
            rarity: "RARE",
            stats: { ATT: 50, MID: 100, DEF: 50, GK: 10 },
            trait: "Playmaker",
            workRate: "Medium",
            stamina: 80,
            aggression: 70,
            lore: "Stefan Archer uses his exceptional vision to hit deep line-breaking passes. He works closely with [[p_101|Felix Shields]] to execute rapid transition sequences. He spent his early career calibrating industrial lasers for solar arrays."
        },
        {
            name: "Nikolai Fletcher",
            position: "MF",
            rarity: "COMMON",
            stats: { ATT: 45, MID: 80, DEF: 45, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 65,
            lore: "Nikolai Fletcher is a reliable squad midfielder who helps recycle possession in tight areas. Discovered by Lars Storm, he trains extensively on holographic simulator grids. He is superstitious about wearing a blue wristband on his right arm."
        },
        {
            name: "Dimitri Hunter",
            position: "MF",
            rarity: "COMMON",
            stats: { ATT: 40, MID: 85, DEF: 45, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 70,
            aggression: 70,
            lore: "Dimitri Hunter is a defensive midfielder who focuses on retrieving loose clearances. Under Haruto Finch's guidance, he stabilizes the midfield center to let [[p_101|Felix Shields]] focus on high-press runs. Outside of soccer, he builds custom computers."
        },
        {
            name: "Ivan Trapper",
            position: "MF",
            rarity: "COMMON",
            stats: { ATT: 50, MID: 75, DEF: 45, GK: 10 },
            trait: null,
            workRate: "Low",
            stamina: 65,
            aggression: 60,
            lore: "Ivan Trapper is a technical midfielder who provides support during squad rotations. He works hard to emulate the defensive positioning of star forward [[p_101|Felix Shields]] and follows Haruto Finch's strict guidelines. He is an amateur painter."
        },
        {
            name: "Yuri Predator",
            position: "DF",
            rarity: "ELITE",
            stats: { ATT: 35, MID: 70, DEF: 125, GK: 10 },
            trait: "Wall",
            workRate: "High",
            stamina: 90,
            aggression: 85,
            lore: "Yuri Predator is an imposing center-back who dominates the defensive third. He works in tandem with [[p_101|Felix Shields]]'s attacking runs, providing solid security that allows the team to play direct long balls. Haruto Finch praises his high clearance rate."
        },
        {
            name: "Alexei Viper",
            position: "DF",
            rarity: "RARE",
            stats: { ATT: 30, MID: 60, DEF: 110, GK: 10 },
            trait: "Enforcer",
            workRate: "Medium",
            stamina: 85,
            aggression: 85,
            lore: "Alexei Viper is a fierce defender whose physical tackles halt fast opponent counters. He acts as the main security guard for Solaris's high-possession block, shielding [[p_101|Felix Shields]] from transition pressure. He spends his off-time studying neural networks."
        },
        {
            name: "Marcus Cobra",
            position: "DF",
            rarity: "RARE",
            stats: { ATT: 25, MID: 65, DEF: 110, GK: 10 },
            trait: "Wall",
            workRate: "Medium",
            stamina: 80,
            aggression: 75,
            lore: "Marcus Cobra is a calm fullback who excels at positioning and intercepting passes. He maintains the defensive shape under Haruto Finch's direct system, allowing [[p_101|Felix Shields]] to focus on deep runs. He spends hours reviewing game tapes with Lars Storm."
        },
        {
            name: "Jaxon Adder",
            position: "DF",
            rarity: "COMMON",
            stats: { ATT: 25, MID: 50, DEF: 95, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 70,
            lore: "Jaxon Adder is a reliable defender who was signed from a local cyber-athletics club. Discovered by Lars Storm, he trains diligently to emulate the tactical vision of [[p_101|Felix Shields]]. He is known to carry a lucky silver bolt in his kit bag."
        },
        {
            name: "Silas Serpent",
            position: "DF",
            rarity: "COMMON",
            stats: { ATT: 20, MID: 55, DEF: 95, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 70,
            aggression: 80,
            lore: "Silas Serpent is a disciplined defender who focuses on blocking wing crosses. He relies heavily on Lars Storm's tactical reports to adjust his marking angles. He enjoys designing holographic art for the stadium screens."
        },
        {
            name: "Clara Fang",
            position: "DF",
            rarity: "COMMON",
            stats: { ATT: 30, MID: 45, DEF: 95, GK: 10 },
            trait: null,
            workRate: "Low",
            stamina: 60,
            aggression: 75,
            lore: "Clara Fang is a physical defender who provides backup depth for the backline. He studies the movement patterns of [[p_101|Felix Shields]] to coordinate long ball clearances out of the defensive block. He is an amateur robotics enthusiast."
        },
        {
            name: "Aero Claw",
            position: "GK",
            rarity: "RARE",
            stats: { ATT: 10, MID: 10, DEF: 30, GK: 160 },
            trait: "Super Sub",
            workRate: "Medium",
            stamina: 85,
            aggression: 55,
            lore: "Aero Claw is a highly analytical goalkeeper who acts as the distributor in Haruto Finch's direct build-ups. He coordinates with [[p_101|Felix Shields]] to initiate counter-offenses from the back. His calm demeanor has earned him immense praise from fans."
        },
        {
            name: "Breeze Talon",
            position: "GK",
            rarity: "COMMON",
            stats: { ATT: 10, MID: 10, DEF: 20, GK: 140 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 50,
            lore: "Breeze Talon is a backup goalkeeper who came through the metropolitan junior leagues. Discovered by Lars Storm, he works hard to perfect his ball distribution. He wears a specific blue glove on his left hand for superstition."
        },
        {
            name: "Gale Beak",
            position: "GK",
            rarity: "COMMON",
            stats: { ATT: 10, MID: 10, DEF: 25, GK: 135 },
            trait: null,
            workRate: "Low",
            stamina: 70,
            aggression: 60,
            lore: "Gale Beak provides backup support in the goalkeeper slot for Solaris Vanguard. He trains extensively under Haruto Finch's direction to improve his sweeping range. He spends his free time constructing model skyships."
        }
    ],
    // --- Zenith Ascendants (club_7) ---
    [
        {
            name: "Fabian Thunder",
            position: "FW",
            rarity: "LEGEND",
            stats: { ATT: 145, MID: 75, DEF: 40, GK: 10 },
            trait: "Poacher",
            workRate: "High",
            stamina: 95,
            aggression: 85,
            lore: "Zenith's star striker Fabian Thunder is a force of nature, known for his thunderous long-range strikes. He secured Zenith's league standing by unleashing a 35-yard rocket that left [[p_81|Barnaby Compiler]]'s team stunned, a move rehearsed with Clara Fletcher. He trains by hiking steep summit ridges in heavy iron vests."
        },
        {
            name: "Aurora Roar",
            position: "FW",
            rarity: "ELITE",
            stats: { ATT: 125, MID: 70, DEF: 35, GK: 10 },
            trait: "Poacher",
            workRate: "High",
            stamina: 90,
            aggression: 80,
            lore: "Aurora Roar is an elite striker who coordinates Zenith's vertical transitions. Under Clara Fletcher's Route One tactics, he provides support to [[p_121|Fabian Thunder]], winning aerial duels and laying off passes in the box. His high stamina makes him a persistent menace."
        },
        {
            name: "Orion Howl",
            position: "FW",
            rarity: "RARE",
            stats: { ATT: 110, MID: 60, DEF: 30, GK: 10 },
            trait: "Super Sub",
            workRate: "High",
            stamina: 85,
            aggression: 75,
            lore: "Orion Howl is a rapid winger who stretches opposing low blocks to open up channels for [[p_121|Fabian Thunder]]. Clara Fletcher values his pace and direct crossing under high pressure. He spends his off-season studying mountain wind patterns."
        },
        {
            name: "Kelvin Glitch",
            position: "FW",
            rarity: "COMMON",
            stats: { ATT: 95, MID: 50, DEF: 25, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 70,
            lore: "Kelvin Glitch is a dedicated young forward who developed in Zenith's academy. Discovered by Adrian Bolt, he spends hours studying [[p_121|Fabian Thunder]]'s shooting technique. He enjoys carving wooden mountain figures."
        },
        {
            name: "Nyx Byte",
            position: "FW",
            rarity: "COMMON",
            stats: { ATT: 90, MID: 55, DEF: 25, GK: 10 },
            trait: null,
            workRate: "Low",
            stamina: 70,
            aggression: 60,
            lore: "Nyx Byte provides vital forward rotation for Zenith. He works with Adrian Bolt to optimize his movements and draw defenders away from [[p_121|Fabian Thunder]]. He wears a lucky flint pendant during matches."
        },
        {
            name: "Viper Pixel",
            position: "MF",
            rarity: "ELITE",
            stats: { ATT: 60, MID: 110, DEF: 60, GK: 10 },
            trait: "Playmaker",
            workRate: "High",
            stamina: 95,
            aggression: 80,
            lore: "Viper Pixel is the midfield launcher for Zenith Ascendants. He thrives in Clara Fletcher's Route One system, retrieving clearances and immediately sending long diagonal passes to [[p_121|Fabian Thunder]]. The technical department highly praises his passing accuracy."
        },
        {
            name: "Umbra Vector",
            position: "MF",
            rarity: "RARE",
            stats: { ATT: 55, MID: 95, DEF: 50, GK: 10 },
            trait: "Captain",
            workRate: "Medium",
            stamina: 85,
            aggression: 75,
            lore: "Umbra Vector is a resilient central midfielder who commands the middle space. He ensures Clara Fletcher's route-one transition is supported, protecting [[p_121|Fabian Thunder]] from isolated blocks. He is an avid student of classical military history."
        },
        {
            name: "Cedric Matrix",
            position: "MF",
            rarity: "RARE",
            stats: { ATT: 50, MID: 100, DEF: 50, GK: 10 },
            trait: "Playmaker",
            workRate: "Medium",
            stamina: 80,
            aggression: 70,
            lore: "Cedric Matrix uses his exceptional vision to hit deep line-breaking passes. He works closely with [[p_121|Fabian Thunder]] to execute rapid transition sequences. He spent his early career calibrating industrial lasers."
        },
        {
            name: "Galahad Raster",
            position: "MF",
            rarity: "COMMON",
            stats: { ATT: 45, MID: 80, DEF: 45, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 65,
            lore: "Galahad Raster is a reliable squad midfielder who helps recycle possession in tight areas. Discovered by Adrian Bolt, he trains extensively on holographic simulator grids. He is superstitious about wearing a blue wristband."
        },
        {
            name: "Tristan Buffer",
            position: "MF",
            rarity: "COMMON",
            stats: { ATT: 40, MID: 85, DEF: 45, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 70,
            aggression: 70,
            lore: "Tristan Buffer is a defensive midfielder who focuses on retrieving loose clearances. Under Clara Fletcher's guidance, he stabilizes the midfield center to let [[p_121|Fabian Thunder]] focus on runs. Outside of soccer, he builds custom computers."
        },
        {
            name: "Arthur Cache",
            position: "MF",
            rarity: "COMMON",
            stats: { ATT: 50, MID: 75, DEF: 45, GK: 10 },
            trait: null,
            workRate: "Low",
            stamina: 65,
            aggression: 60,
            lore: "Arthur Cache is a technical midfielder who provides support during squad rotations. He works hard to emulate the defensive positioning of star forward [[p_121|Fabian Thunder]] and follows Clara Fletcher's strict guidelines. He is an amateur painter."
        },
        {
            name: "Kenji Stack",
            position: "DF",
            rarity: "ELITE",
            stats: { ATT: 35, MID: 70, DEF: 125, GK: 10 },
            trait: "Wall",
            workRate: "High",
            stamina: 90,
            aggression: 85,
            lore: "Kenji Stack is an imposing center-back who dominates the defensive third. He works in tandem with [[p_121|Fabian Thunder]]'s attacking runs, providing solid security that allows the team to play direct long balls. Clara Fletcher praises his high clearance rate."
        },
        {
            name: "Rin Heap",
            position: "DF",
            rarity: "RARE",
            stats: { ATT: 30, MID: 60, DEF: 110, GK: 10 },
            trait: "Enforcer",
            workRate: "Medium",
            stamina: 85,
            aggression: 85,
            lore: "Rin Heap is a fierce defender whose physical tackles halt fast opponent counters. He acts as the main security guard for Zenith's high-possession block, shielding [[p_121|Fabian Thunder]] from transition pressure. He spends his off-time studying neural networks."
        },
        {
            name: "Cypher Core",
            position: "DF",
            rarity: "RARE",
            stats: { ATT: 25, MID: 65, DEF: 110, GK: 10 },
            trait: "Wall",
            workRate: "Medium",
            stamina: 80,
            aggression: 75,
            lore: "Cypher Core is a calm fullback who excels at positioning and intercepting passes. He maintains the defensive shape under Clara Fletcher's direct system, allowing [[p_121|Fabian Thunder]] to focus on deep runs. He spends hours reviewing game tapes with Adrian Bolt."
        },
        {
            name: "Oakley Kernel",
            position: "DF",
            rarity: "COMMON",
            stats: { ATT: 25, MID: 50, DEF: 95, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 70,
            lore: "Oakley Kernel is a reliable defender who was signed from a local cyber-athletics club. Discovered by Adrian Bolt, he trains diligently to emulate the tactical vision of [[p_121|Fabian Thunder]]. He is known to carry a lucky silver bolt in his kit bag."
        },
        {
            name: "Talon Shell",
            position: "DF",
            rarity: "COMMON",
            stats: { ATT: 20, MID: 55, DEF: 95, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 70,
            aggression: 80,
            lore: "Talon Shell is a disciplined defender who focuses on blocking wing crosses. He relies heavily on Adrian Bolt's tactical reports to adjust his marking angles. He enjoys designing holographic art for the stadium screens."
        },
        {
            name: "Bramble Code",
            position: "DF",
            rarity: "COMMON",
            stats: { ATT: 30, MID: 45, DEF: 95, GK: 10 },
            trait: null,
            workRate: "Low",
            stamina: 60,
            aggression: 75,
            lore: "Bramble Code is a physical defender who provides backup depth for the backline. He studies the movement patterns of [[p_121|Fabian Thunder]] to coordinate long ball clearances out of the defensive block. He is an amateur robotics enthusiast."
        },
        {
            name: "Marina Syntax",
            position: "GK",
            rarity: "RARE",
            stats: { ATT: 10, MID: 10, DEF: 30, GK: 160 },
            trait: "Super Sub",
            workRate: "Medium",
            stamina: 85,
            aggression: 55,
            lore: "Marina Syntax is a highly analytical goalkeeper who acts as the distributor in Clara Fletcher's direct build-ups. He coordinates with [[p_121|Fabian Thunder]] to initiate counter-offenses from the back. His calm demeanor has earned him immense praise from fans."
        },
        {
            name: "Reef Script",
            position: "GK",
            rarity: "COMMON",
            stats: { ATT: 10, MID: 10, DEF: 20, GK: 140 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 50,
            lore: "Reef Script is a backup goalkeeper who came through the metropolitan junior leagues. Discovered by Adrian Bolt, he works hard to perfect his ball distribution. He wears a specific blue glove on his left hand for superstition."
        },
        {
            name: "Sandy Compiler",
            position: "GK",
            rarity: "COMMON",
            stats: { ATT: 10, MID: 10, DEF: 25, GK: 135 },
            trait: null,
            workRate: "Low",
            stamina: 70,
            aggression: 60,
            lore: "Sandy Compiler provides backup support in the goalkeeper slot for Zenith Ascendants. He trains extensively under Clara Fletcher's direction to improve his sweeping range. He spends his free time constructing model skyships."
        }
    ],
    // --- Aethelgard Royal FC (club_8) ---
    [
        {
            name: "Tiberius Taylor",
            position: "FW",
            rarity: "LEGEND",
            stats: { ATT: 145, MID: 75, DEF: 40, GK: 10 },
            trait: "Poacher",
            workRate: "High",
            stamina: 95,
            aggression: 70,
            lore: "Tiberius Taylor is a noble forward who brings grace and lethal finishing to Aethelgard. He famously danced around [[p_241|Reginald Lake]]'s defense in the Crown Amphitheater, sealing a 1-0 victory to honor Manager Javier Lake's possession tactics. Taylor is a student of classical fencing, which he claims gives him superior balance."
        },
        {
            name: "Thorin Sol",
            position: "FW",
            rarity: "ELITE",
            stats: { ATT: 125, MID: 70, DEF: 35, GK: 10 },
            trait: "Poacher",
            workRate: "High",
            stamina: 90,
            aggression: 65,
            lore: "Thorin Sol is an elite forward who brings technical elegance to Aethelgard's frontline. He operates in perfect harmony with [[p_141|Tiberius Taylor]] under Javier Lake's possession system, exploiting half-spaces with precise timing. The training staff highly commends his spatial intelligence."
        },
        {
            name: "Freya Finch",
            position: "FW",
            rarity: "RARE",
            stats: { ATT: 110, MID: 60, DEF: 30, GK: 10 },
            trait: "False Nine",
            workRate: "Medium",
            stamina: 80,
            aggression: 60,
            lore: "Freya Finch is a creative winger who excels at pulling defenders out of position. Under Javier Lake's possession tactics, he creates overlap lanes for [[p_141|Tiberius Taylor]] to exploit in the box. He spent his early years as an optical technician."
        },
        {
            name: "Loki Kepler",
            position: "FW",
            rarity: "COMMON",
            stats: { ATT: 95, MID: 50, DEF: 25, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 55,
            lore: "Loki Kepler is a hardworking squad forward who came through the Aethelgard youth ranks. Discovered by Orion Sky, he uses data analytics to study the positioning of [[p_141|Tiberius Taylor]]. He is an avid builder of glass sculptures."
        },
        {
            name: "Bjorn Flare",
            position: "FW",
            rarity: "COMMON",
            stats: { ATT: 90, MID: 55, DEF: 25, GK: 10 },
            trait: null,
            workRate: "Low",
            stamina: 70,
            aggression: 50,
            lore: "Bjorn Flare provides solid depth to the Aethelgard attack during congested schedules. He works closely with Orion Sky to refine his passing sequences and support [[p_141|Tiberius Taylor]]. He always carries a lucky glass bead."
        },
        {
            name: "Leo Jones",
            position: "MF",
            rarity: "ELITE",
            stats: { ATT: 60, MID: 110, DEF: 60, GK: 10 },
            trait: "Playmaker",
            workRate: "High",
            stamina: 95,
            aggression: 75,
            lore: "Leo Jones is the midfield orchestrator for Aethelgard Royal FC. Under Javier Lake's possession philosophy, he maintains a near-perfect pass completion rate, feeding creative balls to [[p_141|Tiberius Taylor]]. The technical director praises his spatial analysis and vision."
        },
        {
            name: "Fang Ramirez",
            position: "MF",
            rarity: "RARE",
            stats: { ATT: 55, MID: 95, DEF: 50, GK: 10 },
            trait: "Captain",
            workRate: "Medium",
            stamina: 85,
            aggression: 70,
            lore: "Fang Ramirez is a veteran midfielder who controls the flow of the match. He acts as Javier Lake's tactical general, ensuring [[p_141|Tiberius Taylor]] is constantly integrated into possession triangles. He spends his off-time studying historical stellar maps."
        },
        {
            name: "Hugo Void",
            position: "MF",
            rarity: "RARE",
            stats: { ATT: 50, MID: 100, DEF: 50, GK: 10 },
            trait: "Playmaker",
            workRate: "Medium",
            stamina: 80,
            aggression: 65,
            lore: "Hugo Void is a technical midfielder who excels at breaking down defensive low blocks. He coordinates with [[p_141|Tiberius Taylor]] to create scoring angles. He spent his early career aligning laser optics in processor labs."
        },
        {
            name: "Max Bold",
            position: "MF",
            rarity: "COMMON",
            stats: { ATT: 45, MID: 80, DEF: 45, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 60,
            lore: "Max Bold is a dependable midfielder who helps maintain the tempo of Aethelgard's passing. Discovered by Orion Sky, he trains extensively on holographic simulator grids. He wears a specific green sweatband for superstition."
        },
        {
            name: "Kai Stone",
            position: "MF",
            rarity: "COMMON",
            stats: { ATT: 40, MID: 85, DEF: 45, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 70,
            aggression: 70,
            lore: "Kai Stone is a defensive midfielder who excels in recovering loose balls. Under Javier Lake's guidance, he stabilizes the center, allowing [[p_141|Tiberius Taylor]] to remain high. Outside of football, he helps build water-cooled computers."
        },
        {
            name: "Finn Crown",
            position: "MF",
            rarity: "COMMON",
            stats: { ATT: 50, MID: 75, DEF: 45, GK: 10 },
            trait: null,
            workRate: "Low",
            stamina: 65,
            aggression: 55,
            lore: "Finn Crown is a technical midfielder who provides valuable squad depth during rotations. He trains to match the tactical positioning of [[p_141|Tiberius Taylor]] and follows Javier Lake's strict guidelines. He relaxes by playing chess."
        },
        {
            name: "Axel Sato",
            position: "DF",
            rarity: "ELITE",
            stats: { ATT: 35, MID: 70, DEF: 125, GK: 10 },
            trait: "Wall",
            workRate: "High",
            stamina: 90,
            aggression: 80,
            lore: "Axel Sato is an imposing center-back who forms the foundation of Aethelgard's defensive line. He works in tandem with [[p_141|Tiberius Taylor]]'s attacking line, providing solid security that allows the team to commit forward. Javier Lake praises his aerial interception rate."
        },
        {
            name: "Jude Byte",
            position: "DF",
            rarity: "RARE",
            stats: { ATT: 30, MID: 60, DEF: 110, GK: 10 },
            trait: "Enforcer",
            workRate: "Medium",
            stamina: 85,
            aggression: 85,
            lore: "Jude Byte is a fierce defender whose physical tackles disrupt opponent counters. He acts as the main security guard for Aethelgard's high-possession block, shielding [[p_141|Tiberius Taylor]] from turnover pressure. He spends his off-time studying neural networks."
        },
        {
            name: "Luca Williams",
            position: "DF",
            rarity: "RARE",
            stats: { ATT: 25, MID: 65, DEF: 110, GK: 10 },
            trait: "Wall",
            workRate: "Medium",
            stamina: 80,
            aggression: 75,
            lore: "Luca Williams is a calm fullback who excels at positioning and intercepting passes. He maintains the defensive shape under Javier Lake's possession system, allowing [[p_141|Tiberius Taylor]] to focus on deep runs. He spends hours reviewing game tapes with Orion Sky."
        },
        {
            name: "Zane Forest",
            position: "DF",
            rarity: "COMMON",
            stats: { ATT: 25, MID: 50, DEF: 95, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 70,
            lore: "Zane Forest is a reliable defender who was signed from a local cyber-athletics club. Discovered by Orion Sky, he trains diligently to emulate the tactical vision of [[p_141|Tiberius Taylor]]. He is known to carry a lucky silver bolt in his kit bag."
        },
        {
            name: "Ryder Adams",
            position: "DF",
            rarity: "COMMON",
            stats: { ATT: 20, MID: 55, DEF: 95, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 70,
            aggression: 80,
            lore: "Ryder Adams is a disciplined defender who focuses on blocking wing crosses. He relies heavily on Orion Sky's tactical reports to adjust his marking angles. He enjoys designing holographic art for the stadium screens."
        },
        {
            name: "Colt Miller",
            position: "DF",
            rarity: "COMMON",
            stats: { ATT: 30, MID: 45, DEF: 95, GK: 10 },
            trait: null,
            workRate: "Low",
            stamina: 60,
            aggression: 75,
            lore: "Colt Miller is a physical defender who provides backup depth for the backline. He studies the movement patterns of [[p_141|Tiberius Taylor]] to coordinate long ball clearances out of the defensive block. He is an amateur robotics enthusiast."
        },
        {
            name: "Nash Wave",
            position: "GK",
            rarity: "RARE",
            stats: { ATT: 10, MID: 10, DEF: 30, GK: 160 },
            trait: "Super Sub",
            workRate: "Medium",
            stamina: 85,
            aggression: 55,
            lore: "Nash Wave is a highly analytical goalkeeper who acts as the distributor in Javier Lake's possession build-ups. He coordinates with [[p_141|Tiberius Taylor]] to initiate counter-offenses from the back. His calm demeanor has earned him immense praise from fans."
        },
        {
            name: "Knox Davis",
            position: "GK",
            rarity: "COMMON",
            stats: { ATT: 10, MID: 10, DEF: 20, GK: 140 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 50,
            lore: "Knox Davis is a backup goalkeeper who came through the metropolitan junior leagues. Discovered by Orion Sky, he works hard to perfect his ball distribution. He wears a specific blue glove on his left hand for superstition."
        },
        {
            name: "Beck Shores",
            position: "GK",
            rarity: "COMMON",
            stats: { ATT: 10, MID: 10, DEF: 25, GK: 135 },
            trait: null,
            workRate: "Low",
            stamina: 70,
            aggression: 60,
            lore: "Beck Shores provides backup support in the goalkeeper slot for Aethelgard Royal FC. He trains extensively under Javier Lake's possession drills to improve his sweeping range. He spends his free time constructing model skyships."
        }
    ],
    // --- Titan Foundry FC (club_9) ---
    [
        {
            name: "Matteo Glacier",
            position: "FW",
            rarity: "LEGEND",
            stats: { ATT: 145, MID: 75, DEF: 40, GK: 10 },
            trait: "Poacher",
            workRate: "High",
            stamina: 95,
            aggression: 85,
            lore: "Matteo Glacier is a physical powerhouse of Titan Foundry who bulldozes through the toughest defensive lines. He famously broke the deadlock against [[p_381|Zephyr Matrix]] with a raw power shot that tore the hard-light net, satisfying manager Caspian Zephyr's direct style. He keeps a piece of glacial ice in his locker for good luck."
        },
        {
            name: "Cruz Thunder",
            position: "FW",
            rarity: "ELITE",
            stats: { ATT: 125, MID: 70, DEF: 35, GK: 10 },
            trait: "Poacher",
            workRate: "High",
            stamina: 90,
            aggression: 80,
            lore: "Cruz Thunder is a direct and physical striker who excels in target aerial duels under Caspian Zephyr. He coordinates with [[p_161|Matteo Glacier]] to pressure opposing center-backs, flicking down long balls for instant shot setups. The coaching staff highly praises his focus."
        },
        {
            name: "Drake Shields",
            position: "FW",
            rarity: "RARE",
            stats: { ATT: 110, MID: 60, DEF: 30, GK: 10 },
            trait: "Super Sub",
            workRate: "High",
            stamina: 85,
            aggression: 75,
            lore: "Drake Shields is a fast winger who provides width to Titan's direct attacks. Under Caspian Zephyr's Route One tactics, he operates as a key transition outlet, feeding crosses to [[p_161|Matteo Glacier]]. He spends his spare time studying wind tunnel dynamics."
        },
        {
            name: "Gavin Trickster",
            position: "FW",
            rarity: "COMMON",
            stats: { ATT: 95, MID: 50, DEF: 25, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 70,
            lore: "Gavin Trickster is a hard-working forward who progressed through the Titan youth system. Discovered by Leopold Adder, he spends his training hours tracking the movements of [[p_161|Matteo Glacier]]. He is highly superstitious about lacing his right boot twice."
        },
        {
            name: "Kaelen Pride",
            position: "FW",
            rarity: "COMMON",
            stats: { ATT: 90, MID: 55, DEF: 25, GK: 10 },
            trait: null,
            workRate: "Low",
            stamina: 70,
            aggression: 60,
            lore: "Kaelen Pride provides robust depth in the striker roster for Titan Foundry. He works with Leopold Adder to refine his off-the-ball movements to create space for [[p_161|Matteo Glacier]]. He carries a lucky iron token from his home town."
        },
        {
            name: "Devin Roberts",
            position: "MF",
            rarity: "ELITE",
            stats: { ATT: 60, MID: 110, DEF: 60, GK: 10 },
            trait: "Playmaker",
            workRate: "High",
            stamina: 95,
            aggression: 80,
            lore: "Devin Roberts is the midfield launcher for Titan Foundry. Under Caspian Zephyr's Route One philosophy, he is responsible for launching immediate vertical balls to [[p_161|Matteo Glacier]]. The tactical department rates his long passing coordinates among the highest."
        },
        {
            name: "Brody Wolf",
            position: "MF",
            rarity: "RARE",
            stats: { ATT: 55, MID: 95, DEF: 50, GK: 10 },
            trait: "Captain",
            workRate: "Medium",
            stamina: 85,
            aggression: 75,
            lore: "Brody Wolf is a rugged midfielder who dominates the central channels for Titan. He helps enforce Caspian Zephyr's direct system, ensuring [[p_161|Matteo Glacier]] is supported during physical link plays. He enjoys studying historical steam engine blueprints."
        },
        {
            name: "Keegan Hawthorne",
            position: "MF",
            rarity: "RARE",
            stats: { ATT: 50, MID: 100, DEF: 50, GK: 10 },
            trait: "Playmaker",
            workRate: "Medium",
            stamina: 80,
            aggression: 70,
            lore: "Keegan Hawthorne uses his exceptional vision to hit deep line-breaking passes. He works closely with [[p_161|Matteo Glacier]] to execute rapid transition sequences. He spent his early career as an electrical technician in the forge."
        },
        {
            name: "Ronan Blackwood",
            position: "MF",
            rarity: "COMMON",
            stats: { ATT: 45, MID: 80, DEF: 45, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 65,
            lore: "Ronan Blackwood is a dependable midfielder who excels at retrieving loose ball clearances. Discovered by Leopold Adder, he trains on hard-light simulator grids. He is superstitious about wearing black wristbands."
        },
        {
            name: "Declan Redwood",
            position: "MF",
            rarity: "COMMON",
            stats: { ATT: 40, MID: 85, DEF: 45, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 70,
            aggression: 70,
            lore: "Declan Redwood is an aggressive midfielder who excels in recovering second balls. Under Caspian Zephyr's guidance, he stabilizes the midfield, allowing [[p_161|Matteo Glacier]] to stay forward. Outside of soccer, he enjoys drone building."
        },
        {
            name: "Kian Oak",
            position: "MF",
            rarity: "COMMON",
            stats: { ATT: 50, MID: 75, DEF: 45, GK: 10 },
            trait: null,
            workRate: "Low",
            stamina: 65,
            aggression: 60,
            lore: "Kian Oak is a technical midfielder who provides valuable squad depth during rotations. He trains to match the tactical positioning of [[p_161|Matteo Glacier]] and follows Caspian Zephyr's strict guidelines. He relaxes by sketching."
        },
        {
            name: "Rowan Pine",
            position: "DF",
            rarity: "ELITE",
            stats: { ATT: 35, MID: 70, DEF: 125, GK: 10 },
            trait: "Wall",
            workRate: "High",
            stamina: 90,
            aggression: 85,
            lore: "Rowan Pine is an imposing center-back who forms the bedrock of Titan's defense. He coordinates with [[p_161|Matteo Glacier]]'s attacking line, providing solid security that allows the team to play long clearances. Caspian Zephyr praises his high tackle success rate."
        },
        {
            name: "Cassian Frost",
            position: "DF",
            rarity: "RARE",
            stats: { ATT: 30, MID: 60, DEF: 110, GK: 10 },
            trait: "Enforcer",
            workRate: "Medium",
            stamina: 85,
            aggression: 85,
            lore: "Cassian Frost is a physical defender whose aggressive style disrupts opposition counters. He protects the Titan defensive line under Caspian Zephyr's direct system, enabling [[p_161|Matteo Glacier]] to stay high. He studies mechanical structural design."
        },
        {
            name: "Dorian Winter",
            position: "DF",
            rarity: "RARE",
            stats: { ATT: 25, MID: 65, DEF: 110, GK: 10 },
            trait: "Wall",
            workRate: "Medium",
            stamina: 80,
            aggression: 75,
            lore: "Dorian Winter is a calm fullback who excels at positioning and intercepting passes. He maintains the defensive shape under Caspian Zephyr's direct system, allowing [[p_161|Matteo Glacier]] to focus on deep runs. He spends hours reviewing game tapes with Leopold Adder."
        },
        {
            name: "Caspian Snow",
            position: "DF",
            rarity: "COMMON",
            stats: { ATT: 25, MID: 50, DEF: 95, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 70,
            lore: "Caspian Snow is a reliable defender who was signed from a local forge workshop. Discovered by Leopold Adder, he trains diligently to emulate the tactical vision of [[p_161|Matteo Glacier]]. He is known to carry a lucky silver bolt in his kit bag."
        },
        {
            name: "Lucian Glacier",
            position: "DF",
            rarity: "COMMON",
            stats: { ATT: 20, MID: 55, DEF: 95, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 70,
            aggression: 80,
            lore: "Lucian Glacier is a disciplined defender who focuses on blocking wing crosses. He relies heavily on Leopold Adder's tactical reports to adjust his marking angles. He enjoys designing holographic art for the stadium screens."
        },
        {
            name: "Kieran Ice",
            position: "DF",
            rarity: "COMMON",
            stats: { ATT: 30, MID: 45, DEF: 95, GK: 10 },
            trait: null,
            workRate: "Low",
            stamina: 60,
            aggression: 75,
            lore: "Kieran Ice is a physical defender who provides backup depth for the backline. He studies the movement patterns of [[p_161|Matteo Glacier]] to coordinate long ball clearances out of the defensive block. He is an amateur robotics enthusiast."
        },
        {
            name: "Evander Stone",
            position: "GK",
            rarity: "RARE",
            stats: { ATT: 10, MID: 10, DEF: 30, GK: 160 },
            trait: "Super Sub",
            workRate: "Medium",
            stamina: 85,
            aggression: 55,
            lore: "Evander Stone is a highly analytical goalkeeper who acts as the distributor in Caspian Zephyr's direct build-ups. He coordinates with [[p_161|Matteo Glacier]] to initiate counter-offenses from the back. His calm demeanor has earned him immense praise from fans."
        },
        {
            name: "Leander Rock",
            position: "GK",
            rarity: "COMMON",
            stats: { ATT: 10, MID: 10, DEF: 20, GK: 140 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 50,
            lore: "Leander Rock is a backup goalkeeper who came through the metropolitan junior leagues. Discovered by Leopold Adder, he works hard to perfect his ball distribution. He wears a specific blue glove on his left hand for superstition."
        },
        {
            name: "Lysander Clay",
            position: "GK",
            rarity: "COMMON",
            stats: { ATT: 10, MID: 10, DEF: 25, GK: 135 },
            trait: null,
            workRate: "Low",
            stamina: 70,
            aggression: 60,
            lore: "Lysander Clay provides backup support in the goalkeeper slot for Titan Foundry FC. He trains extensively under Caspian Zephyr's direction to improve his sweeping range. He spends his free time constructing model skyships."
        }
    ],
    // --- Ironclad Harbors (club_10) ---
    [
        {
            name: "Cornelius Gorge",
            position: "FW",
            rarity: "LEGEND",
            stats: { ATT: 145, MID: 75, DEF: 40, GK: 10 },
            trait: "Poacher",
            workRate: "High",
            stamina: 95,
            aggression: 85,
            lore: "Cornelius Gorge is a relentless target forward who embodies the grit of Ironclad Harbors. He secured a legendary comeback against [[p_121|Fabian Thunder]]'s side by scoring two headers from corner kicks under the rain, executing Simeon Sword's low block counter. He was formerly a dock welder before passing a public open trial."
        },
        {
            name: "Alistair Flint",
            position: "FW",
            rarity: "ELITE",
            stats: { ATT: 125, MID: 70, DEF: 35, GK: 10 },
            trait: "Poacher",
            workRate: "High",
            stamina: 90,
            aggression: 80,
            lore: "Alistair Flint is an elite forward who excels in physical transition play under Simeon Sword. He partners with [[p_181|Cornelius Gorge]] to form a robust strike duo, pressing opposition defenders and creating space in deep low blocks. The coaching staff highly values his work rate."
        },
        {
            name: "Valerius Slate",
            position: "FW",
            rarity: "RARE",
            stats: { ATT: 110, MID: 60, DEF: 30, GK: 10 },
            trait: "Super Sub",
            workRate: "High",
            stamina: 85,
            aggression: 75,
            lore: "Valerius Slate is an agile winger who provides width to Ironclad's transitions. Under Simeon Sword's counter-attack press philosophy, he serves as a key outlet, delivering precise crosses to [[p_181|Cornelius Gorge]]. He studies maritime navigation to relax."
        },
        {
            name: "Gideon Ridge",
            position: "FW",
            rarity: "COMMON",
            stats: { ATT: 95, MID: 50, DEF: 25, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 70,
            lore: "Gideon Ridge is an energetic young striker who came up through the Ironclad youth ranks. Discovered by Barnaby Vega, he spends his training hours tracking the movements of [[p_181|Cornelius Gorge]]. He is superstitious about always entering the pitch with his left foot."
        },
        {
            name: "Simeon Peak",
            position: "FW",
            rarity: "COMMON",
            stats: { ATT: 90, MID: 55, DEF: 25, GK: 10 },
            trait: null,
            workRate: "Low",
            stamina: 70,
            aggression: 60,
            lore: "Simeon Peak provides physical depth in the striker rotation for Ironclad Harbors. He works with Barnaby Vega to improve his positioning and create space for [[p_181|Cornelius Gorge]]. He wears a lucky iron bolt in his sock."
        },
        {
            name: "Thaddeus Vale",
            position: "MF",
            rarity: "ELITE",
            stats: { ATT: 60, MID: 110, DEF: 60, GK: 10 },
            trait: "Playmaker",
            workRate: "High",
            stamina: 95,
            aggression: 80,
            lore: "Thaddeus Vale is the midfield launcher for Ironclad Harbors. He excels in Simeon Sword's counter-attack press style, reclaiming possession in the center and feeding balls directly to [[p_181|Cornelius Gorge]]. The coaching staff highly values his vision."
        },
        {
            name: "Tobias Dale",
            position: "MF",
            rarity: "RARE",
            stats: { ATT: 55, MID: 95, DEF: 50, GK: 10 },
            trait: "Captain",
            workRate: "Medium",
            stamina: 85,
            aggression: 75,
            lore: "Tobias Dale is a veteran midfielder who controls the flow of transition play. He acts as Simeon Sword's voice on the pitch, ensuring that [[p_181|Cornelius Gorge]] is supported during counter-attacks. He is an avid student of coastal defense history."
        },
        {
            name: "Benedict Canyon",
            position: "MF",
            rarity: "RARE",
            stats: { ATT: 50, MID: 100, DEF: 50, GK: 10 },
            trait: "Playmaker",
            workRate: "Medium",
            stamina: 80,
            aggression: 70,
            lore: "Benedict Canyon is a technical midfielder who excels at breaking down low blocks during transitions. He works in close coordination with [[p_181|Cornelius Gorge]] to construct scoring angles. He spent his early career as an apprentice welder in the shipyard."
        },
        {
            name: "Dominic Gorge",
            position: "MF",
            rarity: "COMMON",
            stats: { ATT: 45, MID: 80, DEF: 45, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 65,
            lore: "Dominic Gorge is a reliable midfielder who helps recycle possession in tight channels. Discovered by Barnaby Vega, he trains extensively on holographic simulator grids. He is superstitious about wearing black wristbands."
        },
        {
            name: "Sebastian River",
            position: "MF",
            rarity: "COMMON",
            stats: { ATT: 40, MID: 85, DEF: 45, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 70,
            aggression: 70,
            lore: "Sebastian River is a defensive midfielder who focuses on retrieving loose ball clearances. Under Simeon Sword's direction, he helps protect the backline to free [[p_181|Cornelius Gorge]] from defensive duties. He enjoys building custom model skyships."
        },
        {
            name: "Julian Brook",
            position: "MF",
            rarity: "COMMON",
            stats: { ATT: 50, MID: 75, DEF: 45, GK: 10 },
            trait: null,
            workRate: "Low",
            stamina: 65,
            aggression: 60,
            lore: "Julian Brook is a technical midfielder who provides valuable squad depth during rotations. He trains to match the tactical positioning of [[p_181|Cornelius Gorge]] and follows Simeon Sword's strict guidelines. He enjoys playing acoustic guitar."
        },
        {
            name: "Adrian Lake",
            position: "DF",
            rarity: "ELITE",
            stats: { ATT: 35, MID: 70, DEF: 125, GK: 10 },
            trait: "Wall",
            workRate: "High",
            stamina: 90,
            aggression: 85,
            lore: "Adrian Lake is a commanding center-back who dominates the defensive third. He works in tandem with [[p_181|Cornelius Gorge]]'s attacking line, providing solid security that allows the team to play on the counter. Simeon Sword highly values his interception rate."
        },
        {
            name: "Fabian Ocean",
            position: "DF",
            rarity: "RARE",
            stats: { ATT: 30, MID: 60, DEF: 110, GK: 10 },
            trait: "Enforcer",
            workRate: "Medium",
            stamina: 85,
            aggression: 85,
            lore: "Fabian Ocean is a tough defender whose physical tackles disrupt opposition counters. He protects the Ironclad defensive line under Simeon Sword's counter-press system, enabling [[p_181|Cornelius Gorge]] to remain advanced. He spends his off-time studying maritime engineering."
        },
        {
            name: "Dante Tide",
            position: "DF",
            rarity: "RARE",
            stats: { ATT: 25, MID: 65, DEF: 110, GK: 10 },
            trait: "Wall",
            workRate: "Medium",
            stamina: 80,
            aggression: 75,
            lore: "Dante Tide is a calm fullback who excels at positioning and intercepting passes. He maintains the defensive shape under Simeon Sword's system, allowing [[p_181|Cornelius Gorge]] to focus on deep runs. He spends hours reviewing game tapes with Barnaby Vega."
        },
        {
            name: "Marco Current",
            position: "DF",
            rarity: "COMMON",
            stats: { ATT: 25, MID: 50, DEF: 95, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 70,
            lore: "Marco Current is a reliable defender who was signed from a local harbor community. Discovered by Barnaby Vega, he trains diligently to emulate the tactical vision of [[p_181|Cornelius Gorge]]. He is known to carry a lucky silver bolt in his kit bag."
        },
        {
            name: "Enzo Wave",
            position: "DF",
            rarity: "COMMON",
            stats: { ATT: 20, MID: 55, DEF: 95, GK: 10 },
            trait: null,
            workRate: "Medium",
            stamina: 70,
            aggression: 80,
            lore: "Enzo Wave is a disciplined fullback who focuses on blocking wing crosses. He relies heavily on Barnaby Vega's tactical reports to adjust his marking angles. He enjoys designing holographic art for the stadium screens."
        },
        {
            name: "Matteo Sands",
            position: "DF",
            rarity: "COMMON",
            stats: { ATT: 30, MID: 45, DEF: 95, GK: 10 },
            trait: null,
            workRate: "Low",
            stamina: 60,
            aggression: 75,
            lore: "Matteo Sands is a physical defender who provides backup depth for the backline. He studies the movement patterns of [[p_181|Cornelius Gorge]] to coordinate long ball clearances out of the defensive block. He is an amateur robotics enthusiast."
        },
        {
            name: "Nico Dune",
            position: "GK",
            rarity: "RARE",
            stats: { ATT: 10, MID: 10, DEF: 30, GK: 160 },
            trait: "Super Sub",
            workRate: "Medium",
            stamina: 85,
            aggression: 55,
            lore: "Nico Dune is a highly analytical goalkeeper who acts as the distributor in Simeon Sword's counter-attacking build-ups. He coordinates with [[p_181|Cornelius Gorge]] to initiate counter-offenses from the back. His calm demeanor has earned him immense praise from fans."
        },
        {
            name: "Giovanni Beach",
            position: "GK",
            rarity: "COMMON",
            stats: { ATT: 10, MID: 10, DEF: 20, GK: 140 },
            trait: null,
            workRate: "Medium",
            stamina: 75,
            aggression: 50,
            lore: "Giovanni Beach is a backup goalkeeper who came through the metropolitan junior leagues. Discovered by Barnaby Vega, he works hard to perfect his ball distribution. He wears a specific blue glove on his left hand for superstition."
        },
        {
            name: "Angelo Shore",
            position: "GK",
            rarity: "COMMON",
            stats: { ATT: 10, MID: 10, DEF: 25, GK: 135 },
            trait: null,
            workRate: "Low",
            stamina: 70,
            aggression: 60,
            lore: "Angelo Shore provides backup support in the goalkeeper slot for Ironclad Harbors. He trains extensively under Simeon Sword's counter-press drills to improve his sweeping range. He spends his free time constructing model skyships."
        }
    ]
];

for (let clubIdx = 0; clubIdx < 10; clubIdx++) {
    const club = CLUBS[clubIdx];
    const templates = SQUAD_TEMPLATES[clubIdx];
    
    if (templates.length !== 20) {
        console.error(`Error: Club ${club.name} has ${templates.length} players, expected 20!`);
        process.exit(1);
    }
    
    for (let playerIdx = 0; playerIdx < 20; playerIdx++) {
        const template = templates[playerIdx];
        
        // 1. Calculate player ID
        const id = `p_${clubIdx * 20 + playerIdx + 1}`;
        
        // 2. Validate position
        let expectedPos = 'MF';
        if (playerIdx < 5) expectedPos = 'FW';
        else if (playerIdx < 11) expectedPos = 'MF';
        else if (playerIdx < 17) expectedPos = 'DF';
        else expectedPos = 'GK';
        
        if (template.position !== expectedPos) {
            console.error(`Error: Player index ${playerIdx} has position ${template.position}, expected ${expectedPos}!`);
            process.exit(1);
        }
        
        // 3. Validate rarity and TSB budget
        const budgetMap = { COMMON: 180, RARE: 210, ELITE: 240, LEGEND: 270 };
        const budget = budgetMap[template.rarity];
        if (!budget) {
            console.error(`Error: Player ${template.name} has invalid rarity ${template.rarity}!`);
            process.exit(1);
        }
        
        const stats = template.stats;
        const statSum = stats.ATT + stats.MID + stats.DEF + stats.GK;
        if (statSum !== budget) {
            console.error(`Error: Player ${template.name} stats sum to ${statSum}, expected TSB budget of ${budget} for ${template.rarity}!`);
            process.exit(1);
        }
        
        // 4. Calculate rating
        let rating = 0;
        if (template.position === 'GK') {
            rating = stats.GK;
        } else if (template.position === 'FW') {
            rating = Math.floor(stats.ATT * 0.6 + stats.MID * 0.4);
        } else if (template.position === 'DF') {
            rating = Math.floor(stats.DEF * 0.6 + stats.MID * 0.4);
        } else if (template.position === 'MF') {
            rating = Math.floor(stats.MID * 0.5 + stats.ATT * 0.25 + stats.DEF * 0.25);
        }
        
        // 5. Setup trait
        const traitObj = template.trait ? TRAITS[template.trait] : null;
        if (template.trait && !traitObj) {
            console.error(`Error: Player ${template.name} has invalid trait ${template.trait}!`);
            process.exit(1);
        }
        
        // Add to players array
        players.push({
            id: id,
            name: template.name,
            clubId: club.id,
            clubName: club.name,
            position: template.position,
            rarity: template.rarity,
            stats: stats,
            rating: rating,
            trait: traitObj,
            workRate: template.workRate,
            stamina: template.stamina,
            aggression: template.aggression,
            lore: template.lore
        });
    }
}

// Ensure unique names across all 200 players
const names = new Set();
for (const p of players) {
    if (names.has(p.name)) {
        console.error(`Error: Duplicate player name found: ${p.name}`);
        process.exit(1);
    }
    names.add(p.name);
}

// Write the squads data to c:\Users\kevin\OneDrive\Desktop\Projects\Pitch Control\src\data\squads_batch_1.json
const destPath = path.join('src', 'data', 'squads_batch_1.json');
fs.writeFileSync(destPath, JSON.stringify(players, null, 4));
console.log(`Successfully generated squads_batch_1.json with ${players.length} players!`);
