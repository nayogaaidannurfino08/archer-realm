import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { hasGeminiApiKey } from '../../services/geminiApi';

export const ApiKeyBanner = () => {
  const hasKey = hasGeminiApiKey();

  return (
    <div className="rounded-2xl border transition-all overflow-hidden bg-[#0c1424]/90 border-slate-800/90 shadow-lg p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Icon & Info */}
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl border shrink-0 ${
              hasKey
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-400'
            }`}
          >
            {hasKey ? <CheckCircle2 className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                {hasKey ? 'Google Gemini AI Studio Aktif' : 'Fitur AI Siap Dikonfigurasi'}
              </h4>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  hasKey
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {hasKey ? 'Siap Pakai' : 'Mode Demo Aktif'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {hasKey
                ? 'Sistem terhubung ke Gemini AI Studio (Flash Model) Free Tier via environment variable hosting.'
                : 'Fitur AI memerlukan konfigurasi Environment Variable di hosting (VITE_GEMINI_API_KEY).'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
