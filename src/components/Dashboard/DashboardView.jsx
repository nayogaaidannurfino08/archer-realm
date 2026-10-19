import React from 'react';
import { ProfileCard } from './ProfileCard';
import { ProgressCard } from './ProgressCard';
import { BentoCards } from './BentoCards';

export const DashboardView = ({ 
  userData, 
  stats, 
  activeCharacter, 
  onSelectCharacter, 
  onNavigateTab 
}) => {
  return (
    <div className="w-full flex flex-col space-y-4 md:space-y-5 animate-fadeIn">
      {/* Top Bento Row: Profile & Character Switcher + Progress & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        <ProfileCard 
          userData={userData}
          activeCharacter={activeCharacter}
          onSelectCharacter={onSelectCharacter}
        />
        <ProgressCard 
          stats={stats}
        />
      </div>

      {/* Bottom Bento Row: 4 Learning Modules Cards */}
      <BentoCards 
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
};
