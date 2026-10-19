import React from 'react';

export const Footer = () => {
  return (
    <footer className="w-full py-5 px-6 md:px-8 border-t border-slate-800/40 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <span className="text-[11px] text-slate-400">
          Archer Realm &bull; TKA English Mastery Platform
        </span>
        <span className="tracking-wide">
          &copy; 2026 Nayoga Aidan Nurfino. All rights reserved.
        </span>
      </div>
    </footer>
  );
};
