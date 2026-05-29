import React from 'react';

interface StatBarProps {
  label: string;
  value: number;
  color: string;
  previewEffect?: number;
  floatingTexts?: { id: string; amount: number; color: string }[];
}

export const StatBar: React.FC<StatBarProps> = ({ label, value, color, previewEffect, floatingTexts }) => {
  return (
    <div className="flex-1 min-w-[100px] font-mono relative">
      {/* Floating Texts */}
      {floatingTexts?.map(ft => (
        <div key={ft.id} className="absolute -top-6 left-1/2 -translate-x-1/2 animate-floatUp font-bold text-lg md:text-xl pointer-events-none drop-shadow-[2px_2px_0_rgba(0,0,0,1)] z-50" style={{ color: ft.color }}>
          {ft.amount > 0 ? `+${ft.amount}` : ft.amount}
        </div>
      ))}
      
      <div className="flex justify-between text-xs md:text-sm mb-1.5 uppercase leading-none">
        <span className="text-slate-400 truncate mr-1">{label}</span>
        <span className="text-white">
          {value}%
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
          className={`h-full ${color} relative z-10`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%`, transition: 'width 0.2s steps(10)' }}
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