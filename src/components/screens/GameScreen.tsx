/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useGameState } from '../../hooks/useGameState';
import { StatBar } from '../scratches/StatBar';
import { CharacterSprite } from '../sprite_sheets/CharacterSprite';
import useSound from 'use-sound';
import { useSettings } from '../../hooks/useSettings';
const getEndingColor = (nodeId: string): { text: string, shadow: string, hex: string } => {
  if (!nodeId) return { text: 'text-red-500', shadow: 'rgba(239, 68, 68, 0.8)', hex: '#ef4444' };
  
  if (nodeId.includes('off_grid')) return { text: 'text-emerald-400', shadow: 'rgba(52, 211, 153, 0.8)', hex: '#34d399' };
  if (nodeId.includes('platform_coop')) return { text: 'text-cyan-400', shadow: 'rgba(34, 211, 238, 0.8)', hex: '#22d3ee' };
  if (nodeId.includes('true_communist')) return { text: 'text-yellow-400', shadow: 'rgba(250, 204, 21, 0.8)', hex: '#facc15' };
  if (nodeId.includes('platform_partner')) return { text: 'text-fuchsia-400', shadow: 'rgba(232, 121, 249, 0.8)', hex: '#e879f9' };
  if (nodeId.includes('data_martyr')) return { text: 'text-purple-400', shadow: 'rgba(192, 132, 252, 0.8)', hex: '#c084fc' };
  if (nodeId.includes('alienation')) return { text: 'text-slate-300', shadow: 'rgba(203, 213, 225, 0.8)', hex: '#cbd5e1' };
  
  return { text: 'text-red-500', shadow: 'rgba(239, 68, 68, 0.8)', hex: '#ef4444' };
};



