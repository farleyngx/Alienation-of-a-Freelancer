import React from 'react';
import { useGameState } from '../hooks/useGameState';
import { StatBar } from './StatBar';

export const GameScreen: React.FC = () => {
  const { state, currentNode, makeChoice, resetGame } = useGameState();

  if (!currentNode) {
    return <div className="text-red-500 p-8">Lỗi kịch bản: Node không tồn tại!</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-mono flex flex-col justify-between p-4 md:p-8 selection:bg-emerald-500 selection:text-slate-900">
      {/* HEADER: TÊN TRÒ CHƠI */}
      <header className="border-b border-slate-800/80 pb-4 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-xl md:text-3xl font-extrabold tracking-wider text-emerald-400 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] animate-pulse">
            🌐 BẪY TỰ DO: VÒNG LẶP THUẬT TOÁN
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 font-sans tracking-wide">Platform Capitalism Simulation v1.1.0 — Creative Production for MLN111</p>
        </div>
        <div className="hidden md:block text-right text-xs text-slate-500 font-sans">
          Trạng thái: <span className="text-emerald-400 font-bold animate-ping">●</span> Đang kết nối
        </div>
      </header>

      {/* THÂN GAME: CHIA ĐÔI MÀN HÌNH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start flex-grow">
        
        {/* CỘT TRÁI: KHU VỰC CHỈ SỐ NHÂN VẬT (BỊ QUẢN LÝ BỞI REACT STATE) */}
        <div className="lg:col-span-1 bg-slate-900/50 p-6 rounded-lg border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-800 pb-2">
            Trạng thái người lao động
          </h2>
          <StatBar label="💰 Tài chính (Tư bản)" value={state.stats.money} color="bg-amber-500" />
          <StatBar label="💖 Sức lao động (HP)" value={state.stats.health} color="bg-rose-500" />
          <StatBar label="🕊️ Mức độ tự do" value={state.stats.freedom} color="bg-sky-500" />
          <StatBar label="👀 Độ ưu tiên (Traffic)" value={state.stats.traffic} color="bg-indigo-500" />
          <StatBar label="🧠 Bản sắc cá nhân" value={state.stats.identity} color="bg-emerald-500" />
        </div>

        {/* CỘT PHẢI: KHU VỰC CỐT TRUYỆN & LỰA CHỌN */}
        <div className="lg:col-span-2 flex flex-col justify-between bg-slate-900 border border-slate-800 rounded-lg p-6 min-h-[400px]">
          {/* KHU VỰC HIỂN THỊ LỜI THOẠI */}
          <div className="space-y-4 mb-8">
            <span className={`text-xs px-2.5 py-1 rounded font-bold tracking-wider uppercase inline-block border transition-all duration-300 ${
              currentNode.speaker === 'ALGORITHM' ? 'bg-red-950/80 text-red-400 border-red-900 shadow-sm shadow-red-950' :
              currentNode.speaker === 'PLAYER' ? 'bg-blue-950/80 text-blue-400 border-blue-900 shadow-sm shadow-blue-950' :
              currentNode.speaker === 'CLIENT' ? 'bg-amber-950/80 text-amber-400 border-amber-900 shadow-sm shadow-amber-950' :
              currentNode.speaker === 'UNION' ? 'bg-emerald-950/80 text-emerald-400 border-emerald-900 shadow-sm shadow-emerald-950' :
              currentNode.speaker === 'SYSTEM' ? 'bg-slate-900 text-rose-500 border-rose-950/60 shadow-sm shadow-rose-950/20' :
              'bg-slate-800 text-slate-300 border-slate-700'
            }`}>
              {currentNode.speaker === 'ALGORITHM' ? '🤖 THE ALGORITHM' :
               currentNode.speaker === 'PLAYER' ? '👩‍💻 YOU (FREELANCER)' :
               currentNode.speaker === 'CLIENT' ? '💼 CLIENT (KHÁCH HÀNG)' :
               currentNode.speaker === 'UNION' ? '✊ DIGITAL UNION (NGHIỆP ĐOÀN SỐ)' :
               currentNode.speaker === 'SYSTEM' ? '🚨 SYSTEM ALERT' : '📝 NARRATOR'}
            </span>
            <p className="text-base md:text-lg text-slate-200 leading-relaxed whitespace-pre-wrap border-l-2 border-emerald-500/30 pl-4 py-1 italic font-sans">
              {currentNode.text}
            </p>
          </div>

          {/* KHU VỰC CÁC LỰA CHỌN HÀNH ĐỘNG */}
          <div className="space-y-3">
            {currentNode.is_ending ? (
              <button
                onClick={resetGame}
                className="w-full text-center py-3 px-4 rounded bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold transition-all border border-transparent active:scale-[0.99]"
              >
                🔄 Chơi lại từ đầu (Vòng lặp mới)
              </button>
            ) : (
              currentNode.options.map((option: any, index: number) => (
                <button
                  key={index}
                  onClick={() => makeChoice(option)}
                  className="w-full text-left py-3 px-4 rounded bg-slate-800/80 hover:bg-slate-800 text-sm md:text-base text-slate-200 hover:text-emerald-400 border border-slate-700/50 hover:border-emerald-500/50 transition-all group flex items-start gap-3 active:scale-[0.99]"
                >
                  <span className="text-emerald-500 font-bold group-hover:translate-x-1 transition-transform">👉</span>
                  <span>{option.text}</span>
                </button>
              ))
            )}
          </div>
        </div>

      </div>

      {/* FOOTER TRIẾT HỌC */}
      <footer className="mt-8 pt-4 border-t border-slate-800 text-center text-xs text-slate-600">
        "Tự do trong xã hội tư bản số chỉ là ảo tưởng khi tư liệu sản xuất tối cao thuộc về Thuật toán."
      </footer>
    </div>
  );
};