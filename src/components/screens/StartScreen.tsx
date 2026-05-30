import React, { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import useSound from 'use-sound';
import { useSettings } from '../../hooks/useSettings';

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const bootTextRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);

  const { settings, toggleBgm, toggleSound, setBgmVolume, setSoundVolume } = useSettings();
  const [showSettings, setShowSettings] = useState(false);

  const [playClick] = useSound('/assets/audio/click-option.mp3', { volume: settings.soundVolume * 0.8, soundEnabled: settings.soundEnabled });
  const [playWaiting, { stop: stopWaiting }] = useSound('/assets/audio/waiting_screen.mp3', { volume: settings.bgmVolume, loop: true, soundEnabled: settings.bgmEnabled });
  const [systemStarted, setSystemStarted] = useState(false);

  // Phát nhạc chờ khi vào web
  useEffect(() => {
    if (systemStarted && settings.bgmEnabled) playWaiting();
    else stopWaiting();
    return () => stopWaiting();
  }, [systemStarted, settings.bgmEnabled, playWaiting, stopWaiting]);
  const [playType] = useSound('/assets/audio/type.mp3', { volume: 0.05, soundEnabled: settings.soundEnabled });

  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
    const save = localStorage.getItem('alienation_save');
    if (save) {
      setHasSave(true);
    }
  }, []);

  useGSAP(() => {
    if (!systemStarted) return;
    const tl = gsap.timeline();

    // 1. Boot text effect
    tl.to(bootTextRef.current, {
      opacity: 1,
      duration: 0.1,
    })
    .fromTo(".boot-line", 
      { opacity: 0, x: -10 },
      { 
        opacity: 1, 
        x: 0, 
        stagger: 0.15, 
        duration: 0.1,
        onUpdate: () => {
          if (Math.random() > 0.5) playType();
        }
      }
    )
    .to(bootTextRef.current, { opacity: 0, duration: 0.2, delay: 0.5 });

    // 2. Glitch title appearing
    tl.fromTo(titleRef.current,
      { opacity: 0, scale: 0.8, filter: 'blur(10px)' },
      { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.5, ease: 'elastic.out(1, 0.3)' }
    )
    .fromTo(subtitleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
      "-=1"
    );

    // 3. Hiển thị khu vực nút
    tl.fromTo(btnRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, delay: 1 }
    );

  }, { scope: containerRef, dependencies: [systemStarted] });

  const handleStart = (isNewGame: boolean) => {
    playClick();
    
    if (isNewGame) {
      localStorage.removeItem('alienation_save');
    }
    
    // CRT turn off / Expand effect before starting
    gsap.to(containerRef.current, {
      scaleY: 0.01,
      opacity: 0,
      duration: 0.3,
      ease: 'power4.inOut',
      onComplete: () => {
        gsap.to(containerRef.current, {
          scaleX: 0,
          duration: 0.2,
          ease: 'power4.inOut',
          onComplete: onStart
        });
      }
    });
  };

  return (
    <div 
      ref={containerRef}
      className="h-screen w-full bg-[#0a0a0c] text-green-500 font-mono flex flex-col items-center justify-center relative overflow-hidden"
    >
      {!systemStarted && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center cursor-pointer bg-[#0a0a0c]"
          onClick={() => { playClick(); setSystemStarted(true); }}
        >
          <div className="text-green-500 font-mono animate-pulse text-sm md:text-xl border border-green-500 p-4">
            [ BẤM VÀO MÀN HÌNH ĐỂ KHỞI ĐỘNG HỆ THỐNG ]
          </div>
        </div>
      )}

      {/* SETTINGS MENU (Giống GameScreen) */}
      <button 
        onClick={() => { setShowSettings(!showSettings); playClick(); }}
        className="absolute top-4 right-4 md:top-6 md:right-6 z-50 p-2 md:p-3 bg-slate-900 border-2 border-slate-600 hover:bg-slate-800 hover:border-green-400 transition-colors shadow-[4px_4px_0_rgba(0,0,0,1)] flex items-center justify-center group"
      >
        <span className="text-xl md:text-2xl group-hover:animate-spin">⚙️</span>
      </button>

      {showSettings && (
        <div className="absolute top-16 right-4 md:top-20 md:right-6 z-50 bg-slate-900 border-4 border-slate-500 p-4 shadow-[8px_8px_0_rgba(0,0,0,1)] flex flex-col gap-4 font-mono w-64 animate-floatUp" style={{animation: 'none'}}>
          <div className="text-center font-bold text-slate-300 border-b-2 border-slate-700 pb-2">CÀI ĐẶT ÂM THANH</div>
          
          <label className="flex flex-col gap-2 p-2">
            <div className="flex items-center justify-between cursor-pointer hover:bg-slate-800" onClick={() => { toggleBgm(); playClick(); }}>
              <span className="text-sm text-slate-300">Nhạc nền (BGM)</span>
              <input type="checkbox" checked={settings.bgmEnabled} readOnly className="w-5 h-5 accent-green-500" />
            </div>
            {settings.bgmEnabled && (
              <input type="range" min="0" max="1" step="0.05" value={settings.bgmVolume} onChange={(e) => setBgmVolume(parseFloat(e.target.value))} className="w-full accent-green-500" />
            )}
          </label>
          
          <label className="flex flex-col gap-2 p-2">
            <div className="flex items-center justify-between cursor-pointer hover:bg-slate-800" onClick={() => { toggleSound(); playClick(); }}>
              <span className="text-sm text-slate-300">Âm thanh (SFX)</span>
              <input type="checkbox" checked={settings.soundEnabled} readOnly className="w-5 h-5 accent-green-500" />
            </div>
            {settings.soundEnabled && (
              <input type="range" min="0" max="1" step="0.05" value={settings.soundVolume} onChange={(e) => setSoundVolume(parseFloat(e.target.value))} className="w-full accent-green-500" />
            )}
          </label>
        </div>
      )}

      {/* Tắt Background Blur */}
      <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-30 mix-blend-overlay"></div>
      
      {/* Boot sequence */}
      <div ref={bootTextRef} className="absolute top-10 left-10 text-xs md:text-sm text-green-400 opacity-0 z-10 flex flex-col gap-1">
        <div className="boot-line">INIT SYSTEM... OK</div>
        <div className="boot-line">LOADING KERNEL... OK</div>
        <div className="boot-line">MOUNTING VFS... OK</div>
        <div className="boot-line">CHECKING CAPITALIST_ALGORITHM_V2... SUCCESS</div>
        <div className="boot-line">STARTING ALIENATION PROTOCOL...</div>
      </div>

      {/* Main Titles */}
      <div className="z-30 text-center flex flex-col items-center gap-6 relative">
        <h1 
          ref={titleRef} 
          className="text-7xl md:text-9xl lg:text-[140px] xl:text-[160px] font-black opacity-0 uppercase tracking-widest leading-[1.1] md:leading-[1.1] lg:leading-[1.1]"
          style={{ fontFamily: "'Chakra Petch', sans-serif", color: '#4ade80', textShadow: '6px 6px 0px #064e3b' }}
        >
          SỰ THA HÓA<br/>CỦA<br/>FREELANCER
        </h1>
        <p 
          ref={subtitleRef}
          className="text-green-200 text-base md:text-2xl lg:text-3xl max-w-2xl lg:max-w-4xl mt-6 lg:mt-8 opacity-0 border-t-2 border-b-2 border-green-900 py-3 lg:py-4 px-6 lg:px-8 bg-slate-900/50 tracking-wide leading-relaxed"
        >
          Sản phẩm sáng tạo môn<br/>Kinh tế Chính trị Mác-Lênin (MLN111)
        </p>
        
        <div ref={btnRef} className="mt-12 flex flex-col gap-4 opacity-0">
          {hasSave && (
            <button
              onClick={() => handleStart(false)}
              className="text-xl md:text-2xl font-bold text-yellow-400 hover:text-white transition-colors cursor-pointer select-none animate-pulse hover:animate-none"
            >
              [ TIẾP TỤC TRÒ CHƠI ]
            </button>
          )}
          <button
            onClick={() => handleStart(true)}
            className={`text-xl md:text-2xl font-bold ${hasSave ? 'text-slate-400 text-lg hover:text-red-400' : 'text-yellow-400 hover:text-white'} transition-colors cursor-pointer select-none animate-pulse hover:animate-none`}
          >
            [ CHƠI MỚI ]
          </button>
        </div>
      </div>
    </div>
  );
};
