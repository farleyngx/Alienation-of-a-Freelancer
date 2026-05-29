import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface StatBarProps {
  label: string;
  value: number;
  color: string;
  previewEffect?: number;
  floatingTexts?: { id: string; amount: number; color: string }[];
}

const NumberCounter = ({ value }: { value: number }) => {
  const numRef = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(value);
  
  useGSAP(() => {
    if (numRef.current) {
      gsap.fromTo(numRef.current, 
        { innerHTML: prevValue.current },
        {
          innerHTML: value,
          duration: 1.5,
          snap: { innerHTML: 1 },
          ease: 'power1.out'
        }
      );
      prevValue.current = value;
    }
  }, [value]);

  return <span ref={numRef}>{prevValue.current}</span>;
}

const FloatingText = ({ amount, color }: { amount: number, color: string }) => {
  const elRef = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    gsap.fromTo(elRef.current, 
      { y: 0, opacity: 1, scale: 0.5 },
      { y: -50, opacity: 0, scale: 1.5, duration: 1.5, ease: 'power2.out' }
    );
  }, []);
  
  return (
    <div ref={elRef} className="absolute -top-4 left-1/2 -translate-x-1/2 font-bold text-lg md:text-xl pointer-events-none drop-shadow-[2px_2px_0_rgba(0,0,0,1)] z-50" style={{ color }}>
      {amount > 0 ? `+${amount}` : amount}
    </div>
  );
};

export const StatBar: React.FC<StatBarProps> = ({ label, value, color, previewEffect, floatingTexts }) => {
  const barRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.to(barRef.current, {
      width: `${Math.max(0, Math.min(100, value))}%`,
      duration: 1.5,
      ease: 'power1.out'
    });
  }, [value]);

  const isCritical = value <= 20;

  return (
    <div className={`w-full font-mono relative ${isCritical ? 'animate-shake' : ''}`}>
      {/* Floating Texts */}
      {floatingTexts?.map(ft => (
        <FloatingText key={ft.id} amount={ft.amount} color={ft.color} />
      ))}
      
      <div className="flex justify-between items-end h-4 md:h-5 mb-1.5 uppercase leading-none">
        <span className="text-slate-400 truncate mr-1">{label}</span>
        <span className="text-white whitespace-nowrap flex-shrink-0">
          <NumberCounter value={value} />%
          {previewEffect ? (
            <span className={`ml-1 text-[10px] md:text-xs ${previewEffect > 0 ? 'text-green-400' : 'text-red-400'} animate-pulse`}>
              ({previewEffect > 0 ? '+' : ''}{previewEffect})
            </span>
          ) : null}
        </span>
      </div>
      {/* Khung viền pixel chunky */}
      <div className="w-full bg-slate-950 h-4 md:h-5 border-2 border-slate-600 p-0.5 relative">
        <div
          ref={barRef}
          className={`h-full ${color} relative z-10 w-0`}
        />
        
        {/* Preview Tăng */}
        {previewEffect && previewEffect > 0 && (
          <div
            className={`absolute top-0.5 bottom-0.5 left-0.5 ${color} opacity-40 animate-pulse z-0`}
            style={{ width: `${Math.max(0, Math.min(100, value + previewEffect))}%` }}
          />
        )}
        
        {/* Preview Giảm */}
        {previewEffect && previewEffect < 0 && (
          <div
            className={`absolute top-0.5 bottom-0.5 bg-red-600 animate-pulse z-20 opacity-80`}
            style={{ 
               left: `calc(${Math.max(0, value + previewEffect)}% + 2px)`, 
               width: `${Math.min(value, -previewEffect)}%` 
            }}
          />
        )}
      </div>
    </div>
  );
};