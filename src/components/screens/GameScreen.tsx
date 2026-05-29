/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { StatBar } from '../scratches/StatBar';
import { CharacterSprite } from '../sprite_sheets/CharacterSprite';

export const GameScreen: React.FC = () => {
  const { state, currentNode, makeChoice, resetGame } = useGameState();

  const [hoveredOption, setHoveredOption] = useState<any>(null);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [textPages, setTextPages] = useState<string[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [floatingTexts, setFloatingTexts] = useState<Record<string, { id: string; amount: number; color: string }[]>>({
    money: [], health: [], freedom: [], traffic: [], identity: []
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const splitIntoPages = (text: string, maxLength: number = 300) => {
    const sentences = text.match(/[^.!?]+[.!?]*\s*/g)?.filter(s => s.trim().length > 0) || [text];
    const pages: string[] = [];
    let current = "";
    for (const s of sentences) {
      if (current.length + s.length > maxLength && current.length > 0) {
        pages.push(current.trim());
        current = s.trim();
      } else {
        current += (current ? " " : "") + s.trim();
      }
    }
    if (current.trim().length > 0) {
      pages.push(current.trim());
    }
    return pages;
  };

  useEffect(() => {
    if (!currentNode) return;
    const pages = splitIntoPages(currentNode.text, 180);
    setTextPages(pages);
    setCurrentPageIndex(0);
    setHoveredOption(null);
  }, [currentNode]);

  useEffect(() => {
    if (textPages.length === 0) return;
    
    setDisplayedText('');
    setIsTyping(true);

    if (intervalRef.current) clearInterval(intervalRef.current);

    let i = 0;
    const text = textPages[currentPageIndex];
    intervalRef.current = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsTyping(false);
      }
    }, 20);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [textPages, currentPageIndex]);

  const handleBoxClick = () => {
    if (isTyping) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplayedText(textPages[currentPageIndex]);
      setIsTyping(false);
    } else {
      if (currentPageIndex < textPages.length - 1) {
        setIsTyping(true);
        setCurrentPageIndex(prev => prev + 1);
      }
    }
  };

  const handleChoice = (option: any) => {
    if (option.next_node_id === 'RESET') {
      resetGame();
      return;
    }

    if (option.effects) {
      const newFloating: any = { ...floatingTexts };
      const id = Date.now().toString();
      Object.keys(option.effects).forEach(key => {
        const val = option.effects[key];
        const color = val > 0 ? '#4ade80' : '#f87171'; // green-400 : red-400
        newFloating[key] = [...(newFloating[key] || []), { id: `${key}-${id}`, amount: val, color }];
      });
      setFloatingTexts(newFloating);
      
      // Cleanup floating text after 1.5s
      setTimeout(() => {
        setFloatingTexts(prev => {
          const cleaned: any = { ...prev };
          Object.keys(cleaned).forEach(k => {
            cleaned[k] = cleaned[k].filter((ft: any) => !ft.id.endsWith(id));
          });
          return cleaned;
        });
      }, 1500);
    }
    
    setHoveredOption(null);
    makeChoice(option);
  };

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
      case 'PHILOSOPHY': return 'text-fuchsia-400';
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
      case 'PHILOSOPHY': return 'GÓC NHÌN TRIẾT HỌC';
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
    <div className="h-screen overflow-hidden bg-[#0a0a0c] text-white p-1.5 md:p-4 flex flex-col selection:bg-green-500 selection:text-black">
      
      <div className="flex-1 w-full mx-auto flex flex-col min-h-0">
        
        {/* UPPER SECTION: Stats (Left) + Sprite (Right) */}
        <div className="flex-1 flex flex-row min-h-0 mb-1.5 md:mb-3 gap-1.5 md:gap-3">
          
          {/* 1. LEFT PANEL: STATS (30%) */}
          <div className="w-[35%] md:w-[30%] flex flex-col justify-start gap-1.5 md:gap-3 lg:gap-4 xl:gap-6 border-4 border-slate-700 p-1.5 md:p-3 lg:p-4 xl:p-6 bg-slate-900 shadow-[4px_4px_0_rgba(0,0,0,1)] font-mono font-bold shrink-0 z-50 overflow-y-auto hide-scrollbar">
            <StatBar label="TÀI CHÍNH" value={state.stats.money} color="bg-yellow-400" previewEffect={!isTyping ? hoveredOption?.effects?.money : undefined} floatingTexts={floatingTexts.money} />
            <StatBar label="SỨC KHỎE" value={state.stats.health} color="bg-red-500" previewEffect={!isTyping ? hoveredOption?.effects?.health : undefined} floatingTexts={floatingTexts.health} />
            <StatBar label="TỰ DO" value={state.stats.freedom} color="bg-blue-400" previewEffect={!isTyping ? hoveredOption?.effects?.freedom : undefined} floatingTexts={floatingTexts.freedom} />
            <StatBar label="TƯƠNG TÁC" value={state.stats.traffic} color="bg-purple-500" previewEffect={!isTyping ? hoveredOption?.effects?.traffic : undefined} floatingTexts={floatingTexts.traffic} />
            <StatBar label="BẢN SẮC" value={state.stats.identity} color="bg-green-400" previewEffect={!isTyping ? hoveredOption?.effects?.identity : undefined} floatingTexts={floatingTexts.identity} />
          </div>

          {/* 2. RIGHT PANEL: CENTER STAGE (70%) */}
          <div className="w-[65%] md:w-[70%] flex flex-col justify-center items-center relative min-h-0">
            {/* Glow background cho nhân vật */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/40 via-transparent to-transparent z-0 pointer-events-none"></div>
            
            {/* Sprite */}
            <CharacterSprite 
              mood={characterMood}
              className="z-10 drop-shadow-[0_0_15px_rgba(74,222,128,0.2)] transform scale-75 md:scale-100 lg:scale-125 xl:scale-150 origin-center"
            />
            
            {/* Retro scanlines effect */}
            <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-50"></div>
          </div>
        </div>

        {/* 3. BOTTOM PANEL: DIALOG & CHOICES */}
        <div className="flex flex-col gap-1.5 md:gap-3 lg:gap-4 w-full shrink-0 min-h-0">
          
          {/* Lời thoại */}
          <div 
            className="border-4 border-slate-300 bg-slate-900 p-2 md:p-4 lg:p-6 shadow-[8px_8px_0_rgba(0,0,0,1)] relative shrink-0 cursor-pointer overflow-hidden h-[100px] md:h-[130px] lg:h-[160px] xl:h-[200px] select-none"
            onClick={handleBoxClick}
          >
            <div className={`text-[12px] md:text-sm lg:text-base mb-1.5 md:mb-2 lg:mb-4 font-bold uppercase tracking-widest ${getSpeakerColor(currentNode.speaker)} font-mono`}>
              ► {getSpeakerName(currentNode.speaker)}
            </div>
            {/* Dùng font Mono để hỗ trợ Tiếng Việt không bị lỗi */}
            <p className="text-sm md:text-base lg:text-lg xl:text-xl font-mono leading-snug md:leading-relaxed lg:leading-loose text-slate-300 whitespace-pre-wrap mb-2">
              {displayedText}
            </p>
            
            {/* Indicators */}
            {!isTyping && currentPageIndex < textPages.length - 1 && <div className="absolute bottom-2 right-3 text-yellow-400 animate-bounce text-[10px] md:text-xs font-bold uppercase tracking-wider">Click để tiếp tục ▼</div>}
            {!isTyping && currentPageIndex === textPages.length - 1 && <div className="absolute bottom-2 right-3 text-green-400 animate-pulse text-[10px] md:text-xs font-bold uppercase tracking-wider">Lựa chọn ▼</div>}
            {isTyping && <div className="absolute bottom-2 right-3 text-slate-400 opacity-90 animate-pulse text-[10px] md:text-xs uppercase tracking-wider font-bold">Click để hiện nhanh &gt;&gt;</div>}
          </div>

          {/* Lựa chọn (Chỉ hiện khi đã đọc hết các trang text) */}
          <div className={`${currentNode.options.some((o: any) => o.next_node_id === 'RESET') ? 'flex flex-col md:flex-row' : 'grid ' + (currentNode.is_ending ? 'grid-cols-1' : getGridColsClass(currentNode.options.length))} gap-1.5 md:gap-2 font-mono shrink-0 overflow-y-auto overflow-x-hidden hide-scrollbar ${(isTyping || currentPageIndex < textPages.length - 1) ? 'invisible pointer-events-none' : 'visible'}`}>
            {currentNode.is_ending ? (
              <button
                onClick={resetGame}
                className="w-full text-center py-3 px-4 border-4 border-green-500 bg-green-950 text-green-400 hover:bg-green-400 hover:text-black transition-colors shadow-[4px_4px_0_rgba(0,0,0,1)] text-sm font-bold uppercase leading-relaxed active:translate-y-1 active:translate-x-1 active:shadow-none"
              >
                &gt; CHƠI LẠI TỪ ĐẦU
              </button>
            ) : (
              currentNode.options.map((option: any, index: number) => {
                const isReset = option.next_node_id === 'RESET';
                const isPhilosophy = option.next_node_id?.includes('_philosophy');
                const widthClass = isPhilosophy ? 'md:w-[70%]' : (isReset ? 'md:w-[30%]' : 'w-full');
                
                return (
                <button
                  key={index}
                  onClick={() => handleChoice(option)}
                  onMouseEnter={() => setHoveredOption(option)}
                  onMouseLeave={() => setHoveredOption(null)}
                  className={`${widthClass} text-left py-2 md:py-3 px-3 md:px-4 border-4 ${isReset ? 'border-green-500 bg-green-950 text-green-400 hover:bg-green-400 hover:text-black justify-center text-center' : 'border-slate-500 bg-slate-800 text-slate-300 hover:border-white hover:bg-slate-700 hover:text-white'} transition-colors shadow-[4px_4px_0_rgba(0,0,0,1)] text-xs md:text-sm leading-relaxed active:translate-y-1 active:translate-x-1 active:shadow-none flex gap-2 items-start`}
                >
                  {!isReset && <span className="text-yellow-400 shrink-0 font-bold mt-1">*</span>}
                  <span className={isReset ? 'font-bold uppercase mx-auto mt-1' : ''}>{option.text}</span>
                </button>
                );
              })
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};