import { GameScreen } from './components/GameScreen';

function App() {
  return (
    <div className="bg-slate-950 min-h-screen flex flex-col justify-center items-center p-0 m-0 antialiased selection:bg-emerald-500 selection:text-slate-950">
      {/* Container giới hạn độ rộng để game hiển thị đẹp như một ứng dụng Web Web-App độc lập */}
      <div className="w-full max-w-6xl mx-auto">
        <GameScreen />
      </div>
    </div>
  );
}

export default App;