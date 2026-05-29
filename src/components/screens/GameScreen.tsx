/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useGameState } from '../../hooks/useGameState';
import { StatBar } from '../scratches/StatBar';
import { CharacterSprite } from '../sprite_sheets/CharacterSprite';
import useSound from 'use-sound';
import { useSettings } from '../../hooks/useSettings';

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

  const { settings, toggleSound, toggleBgm, setSoundVolume, setBgmVolume } = useSettings();
  const [showSettings, setShowSettings] = useState(false);

  const [playHover] = useSound('/assets/audio/hover.mp3', { volume: settings.soundVolume * 0.5, soundEnabled: settings.soundEnabled });
  const [playClickOption] = useSound('/assets/audio/click-option.mp3', { volume: settings.soundVolume * 0.8, soundEnabled: settings.soundEnabled });
  const [playClickTextbox] = useSound('/assets/audio/click-textbox.mp3', { volume: settings.soundVolume * 0.6, soundEnabled: settings.soundEnabled });
  const [playType] = useSound('/assets/audio/type.mp3', { volume: settings.soundVolume * 0.7, soundEnabled: settings.soundEnabled });
  
  const [playNormal, { stop: stopNormal }] = useSound('/assets/audio/bgm-normal.mp3', { volume: settings.bgmVolume, loop: true, soundEnabled: settings.bgmEnabled });
  const [playIntense, { stop: stopIntense }] = useSound('/assets/audio/bgm-intense.mp3', { volume: settings.bgmVolume * 1.5, loop: true, soundEnabled: settings.bgmEnabled });
  const [playEnding, { stop: stopEnding }] = useSound('/assets/audio/bgm-ending.mp3', { volume: settings.bgmVolume, loop: true, soundEnabled: settings.bgmEnabled });

  const isHealthLow = state.stats.health < 30;
  // Node là sự kiện kết thúc (VD: ending_burnout) nhưng KHÔNG phải là node giải thích triết học
  const isEndingEvent = state.currentNodeId.startsWith('ending_') && !state.currentNodeId.includes('philosophy');
  const isEnding = !!currentNode?.is_ending;
  const isPhilosophy = !!currentNode?.next_node_id?.includes('philosophy');

  // Refs for GSAP
  const gameUiRef = useRef<HTMLDivElement>(null);
  const cinematicOverlayRef = useRef<HTMLDivElement>(null);
  const cinematicTitleRef = useRef<HTMLHeadingElement>(null);
  const cinematicSpriteRef = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    if (isEndingEvent) {
      const tl = gsap.timeline();
      
      // Khởi tạo trạng thái ban đầu
      gsap.set(gameUiRef.current, { opacity: 0, scale: 0.95 });
      gsap.set(cinematicOverlayRef.current, { display: 'flex', opacity: 1, scale: 1 });
      gsap.set(cinematicTitleRef.current, { opacity: 0, scale: 0.8 });
      gsap.set(cinematicSpriteRef.current, { opacity: 0 });

      // 1. You Died effect (Hiện chữ to giữa màn hình)
      tl.to(cinematicTitleRef.current, { opacity: 1, scale: 1, duration: 2, ease: 'power3.out' });
      // Hiện sprite lờ mờ phía sau
      tl.to(cinematicSpriteRef.current, { opacity: 0.3, duration: 2 }, "-=1");

      // 2. Match & Move (Crossfade về Normal UI)
      // Chữ và hình mờ dần và to lên 1 chút tạo cảm giác tan biến
      tl.to(cinematicOverlayRef.current, { opacity: 0, scale: 1.1, duration: 1.5, ease: 'power2.inOut', delay: 2.5 });
      // GameUI hiện ra
      tl.to(gameUiRef.current, { opacity: 1, scale: 1, duration: 1.5, ease: 'power2.inOut' }, "-=1.5");
      tl.set(cinematicOverlayRef.current, { display: 'none' });
      
    } else {
      gsap.set(gameUiRef.current, { opacity: 1, scale: 1, display: 'flex' });
      gsap.set(cinematicOverlayRef.current, { display: 'none' });
    }
  }, [isEndingEvent, state.currentNodeId]);

  // BGM Logic
  useEffect(() => {
    let targetBgm: 'none' | 'normal' | 'intense' | 'ending' = 'normal';
    
    if (!settings.bgmEnabled) {
      targetBgm = 'none';
    } else if (isEndingEvent || isEnding || isPhilosophy) {
      targetBgm = 'ending';
    } else if (isHealthLow && !isPhilosophy) {
      targetBgm = 'intense';
    }

    stopNormal();
    stopIntense();
    stopEnding();

    if (targetBgm === 'normal') playNormal();
    if (targetBgm === 'intense') playIntense();
    if (targetBgm === 'ending') playEnding();

    return () => {
      stopNormal();
      stopIntense();
      stopEnding();
    };
  }, [isHealthLow, isEndingEvent, isEnding, isPhilosophy, settings.bgmEnabled, playNormal, playIntense, playEnding, stopNormal, stopIntense, stopEnding]);

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
      
      // Play type sound roughly every 2 characters to avoid overlapping audio issues
      if (i % 2 === 0) playType();

      i++;
      if (i >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsTyping(false);
      }
    }, settings.typingSpeed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [textPages, currentPageIndex]);

  const handleBoxClick = () => {
    if (isTyping) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplayedText(textPages[currentPageIndex]);
      setIsTyping(false);
      playClickTextbox();
    } else {
      if (currentPageIndex < textPages.length - 1) {
        setIsTyping(true);
        setCurrentPageIndex(prev => prev + 1);
      }
    }
  };

  const handleChoice = (option: any) => {
    playClickOption();
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
      
      {/* Settings UI */}
      <button 
        onClick={() => {
          setShowSettings(!showSettings);
          playClickOption();
        }} 
        className="absolute top-2 right-2 md:top-4 md:right-4 z-50 text-slate-500 hover:text-white transition-colors p-2 bg-slate-900 border-2 border-slate-700 shadow-[2px_2px_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
      >
        <span className="text-xl">⚙️</span>
      </button>

      {showSettings && (
        <div className="absolute top-14 right-2 md:top-16 md:right-4 z-50 bg-slate-900 border-4 border-slate-500 p-4 shadow-[8px_8px_0_rgba(0,0,0,1)] flex flex-col gap-4 font-mono w-64 animate-floatUp" style={{animation: 'none'}}>
          <div className="text-center font-bold text-slate-300 border-b-2 border-slate-700 pb-2">CÀI ĐẶT HỆ THỐNG</div>
          
          <label className="flex flex-col gap-2 p-2">
            <div className="flex items-center justify-between cursor-pointer hover:bg-slate-800" onClick={() => { toggleBgm(); playClickOption(); }}>
              <span className="text-sm text-slate-300">Nhạc nền (BGM)</span>
              <input type="checkbox" checked={settings.bgmEnabled} readOnly className="w-5 h-5 accent-green-500" />
            </div>
            {settings.bgmEnabled && (
              <input type="range" min="0" max="1" step="0.05" value={settings.bgmVolume} onChange={(e) => setBgmVolume(parseFloat(e.target.value))} className="w-full accent-green-500" />
            )}
          </label>
          
          <label className="flex flex-col gap-2 p-2">
            <div className="flex items-center justify-between cursor-pointer hover:bg-slate-800" onClick={() => { toggleSound(); playClickOption(); }}>
              <span className="text-sm text-slate-300">Âm thanh (SFX)</span>
              <input type="checkbox" checked={settings.soundEnabled} readOnly className="w-5 h-5 accent-green-500" />
            </div>
            {settings.soundEnabled && (
              <input type="range" min="0" max="1" step="0.05" value={settings.soundVolume} onChange={(e) => setSoundVolume(parseFloat(e.target.value))} className="w-full accent-green-500" />
            )}
          </label>
        </div>
      )}

      {/* ENDING CINEMATIC VIEW (YOU DIED STYLE) */}
      <div ref={cinematicOverlayRef} className="absolute inset-0 z-[100] hidden flex-col items-center justify-center bg-black overflow-hidden pointer-events-none">
         <div ref={cinematicSpriteRef} className="absolute w-[600px] h-[400px] opacity-0 blur-sm mix-blend-screen" style={{ backgroundImage: `url(/assets/happy-coding.png)`, backgroundPosition: '-300px 0px', backgroundSize: '1200px 2400px', imageRendering: 'pixelated' }} />
         <h1 ref={cinematicTitleRef} className="text-4xl md:text-5xl lg:text-7xl font-serif tracking-widest text-center uppercase z-10 drop-shadow-[0_0_20px_rgba(220,38,38,0.8)] px-4" style={{ fontFamily: "'Crimson Pro', serif", color: '#dc2626' }}>
           {(currentNode?.text?.split('\n')[0] || "KẾT CỤC").replace(/^[^a-zA-ZÀ-ỹ0-9]*/, '').trim()}
         </h1>
      </div>

      <div ref={gameUiRef} className="flex-1 w-full mx-auto flex flex-col min-h-0 relative z-10">
        
        {/* UPPER SECTION: Stats (Left) + Sprite (Right) */}
        <div className={`flex-1 flex flex-row min-h-0 mb-1.5 md:mb-3 gap-1.5 md:gap-3`}>
          
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
            
            {/* Retro scanlines effect & Vignette */}
            <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-50 mix-blend-overlay"></div>
            <div className="absolute inset-0 pointer-events-none z-30 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] rounded-[50px] md:rounded-[100px]"></div>
          </div>
        </div>

        {/* 3. BOTTOM PANEL: DIALOG & CHOICES */}
        <div className="flex flex-col gap-1.5 md:gap-3 lg:gap-4 w-full shrink-0 min-h-0">
          
          {/* Lời thoại */}
          <div className="flex-1 bg-slate-900 border border-slate-700 p-4 md:p-6 shadow-2xl relative overflow-y-auto cursor-pointer flex flex-col select-none" onClick={handleBoxClick}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-xs md:text-sm px-2 py-1 bg-emerald-950/50 rounded">
                {currentNode?.speaker === 'PHILOSOPHY' ? 'GÓC NHÌN TRIẾT HỌC' : (getSpeakerName(currentNode?.speaker) || 'HỆ THỐNG')}
              </span>
              {(isEnding || isPhilosophy) && (
                <span className="text-red-400 text-xs animate-pulse">| CẢNH BÁO QUAN TRỌNG</span>
              )}
            </div>
            <p className={`text-slate-300 text-base md:text-lg lg:text-xl leading-relaxed font-mono whitespace-pre-wrap ${isEnding || isPhilosophy ? 'text-slate-200' : ''}`}>
              {displayedText}
              <span className={`inline-block w-2 h-4 md:h-5 bg-emerald-500 ml-1 ${isTyping ? 'animate-pulse' : 'hidden'}`}></span>
            </p>{!isTyping && currentPageIndex < textPages.length - 1 && <div className="absolute bottom-2 right-3 text-yellow-400 animate-bounce text-[10px] md:text-xs font-bold uppercase tracking-wider">Click để tiếp tục ▼</div>}
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
                  onMouseEnter={() => {
                    setHoveredOption(option);
                    playHover();
                  }}
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