/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useGameState } from '../../hooks/useGameState';
import { StatBar } from '../scratches/StatBar';
import { CharacterSprite } from '../sprite_sheets/CharacterSprite';

export const GameScreen: React.FC = () => {
  const { state, currentNode, makeChoice, resetGame } = useGameState();

  if (!currentNode) {
    return <div className="text-red-500 p-8 font-['Press_Start_2P']">Lỗi kịch bản: Node không tồn tại!</div>;
  }

  // Quyết định trạng thái nhân vật dựa trên HP
  const characterMood = state.stats.health < 40 ? 'tired' : 'happy';

  // Lấy màu sắc retro cho loa (speaker)
  const getSpeakerColor = (speaker: string) => {
    switch(speaker) {
      case 'ALGORITHM': return 'text-red-500';
      case 'PLAYER': return 'text-blue-400';
      case 'CLIENT': return 'text-yellow-400';
      case 'UNION': return 'text-green-400';
      case 'SYSTEM': return 'text-red-600 animate-pulse';
      default: return 'text-gray-300';
    }
  };

  const getSpeakerName = (speaker: string) => {
    switch(speaker) {
      case 'ALGORITHM': return 'THUẬT TOÁN';
      case 'PLAYER': return 'BẠN (NGƯỜI LAO ĐỘNG)';
      case 'CLIENT': return 'KHÁCH HÀNG';
      case 'UNION': return 'NGHIỆP ĐOÀN SỐ';
      case 'SYSTEM': return 'HỆ THỐNG CẢNH BÁO';
      default: return 'NGƯỜI DẪN TRUYỆN';
    }
  };

  const getGridColsClass = (num: number) => {
    if (num === 1) return 'grid-cols-1';
    if (num === 2) return 'grid-cols-1 md:grid-cols-2';
    if (num === 3) return 'grid-cols-1 md:grid-cols-3';
    if (num >= 4) return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4';
    return 'grid-cols-1';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-4 md:p-8 flex flex-col selection:bg-green-500 selection:text-black">
      
      <div className="flex-1 w-full mx-auto flex flex-col">
        
        {/* MAIN GAME AREA */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* 1. TOP BAR: STATS */}
          <div className="flex flex-wrap md:flex-nowrap gap-2 md:gap-4 mb-8 border-4 border-slate-700 p-3 bg-slate-900 shadow-[4px_4px_0_rgba(0,0,0,1)] font-mono font-bold">
        <StatBar label="TÀI CHÍNH" value={state.stats.money} color="bg-yellow-400" />
        <StatBar label="SỨC KHỎE" value={state.stats.health} color="bg-red-500" />
        <StatBar label="TỰ DO" value={state.stats.freedom} color="bg-blue-400" />
        <StatBar label="TƯƠNG TÁC" value={state.stats.traffic} color="bg-purple-500" />
        <StatBar label="BẢN SẮC" value={state.stats.identity} color="bg-green-400" />
      </div>

      {/* 2. CENTER STAGE: CHARACTER */}
      <div className="flex-1 flex flex-col justify-center items-center relative min-h-[250px] mb-6">
        {/* Glow background cho nhân vật */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/40 via-transparent to-transparent z-0 pointer-events-none"></div>
        
        {/* Sprite */}
        <CharacterSprite mood={characterMood} />
        
        {/* Retro scanlines effect */}
        <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-50"></div>
      </div>

      {/* 3. BOTTOM PANEL: DIALOG & CHOICES */}
      <div className="flex flex-col gap-4 w-full">
        
        {/* Lời thoại */}
        <div className="border-4 border-slate-300 bg-slate-900 p-4 md:p-6 shadow-[8px_8px_0_rgba(0,0,0,1)] relative">
          <div className={`text-[12px] md:text-sm mb-4 font-bold uppercase tracking-widest ${getSpeakerColor(currentNode.speaker)} font-mono`}>
            ► {getSpeakerName(currentNode.speaker)}
          </div>
          {/* Dùng font Mono để hỗ trợ Tiếng Việt không bị lỗi */}
          <p className="text-sm md:text-base font-mono leading-relaxed md:leading-loose text-slate-300 whitespace-pre-wrap mb-4">
            {currentNode.text}
          </p>
          
          {/* Nhấp nháy "Tiếp tục" indicator */}
          <div className="absolute bottom-3 right-4 text-green-400 animate-pulse text-[10px]">▼</div>
        </div>

        {/* Lựa chọn */}
        <div className={`grid ${currentNode.is_ending ? 'grid-cols-1' : getGridColsClass(currentNode.options.length)} gap-3 font-mono`}>
          {currentNode.is_ending ? (
            <button
              onClick={resetGame}
              className="w-full text-center py-4 px-4 border-4 border-green-500 bg-green-950 text-green-400 hover:bg-green-400 hover:text-black transition-colors shadow-[4px_4px_0_rgba(0,0,0,1)] text-sm font-bold uppercase leading-relaxed active:translate-y-1 active:translate-x-1 active:shadow-none"
            >
              &gt; CHƠI LẠI TỪ ĐẦU
            </button>
          ) : (
            currentNode.options.map((option: any, index: number) => (
              <button
                key={index}
                onClick={() => makeChoice(option)}
                className="w-full text-left py-3 px-4 border-4 border-slate-500 bg-slate-800 text-slate-300 hover:border-white hover:bg-slate-700 hover:text-white transition-colors shadow-[4px_4px_0_rgba(0,0,0,1)] text-sm leading-relaxed active:translate-y-1 active:translate-x-1 active:shadow-none flex gap-2 items-start"
              >
                <span className="text-yellow-400 shrink-0 font-bold mt-1">*</span>
                <span>{option.text}</span>
              </button>
            ))
          )}
        </div>
        
      </div>
      
        </div> {/* End Main Area */}

      </div> {/* End Layout Container */}
    </div>
  );
};