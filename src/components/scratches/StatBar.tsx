import React from 'react';

interface StatBarProps {
  label: string;
  value: number;
  color: string;
}

export const StatBar: React.FC<StatBarProps> = ({ label, value, color }) => {
  return (
    <div className="flex-1 min-w-[100px] font-mono">
      <div className="flex justify-between text-xs md:text-sm mb-1.5 uppercase leading-none">
        <span className="text-slate-400 truncate mr-1">{label}</span>
        <span className="text-white">{value}%</span>
      </div>
      {/* Khung viền pixel chunky */}
      <div className="w-full bg-slate-950 h-4 md:h-5 border-2 border-slate-600 p-0.5">
        <div
          className={`h-full ${color}`}
          style={{ width: `${value}%`, transition: 'width 0.2s steps(10)' }}
        />
      </div>
    </div>
  );
};