import React from 'react';

interface StatBarProps {
  label: string;
  value: number;
  color: string;
}

export const StatBar: React.FC<StatBarProps> = ({ label, value, color }) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300 font-bold">{value}%</span>
      </div>
      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700/50">
        <div
          className={`h-full ${color} transition-all duration-500 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};