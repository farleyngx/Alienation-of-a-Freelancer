import { useState } from 'react';
import { GameScreen } from './components/screens/GameScreen';
import { StartScreen } from './components/screens/StartScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState<'start' | 'game'>('start');

  return (
    <div className="bg-[#0a0a0c] min-h-screen antialiased selection:bg-emerald-500 selection:text-slate-950">
      {currentScreen === 'start' ? (
        <StartScreen onStart={() => setCurrentScreen('game')} />
      ) : (
        <GameScreen />
      )}
    </div>
  );
}

export default App;