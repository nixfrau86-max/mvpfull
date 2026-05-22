import React from 'react';

interface WaveProgressVisualizerProps {
  current: number;
  target: number;
  status: string;
}

const WaveProgressVisualizer: React.FC<WaveProgressVisualizerProps> = ({ current, target, status }) => {
  const percentage = Math.min((current / target) * 100, 100);
  const isLocked = status === 'locked' || status === 'completed';
  const isLocking = status === 'locking';

  return (
    <div className="relative w-full py-6">
      <div className="flex justify-between items-end mb-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Status Protocol</span>
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${isLocked ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : isLocking ? 'bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]' : 'bg-indigo-500 shadow-[0_0_8px_#6366f1]'}`}></div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-900">{status}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Capacity</span>
          <div className="text-sm font-black text-slate-900">{Math.round(percentage)}%</div>
        </div>
      </div>

      <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>
        
        {/* Main Progress Bar */}
        <div 
          className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full ${isLocked ? 'bg-emerald-500' : isLocking ? 'bg-amber-500' : 'bg-indigo-600'}`}
          style={{ width: `${percentage}%` }}
        >
          {/* Animated Glow Effect */}
          <div className="absolute top-0 right-0 h-full w-8 bg-white/30 blur-sm animate-[shimmer_2s_infinite]"></div>
        </div>

        {/* Target Marker */}
        <div className="absolute top-0 h-full w-0.5 bg-slate-300" style={{ left: '100%' }}></div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className={`h-1 rounded-full transition-colors duration-500 ${i < (percentage / 5) ? (isLocked ? 'bg-emerald-500' : isLocking ? 'bg-amber-500' : 'bg-indigo-500') : 'bg-slate-200'}`}
          ></div>
        ))}
      </div>
      
      <div className="flex justify-between mt-3 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
        <span>Init</span>
        <span>Operational Range</span>
        <span>Threshold Reached</span>
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default WaveProgressVisualizer;
