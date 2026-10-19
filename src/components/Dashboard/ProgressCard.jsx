import React from 'react';
import { Flame, BookOpen, Target } from 'lucide-react';

export const ProgressCard = ({ stats }) => {
  const progress = stats?.overallProgress ?? 68;
  const progressLabel = stats?.progressLabel ?? 'Progress TKA English';

  // Helper to map icon types
  const renderMetricIcon = (type) => {
    switch (type) {
      case 'flame':
        return <Flame className="w-4 h-4 text-amber-400 fill-amber-400/20" />;
      case 'book':
        return <BookOpen className="w-4 h-4 text-cyan-400" />;
      case 'target':
        return <Target className="w-4 h-4 text-emerald-400" />;
      default:
        return <Target className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getMetricBadgeStyle = (badgeColor) => {
    switch (badgeColor) {
      case 'amber':
        return 'bg-amber-500/15 border-amber-500/30 text-amber-400';
      case 'cyan':
        return 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400';
      case 'emerald':
      default:
        return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0f1828]/90 border border-slate-800/80 p-5 md:p-6 backdrop-blur flex flex-col justify-between shadow-lg">
      {/* Top Header: Title & Percentage */}
      <div>
        <div className="flex items-center justify-between text-xs md:text-sm font-semibold mb-2.5">
          <span className="text-slate-300 font-medium">{progressLabel}</span>
          <span className="text-emerald-400 font-bold tracking-tight">{progress}%</span>
        </div>

        {/* Progress Bar with glow effect */}
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-700 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 sm:mt-5 pt-2 sm:pt-3">
        {stats?.metrics?.map((metric) => (
          <div 
            key={metric.id}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl bg-slate-800/40 border border-slate-800/80 hover:border-slate-700/80 transition"
          >
            <div className={`p-1.5 sm:p-2 rounded-lg border shrink-0 ${getMetricBadgeStyle(metric.badgeColor)}`}>
              {renderMetricIcon(metric.iconType)}
            </div>
            <div className="min-w-0 w-full">
              <p className="text-[10px] sm:text-[11px] text-slate-400 leading-tight">
                {metric.label}
              </p>
              <p className="text-[11px] sm:text-sm font-bold text-white tracking-tight leading-tight mt-0.5 break-words">
                {metric.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
