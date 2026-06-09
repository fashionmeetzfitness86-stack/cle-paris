import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  positive?: boolean;
  icon?: ReactNode;
  accent?: boolean;
}

export default function StatCard({ label, value, delta, positive, icon, accent }: StatCardProps) {
  return (
    <div className={`bg-[#1a1a1a] border rounded-lg p-5 transition-all duration-200 hover:border-[#333] ${accent ? 'border-[#c8b89a]/30' : 'border-[#262626]'}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] uppercase tracking-widest text-[#57534e] font-medium">{label}</span>
        {icon && (
          <div className="w-7 h-7 rounded flex items-center justify-center bg-[#262626] text-[#a8a29e]">
            {icon}
          </div>
        )}
      </div>
      <p className="text-2xl font-display font-semibold text-[#e8e2d6] tracking-tight">{value}</p>
      {delta && (
        <p className={`text-xs mt-1.5 ${positive ? 'text-green-400' : 'text-[#f87171]'}`}>
          {positive ? '↑' : '↓'} {delta}
        </p>
      )}
    </div>
  );
}
