import React from 'react';
import { NAVIGATION_TABS } from './Sidebar';

export const BottomNav = ({ activeTab, onSelectTab }) => {
  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#080d17]/95 backdrop-blur-lg border-t border-slate-800/90 px-2 py-2 safe-bottom"
    >
      <div className="flex items-center justify-around">
        {NAVIGATION_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-lg transition-all ${
                isActive 
                  ? 'text-emerald-400 font-semibold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg transition-all ${
                isActive ? 'bg-emerald-500/20 text-emerald-400' : ''
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[65px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