const ResetTransition = ({ onComplete, onFadeOutEnd }: { onComplete: () => void, onFadeOutEnd: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    const squares = containerRef.current.children;
    gsap.set(squares, { scale: 0, backgroundColor: '#0a0a0c' });
    gsap.to(squares, {
      scale: 1.05,
      duration: 0.4,
      stagger: {
        grid: [10, 20],
        from: 'start',
        axis: 'x',
        amount: 1.2,
      },
      onComplete: () => {
        onComplete();
        gsap.to(containerRef.current, { opacity: 0, duration: 0.5, delay: 0.3, onComplete: onFadeOutEnd });
      }
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] grid grid-cols-[repeat(20,minmax(0,1fr))] grid-rows-[repeat(10,minmax(0,1fr))] pointer-events-none">
      {Array.from({ length: 200 }).map((_, i) => (
        <div key={i} className="w-full h-full bg-[#0a0a0c] origin-center" />
      ))}
    </div>
  );
};

const EnterTransition = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    const bars = containerRef.current.querySelectorAll('.enter-bar');
    const flash = containerRef.current.querySelector('.enter-flash');
    
    const tl = gsap.timeline();
    
    tl.to(flash, {
      opacity: 0.8,
      duration: 0.2,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: 1
    })
    .to(bars, {
      scaleY: 0,
      transformOrigin: 'bottom',
      duration: 1.2,
      stagger: {
        amount: 0.6,
        from: 'center'
      },
      ease: 'circ.inOut'
    }, "-=0.1")
    .to(containerRef.current, { opacity: 0, duration: 0.4, onComplete: () => containerRef.current?.remove() });
    
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="fixed inset-0 z-[200] flex pointer-events-none overflow-hidden">
      <div className="enter-flash absolute inset-0 bg-green-400 opacity-0 mix-blend-overlay z-10"></div>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="enter-bar flex-1 h-full bg-[#0a0a0c] border-x border-green-900/30 z-20" />
      ))}
    </div>
  );
};

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
  const [isResetting, setIsResetting] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { settings, toggleSound, toggleBgm, setSoundVolume, setBgmVolume } = useSettings();
  const [showSettings, setShowSettings] = useState(false);

  const [playHover] = useSound('/assets/audio/hover.mp3', { volume: settings.soundVolume * 0.5, soundEnabled: settings.soundEnabled });
  const [playClickOption] = useSound('/assets/audio/click-option.mp3', { volume: settings.soundVolume * 0.8, soundEnabled: settings.soundEnabled });
  const [playClickTextbox] = useSound('/assets/audio/click-textbox.mp3', { volume: settings.soundVolume * 0.6, soundEnabled: settings.soundEnabled });
  const [playType] = useSound('/assets/audio/type.mp3', { volume: settings.soundVolume * 0.7, soundEnabled: settings.soundEnabled });
  
  const [playNormal, { stop: stopNormal, sound: soundNormal }] = useSound('/assets/audio/coding.mp3', { volume: settings.bgmVolume, loop: true, soundEnabled: settings.bgmEnabled });
  const [playPhilosophy, { stop: stopPhilosophy, sound: soundPhilosophy }] = useSound('/assets/audio/default.mp3', { volume: settings.bgmVolume, loop: true, soundEnabled: settings.bgmEnabled });
  const [playTragic, { stop: stopTragic, sound: soundTragic }] = useSound('/assets/audio/the_tragic.mp3', { volume: settings.bgmVolume, loop: true, soundEnabled: settings.bgmEnabled });
  const [playCyber, { stop: stopCyber, sound: soundCyber }] = useSound('/assets/audio/the_cyber_dystopia.mp3', { volume: settings.bgmVolume, loop: true, soundEnabled: settings.bgmEnabled });
  const [playHarsh, { stop: stopHarsh, sound: soundHarsh }] = useSound('/assets/audio/the_harsh_reality.mp3', { volume: settings.bgmVolume, loop: true, soundEnabled: settings.bgmEnabled });
  const [playRev, { stop: stopRev, sound: soundRev }] = useSound('/assets/audio/the_revolutionary.mp3', { volume: settings.bgmVolume, loop: true, soundEnabled: settings.bgmEnabled });

  const isEndingEvent = state.currentNodeId.startsWith('ending_') && !state.currentNodeId.includes('philosophy');
  const isPhilosophy = state.currentNodeId.includes('philosophy');

  const gameUiRef = useRef<HTMLDivElement>(null);
  const cinematicOverlayRef = useRef<HTMLDivElement>(null);
  const cinematicTitleRef = useRef<HTMLHeadingElement>(null);
  const cinematicSpriteRef = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    if (isEndingEvent) {
      const tl = gsap.timeline();
      
      gsap.set(gameUiRef.current, { opacity: 0, scale: 0.95 });
      gsap.set(cinematicOverlayRef.current, { display: 'flex', opacity: 1, scale: 1 });
      gsap.set(cinematicTitleRef.current, { opacity: 0, scale: 0.8 });
      gsap.set(cinematicSpriteRef.current, { opacity: 0 });

      tl.to(cinematicTitleRef.current, { opacity: 1, scale: 1, duration: 2, ease: 'power3.out' });
      tl.to(cinematicSpriteRef.current, { opacity: 0.3, duration: 2 }, "-=1");

      tl.to(cinematicOverlayRef.current, { opacity: 0, scale: 1.1, duration: 1.5, ease: 'power2.inOut', delay: 2.5 });
      tl.to(gameUiRef.current, { opacity: 1, scale: 1, duration: 1.5, ease: 'power2.inOut' }, "-=1.5");
      tl.set(cinematicOverlayRef.current, { display: 'none' });
      
    } else {
      gsap.set(gameUiRef.current, { opacity: 1, scale: 1, display: 'flex' });
      gsap.set(cinematicOverlayRef.current, { display: 'none' });
    }
  }, [isEndingEvent, state.currentNodeId]);


  const currentBgmType = useRef('none');

  const stopAllBGM = () => {
    stopNormal();
    stopPhilosophy();
    stopTragic();
    stopCyber();
    stopHarsh();
    stopRev();
  };

  const getEndingType = (nodeId: string) => {
     if (nodeId.includes('philosophy')) return 'philosophy';
     
     const baseId = nodeId;
     if (['ending_burnout', 'ending_self_exploitation', 'ending_techno_feudalism'].includes(baseId)) return 'tragic';
     if (['ending_alienation', 'ending_platform_partner'].includes(baseId)) return 'cyber';
     if (['ending_bankruptcy', 'ending_false_freedom', 'ending_off_grid'].includes(baseId)) return 'harsh';
     if (['ending_true_communist', 'ending_data_martyr', 'ending_platform_coop'].includes(baseId)) return 'rev';
     return 'normal';
  };

  useEffect(() => {
    const intendedType = settings.bgmEnabled ? getEndingType(state.currentNodeId) : 'none';

    if (currentBgmType.current !== intendedType) {
      stopAllBGM();
      currentBgmType.current = intendedType;
    }

    if (intendedType === 'normal' && soundNormal && !soundNormal.playing()) playNormal();
    else if (intendedType === 'philosophy' && soundPhilosophy && !soundPhilosophy.playing()) playPhilosophy();
    else if (intendedType === 'tragic' && soundTragic && !soundTragic.playing()) playTragic();
    else if (intendedType === 'cyber' && soundCyber && !soundCyber.playing()) playCyber();
    else if (intendedType === 'harsh' && soundHarsh && !soundHarsh.playing()) playHarsh();
    else if (intendedType === 'rev' && soundRev && !soundRev.playing()) playRev();
    
  }, [
    state.currentNodeId, settings.bgmEnabled, 
    soundNormal, soundPhilosophy, soundTragic, soundCyber, soundHarsh, soundRev
  ]);

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
      setIsResetting(true);
      return;
    }

    if (option.effects) {
      const newFloating: any = { ...floatingTexts };
      const id = Date.now().toString();
      Object.keys(option.effects).forEach(key => {
        const val = option.effects[key];
        const color = val > 0 ? '#4ade80' : '#f87171';
        newFloating[key] = [...(newFloating[key] || []), { id: `${key}-${id}`, amount: val, color }];
      });
      setFloatingTexts(newFloating);
      
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

  let characterMood: 'happy' | 'tired' | 'quit' = state.stats.health < 40 ? 'tired' : 'happy';
  if (state.currentNodeId === 'start_node') {
    characterMood = 'quit';
  }


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
      <EnterTransition />
      {isResetting && <ResetTransition onComplete={resetGame} onFadeOutEnd={() => setIsResetting(false)} />}

      <button 
          onClick={() => { setShowSettings(!showSettings); playClickOption(); }}
          className="absolute top-2 right-2 md:top-4 md:right-4 z-50 p-2 bg-slate-900 border-2 border-slate-600 hover:bg-slate-800 hover:border-green-400 transition-colors shadow-[4px_4px_0_rgba(0,0,0,1)] flex items-center justify-center group"
        >
          <span className="text-xl md:text-2xl group-hover:animate-spin">⚙️</span>
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

      <div ref={cinematicOverlayRef} className="absolute inset-0 z-[100] hidden flex-col items-center justify-center bg-black overflow-hidden pointer-events-none">
        
        <div ref={cinematicSpriteRef} className="absolute inset-0 opacity-0 blur-sm mix-blend-screen">
          {state.currentNodeId.includes('bankruptcy') && (
            <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: "url('/assets/bankrupcy-ending.png')" }}></div>
          )}
          {state.currentNodeId.includes('burnout') && (
            <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: "url('/assets/burnout-ending.png')" }}></div>
          )}
          {state.currentNodeId.includes('alienation') && (
            <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: "url('/assets/alienation-ending.png')" }}></div>
          )}
          {state.currentNodeId.includes('off_grid') && (
            <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: "url('/assets/off-grid-ending.png')" }}></div>
          )}
          {state.currentNodeId.includes('true_communist') && (
            <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: "url('/assets/digital-union-ending.png')" }}></div>
          )}
          {state.currentNodeId.includes('techno_feudalism') && (
            <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: "url('/assets/techno-feudalism-ending.png')" }}></div>
          )}
          {state.currentNodeId.includes('data_martyr') && (
            <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: "url('/assets/data-martyr-ending.png')" }}></div>
          )}
          {state.currentNodeId.includes('false_freedom') && (
            <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: "url('/assets/false-freedom-ending.png')" }}></div>
          )}
          {state.currentNodeId.includes('self_exploitation') && (
            <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: "url('/assets/self-exploitation-ending.png')" }}></div>
          )}
          {state.currentNodeId.includes('platform_coop') && (
            <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: "url('/assets/platform-co-op-trending.png')" }}></div>
          )}
          {state.currentNodeId.includes('platform_partner') && (
            <div className="absolute inset-0 bg-top" style={{ backgroundImage: "url('/assets/platform-partner-ending.png')", backgroundSize: '100% auto' }}></div>
          )}
          {!state.currentNodeId.includes('bankruptcy') && !state.currentNodeId.includes('burnout') && !state.currentNodeId.includes('alienation') && !state.currentNodeId.includes('off_grid') && !state.currentNodeId.includes('true_communist') && !state.currentNodeId.includes('techno_feudalism') && !state.currentNodeId.includes('data_martyr') && !state.currentNodeId.includes('false_freedom') && !state.currentNodeId.includes('self_exploitation') && !state.currentNodeId.includes('platform_coop') && !state.currentNodeId.includes('platform_partner') && (
            <div className="absolute w-[600px] h-[400px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ backgroundImage: `url(/assets/happy-coding.png)`, backgroundPosition: '-300px 0px', backgroundSize: '1200px 2400px', imageRendering: 'pixelated' }} />
          )}
        </div>
        
        <h1 ref={cinematicTitleRef} className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-widest text-center cinematic-title relative z-10" style={{ color: getEndingColor(state.currentNodeId).hex, fontFamily: "'Crimson Pro', serif", textShadow: `0 0 20px ${getEndingColor(state.currentNodeId).shadow}, 0 0 10px ${getEndingColor(state.currentNodeId).hex}`, lineHeight: '1.2' }}>
          {(currentNode?.text?.split('\n')[0] || "KẾT CỤC").replace(/^[^a-zA-ZÀ-ỹ0-9]*/, '').trim()}
        </h1>
      </div>

      <div ref={gameUiRef} className="flex-1 w-full mx-auto flex flex-col min-h-0 relative z-10">
        
        <div className={`flex-1 flex flex-row min-h-0 mb-1.5 md:mb-3 gap-1.5 md:gap-3`}>
          
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
            {(isEndingEvent || isPhilosophy) && (state.currentNodeId.includes('bankruptcy') || state.currentNodeId.includes('burnout') || state.currentNodeId.includes('alienation') || state.currentNodeId.includes('off_grid') || state.currentNodeId.includes('true_communist') || state.currentNodeId.includes('techno_feudalism') || state.currentNodeId.includes('data_martyr') || state.currentNodeId.includes('false_freedom') || state.currentNodeId.includes('self_exploitation') || state.currentNodeId.includes('platform_coop')) ? (
              <div 
                className="z-10 w-[400px] h-[300px] bg-center bg-cover border-4 border-slate-700 bg-slate-900 shadow-[8px_8px_0_rgba(0,0,0,0.5)] transform scale-75 md:scale-100 lg:scale-125 xl:scale-150 origin-center"
                style={{ 
                  backgroundImage: `url('${state.currentNodeId.includes('bankruptcy') ? '/assets/bankrupcy-ending.png' : state.currentNodeId.includes('burnout') ? '/assets/burnout-ending.png' : state.currentNodeId.includes('alienation') ? '/assets/alienation-ending.png' : state.currentNodeId.includes('off_grid') ? '/assets/off-grid-ending.png' : state.currentNodeId.includes('true_communist') ? '/assets/digital-union-ending.png' : state.currentNodeId.includes('techno_feudalism') ? '/assets/techno-feudalism-ending.png' : state.currentNodeId.includes('data_martyr') ? '/assets/data-martyr-ending.png' : state.currentNodeId.includes('false_freedom') ? '/assets/false-freedom-ending.png' : state.currentNodeId.includes('self_exploitation') ? '/assets/self-exploitation-ending.png' : '/assets/platform-co-op-trending.png'}')`
                }} 
              />
            ) : (
              <CharacterSprite 
                mood={(isEndingEvent || isPhilosophy) && state.currentNodeId.includes('platform_partner') ? 'platform_partner' : characterMood}
                className="z-10 drop-shadow-[0_0_15px_rgba(74,222,128,0.2)] transform scale-75 md:scale-100 lg:scale-125 xl:scale-150 origin-center"
              />
            )}
            
            {/* Retro scanlines effect & Vignette */}
            <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-50 mix-blend-overlay"></div>
            {/* <div className="absolute inset-0 pointer-events-none z-30 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] rounded-[50px] md:rounded-[100px]"></div> */}
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
              {isEndingEvent && (
                <span className="text-red-400 text-xs animate-pulse">| CẢNH BÁO QUAN TRỌNG</span>
              )}
            </div>
            <p className={`text-base md:text-lg lg:text-xl leading-relaxed font-mono whitespace-pre-wrap ${isEndingEvent ? (getEndingColor(state.currentNodeId).text + ' font-bold') : isPhilosophy ? 'text-slate-200' : 'text-slate-300'}`}>
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
                onClick={() => { playClickOption(); setIsResetting(true); }}
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