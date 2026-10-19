import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  Swords, 
  Mic, 
  CloudUpload,
  Sparkles
} from 'lucide-react';

export const NAVIGATION_TABS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'flashcard',
    label: 'Flashcard',
    icon: Layers,
  },
  {
    id: 'boss_arena',
    label: 'Boss Arena',
    icon: Swords,
  },
  {
    id: 'speech_lab',
    label: 'Speech Lab',
    icon: Mic,
  },
  {
    id: 'uploader',
    label: 'Uploader',
    icon: CloudUpload,
  },
];

export const Sidebar = ({ activeTab, onSelectTab }) => {
  return (
    <aside className="hidden md:flex flex-col justify-between w-60 shrink-0 min-h-[calc(100vh-65px)] bg-[#080d17] border-r border-slate-800/80 px-4 py-6 select-none">
      {/* Navigation Menu */}
      <nav className="flex flex-col space-y-1.5" aria-label="Sidebar Navigation">
        {NAVIGATION_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                isActive
                  ? 'bg-[#0f4438] text-white border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.12)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon 
                className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-emerald-400' : 'text-slate-400'
                }`} 
              />
              <span className="tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer / Motivational Watermark */}
      <div className="pt-6 border-t border-slate-800/60 px-2 flex items-start gap-2.5 text-slate-500">
        <Sparkles className="w-3.5 h-3.5 text-emerald-500/80 mt-0.5 shrink-0" />
        <p className="text-[11px] leading-relaxed">
          Small steps <br />
          make big progress.
        </p>
      </div>
    </aside>
  );
};
