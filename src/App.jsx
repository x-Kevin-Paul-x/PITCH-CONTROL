import React from 'react';
import { GameProvider, useGameState } from './hooks/useGameState';
import MainMenu from './components/MainMenu';
import PackOpening from './components/PackOpening';
import SquadBuilder from './components/SquadBuilder';
import MatchEngine from './components/MatchEngine';
import StandardDuelMatch from './components/StandardDuelMatch';
import MultiplayerLobby from './components/MultiplayerLobby';
import MultiplayerMatch from './components/MultiplayerMatch';
import LoreBinder from './components/LoreBinder';
import './App.css';

const GameContainer = () => {
  const { phase } = useGameState();

  return (
    <div className="app-container">
      {phase === 'MENU' && <MainMenu />}
      {phase === 'PACK_OPENING' && <PackOpening />}
      {phase === 'SQUAD_BUILDING' && <SquadBuilder />}
      {phase === 'MATCH' && <MatchEngine />}
      {phase === 'DRAFT' && <StandardDuelMatch />}
      {phase === 'MULTIPLAYER_LOBBY' && <MultiplayerLobby />}
      {phase === 'MULTIPLAYER_MATCH' && <MultiplayerMatch />}
      {phase === 'LORE_BINDER' && <LoreBinder />}
    </div>
  );
};

function App() {
  return (
    <GameProvider>
      <GameContainer />
    </GameProvider>
  );
}

export default App;
