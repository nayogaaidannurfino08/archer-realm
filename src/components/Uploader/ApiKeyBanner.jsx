import React, { useState, useEffect } from 'react';
import { Key, CheckCircle2, AlertTriangle, Eye, EyeOff, Save, ExternalLink } from 'lucide-react';
import { getGeminiApiKey, saveCustomApiKey } from '../../services/geminiApi';

export const ApiKeyBanner = ({ onKeyChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [inputKey, setInputKey] = useState('');

  useEffect(() => {
    const key = getGeminiApiKey();
    setApiKey(key);
  }, []);

  const hasKey = Boolean(apiKey);

  const handleSave = () => {
    if (!inputKey.trim()) return;
    saveCustomApiKey(inputKey.trim());
    setApiKey(inputKey.trim());
    setIsEditing(false);
    setInputKey('');
    if (onKeyChange) onKeyChange();
  };

  const handleRemove = () => {
    saveCustomApiKey('');
    setApiKey('');
    setIsEditing(false);
    if (onKeyChange) onKeyChange();
  };

  return (
    <div className="rounded-2xl border transition-all overflow-hidden bg-[#0c1424]/90 border-slate-800 shadow-lg">
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Status Badge & Description */}
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`p-2.5 rounded-xl border shrink-0 ${
              hasKey
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
            }`}
          >
            {hasKey ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                {hasKey ? 'Google Gemini 1.5 Flash Aktif' : 'Gemini API Key Belum Ditemukan'}
              </h4>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  hasKey
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                {hasKey ? 'Siap Pakai' : 'Mode Demo / Belum Diatur'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {hasKey
                ? 'Sistem terhubung ke Gemini 1.5 Flash Free Tier untuk ekstraksi Flashcard & Boss Quiz.'
                : 'Tambahkan API Key di file .env.local atau masukkan langsung di bawah untuk analisis live.'}
            </p>
          </div>
        </div>

        {/* Action Toggle */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {!hasKey && (
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-cyan-300 hover:text-cyan-200 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all"
            >
              <span>Dapatkan Key Gratis</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-all"
          >
            {isEditing ? 'Tutup' : hasKey ? 'Ubah Key' : 'Pasang Key di Sini'}
          </button>
        </div>
      </div>

      {/* Expandable Key Input Panel */}
      {isEditing && (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-2 border-t border-slate-800/70 bg-slate-900/40">
          <p className="text-xs text-slate-400 mb-2">
            Kunci ini disimpan aman di LocalStorage browser perangkat Anda:
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder={hasKey ? 'Masukkan API Key baru...' : 'AIzaSy...'}
                className="w-full px-3.5 py-2 pr-10 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm font-mono focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Simpan</span>
            </button>
            {hasKey && (
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold text-xs border border-rose-500/30 transition-all"
              >
                Hapus Key
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
