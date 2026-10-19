import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Layout/Navbar';
import { Sidebar } from './components/Layout/Sidebar';
import { BottomNav } from './components/Layout/BottomNav';
import { Footer } from './components/Layout/Footer';

import { DashboardView } from './components/Dashboard/DashboardView';
import { FlashcardView } from './components/Flashcard/FlashcardView';
import { BossArenaView } from './components/Arena/BossArenaView';
import { SpeechLabView } from './components/Speech/SpeechLabView';
import { UploaderView } from './components/Uploader/UploaderView';

import { mockUserData } from './data/mockUserData';
import { mockStats } from './data/mockStats';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from './utils/storage';

export function App() {
  // Navigation State with LocalStorage persistence
  const [activeTab, setActiveTab] = useState(() => 
    getStoredItem(STORAGE_KEYS.ACTIVE_TAB, 'dashboard')
  );

  // Active Character State ('verdant' | 'storm') with persistence
  const [activeCharacter, setActiveCharacter] = useState(() => 
    getStoredItem(STORAGE_KEYS.ACTIVE_CHARACTER, mockUserData.activeCharacter || 'verdant')
  );

  // User Data & Stats with fallbacks
  const [userData] = useState(() => 
    getStoredItem(STORAGE_KEYS.USER_DATA, mockUserData)
  );

  const [stats] = useState(() => 
    getStoredItem(STORAGE_KEYS.STATS, mockStats)
  );

  // Sync activeTab changes to storage
  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setStoredItem(STORAGE_KEYS.ACTIVE_TAB, tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync activeCharacter changes to storage
  const handleSelectCharacter = (characterId) => {
    setActiveCharacter(characterId);
    setStoredItem(STORAGE_KEYS.ACTIVE_CHARACTER, characterId);
  };

  // Render content according to active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            userData={userData}
            stats={stats}
            activeCharacter={activeCharacter}
            onSelectCharacter={handleSelectCharacter}
            onNavigateTab={handleSelectTab}
          />
        );
      case 'flashcard':
        return (
          <FlashcardView 
            onBackToDashboard={() => handleSelectTab('dashboard')} 
          />
        );
      case 'boss_arena':
        return (
          <BossArenaView 
            activeCharacter={activeCharacter}
            onBackToDashboard={() => handleSelectTab('dashboard')}
          />
        );
      case 'speech_lab':
        return (
          <SpeechLabView 
            onBackToDashboard={() => handleSelectTab('dashboard')} 
          />
        );
      case 'uploader':
        return <UploaderView onNavigateTab={handleSelectTab} />;
      default:
        return (
          <DashboardView
            userData={userData}
            stats={stats}
            activeCharacter={activeCharacter}
            onSelectCharacter={handleSelectCharacter}
            onNavigateTab={handleSelectTab}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#080d17] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* 1. Navbar with Brand & Watermark */}
      <Navbar activeCharacter={activeCharacter} />

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          onSelectTab={handleSelectTab} 
        />

        {/* Dynamic Tab Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-28 md:pb-8 max-w-5xl w-full mx-auto">
            {renderTabContent()}
          </main>

          {/* Footer with Copyright Notice */}
          <Footer />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav 
        activeTab={activeTab} 
        onSelectTab={handleSelectTab} 
      />
    </div>
  );
}

export default App;
