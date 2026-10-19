import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Flame, Zap } from 'lucide-react';

// ==========================================
// 1. VECTOR ARCHER CHARACTER (No box, no border)
// ==========================================
const ArcherFigure = ({ activeCharacter = 'verdant', isDrawing = false, isHurt = false }) => {
  const isStorm = activeCharacter === 'storm';
  const cloakColor = isStorm ? '#0284c7' : '#059669';
  const cloakHighlight = isStorm ? '#38bdf8' : '#10b981';
  const accentGlow = isStorm ? 'rgba(56, 189, 248, 0.45)' : 'rgba(16, 185, 129, 0.45)';

  return (
    <div className="relative flex flex-col items-center">
      {/* Floor Contact Shadow (Resting on arena ground) */}
      <div className="absolute -bottom-1 w-12 sm:w-16 h-2.5 bg-black/80 rounded-full blur-[2px] pointer-events-none" />

      {/* Standalone Vector Archer */}
      <svg
        viewBox="0 0 80 90"
        className="w-14 h-18 sm:w-18 sm:h-22 overflow-visible"
        style={{ filter: `drop-shadow(0 0 10px ${accentGlow})` }}
      >
        {/* Flowing Cape */}
        <path
          d={isDrawing ? "M28 34 Q10 46 14 74 Q24 70 32 64 Z" : "M28 34 Q8 48 12 76 Q22 72 30 66 Z"}
          fill={cloakColor}
          stroke={cloakHighlight}
          strokeWidth="1.5"
        />

        {/* Quiver & Arrows on Back */}
        <rect x="22" y="24" width="7" height="24" rx="2" fill="#78350f" transform="rotate(-18 22 24)" />
        <line x1="22" y1="23" x2="16" y2="12" stroke="#cbd5e1" strokeWidth="1.8" />
        <polygon points="16,12 18,15 14,15" fill={cloakHighlight} />
        <line x1="25" y1="24" x2="21" y2="10" stroke="#cbd5e1" strokeWidth="1.8" />
        <polygon points="21,10 23,13 19,13" fill={cloakHighlight} />

        {/* Legs & Boots */}
        <rect x="30" y="60" width="7" height="18" rx="2" fill="#334155" />
        <path d="M29 74 L37 74 L38 82 L27 82 Z" fill="#1e293b" />
        <rect x="42" y="60" width="7" height="18" rx="2" fill="#334155" />
        <path d="M41 74 L49 74 L50 82 L39 82 Z" fill="#1e293b" />

        {/* Tunic & Belt */}
        <path d="M28 36 L52 36 L48 64 L30 64 Z" fill="#1e293b" />
        <rect x="29" y="52" width="21" height="4" fill="#78350f" />
        <rect x="37" y="51" width="5" height="6" fill="#fbbf24" rx="1" />

        {/* Hooded Head & Face */}
        <circle cx="39" cy="23" r="14" fill={cloakColor} />
        {/* Face opening */}
        <path d="M37 16 Q48 19 46 29 Q38 33 36 26 Z" fill="#fed7aa" />
        {/* Eye focused on target */}
        <circle cx="43" cy="22" r="1.5" fill="#0f172a" />
        {/* Hood brow peak */}
        <path d="M30 18 Q40 10 49 19 Q43 23 30 18 Z" fill={cloakHighlight} />

        {/* Archer Bow & Arms */}
        {/* Left Arm extended forward holding bow */}
        <path d="M42 38 L58 40 L60 46" stroke="#fed7aa" strokeWidth="4" strokeLinecap="round" fill="none" />
        
        {/* Recurve Bow (Crescent) */}
        <path
          d="M58 20 Q66 42 58 66"
          stroke="#92400e"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Bow Golden Limb Tips */}
        <circle cx="58" cy="20" r="2.5" fill="#fbbf24" />
        <circle cx="58" cy="66" r="2.5" fill="#fbbf24" />

        {/* Bowstring */}
        {isDrawing ? (
          // Pulled string
          <path d="M58 20 L40 43 L58 66" stroke="#f8fafc" strokeWidth="1.2" fill="none" />
        ) : (
          // Relaxed string
          <line x1="58" y1="20" x2="58" y2="66" stroke="#f8fafc" strokeWidth="1.2" />
        )}

        {/* Right Arm Pulling String */}
        <path
          d={isDrawing ? "M36 38 L42 42 L40 43" : "M36 38 L48 42 L52 44"}
          stroke="#fed7aa"
          strokeWidth="3.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Arrow nocked on bow when drawing */}
        {isDrawing && (
          <g>
            <line x1="38" y1="43" x2="64" y2="43" stroke="#f1f5f9" strokeWidth="2" />
            <polygon points="64,40 70,43 64,46" fill={cloakHighlight} />
            <circle cx="68" cy="43" r="3" fill={cloakHighlight} opacity="0.6" />
          </g>
        )}
      </svg>
    </div>
  );
};

// ==========================================
// 2. VECTOR BOSS DRAGON (No box, no border)
// ==========================================
const DragonFigure = ({ isAttacking = false, isHit = false }) => {
  return (
    <div className="relative flex flex-col items-center">
      {/* Floor Contact Shadow (Resting on arena ground) */}
      <div className="absolute -bottom-1 w-18 sm:w-26 h-2.5 sm:h-3.5 bg-black/80 rounded-full blur-[2px] pointer-events-none" />

      {/* Standalone Vector Wyvern Dragon */}
      <svg
        viewBox="0 0 110 100"
        className="w-20 h-18 sm:w-28 sm:h-24 overflow-visible"
        style={{
          filter: isHit
            ? 'drop-shadow(0 0 25px rgba(244,63,94,0.9)) brightness(2) contrast(1.5)'
            : 'drop-shadow(0 0 14px rgba(225,29,72,0.45))',
        }}
      >
        {/* Dragon Tail */}
        <path d="M85 75 Q105 80 102 62 Q98 55 92 65" fill="#1e101a" stroke="#881337" strokeWidth="2" />

        {/* Left Wing (Spread Wide) */}
        <path
          d="M55 45 Q75 10 95 18 Q85 36 78 52 Q65 48 55 45 Z"
          fill="#4c0519"
          stroke="#e11d48"
          strokeWidth="1.8"
        />
        {/* Wing Bones */}
        <path d="M55 45 Q75 10 95 18" stroke="#f43f5e" strokeWidth="2.5" fill="none" />
        <path d="M72 26 L78 52" stroke="#be123c" strokeWidth="1.2" />

        {/* Dragon Hind Legs & Talons */}
        <path d="M62 65 L66 82 L60 84 M66 82 L68 84" stroke="#1e101a" strokeWidth="5" strokeLinecap="round" />
        <circle cx="62" cy="84" r="2" fill="#fb7185" />
        <circle cx="68" cy="84" r="2" fill="#fb7185" />

        {/* Dragon Torso */}
        <path d="M40 50 Q58 45 68 62 Q58 76 42 70 Z" fill="#1c0b16" stroke="#9f1239" strokeWidth="2" />
        {/* Underbelly Ridges (Fiery Glow) */}
        <path d="M42 56 Q50 54 54 64 Q46 68 40 66 Z" fill="#e11d48" opacity="0.8" />
        <line x1="42" y1="58" x2="48" y2="65" stroke="#fecdd3" strokeWidth="1" />
        <line x1="47" y1="56" x2="52" y2="63" stroke="#fecdd3" strokeWidth="1" />

        {/* Right Wing (Foreground) */}
        <path
          d="M48 48 Q35 15 15 22 Q28 42 38 56 Z"
          fill="#881337"
          stroke="#f43f5e"
          strokeWidth="1.8"
        />
        <path d="M48 48 Q35 15 15 22" stroke="#fb7185" strokeWidth="2.5" fill="none" />
        <path d="M26 30 L32 50" stroke="#f43f5e" strokeWidth="1.2" />

        {/* Scaled Neck & Spikes */}
        <path d="M42 52 Q35 40 28 32 Q36 30 42 40 Z" fill="#1c0b16" />
        <polygon points="34,36 30,30 38,34" fill="#f43f5e" />
        <polygon points="39,43 35,37 43,41" fill="#f43f5e" />

        {/* Dragon Head (Lunging Forward when attacking) */}
        <g transform={isAttacking ? "translate(-8, -2)" : "translate(0, 0)"}>
          {/* Skull */}
          <path d="M28 32 Q15 28 10 32 Q14 42 26 40 Q32 38 28 32 Z" fill="#1c0b16" stroke="#9f1239" strokeWidth="1.8" />
          
          {/* Curved Horns */}
          <path d="M26 30 Q34 16 38 12 Q33 22 24 27" fill="#881337" stroke="#fda4af" strokeWidth="1" />
          <path d="M22 28 Q28 18 32 15 Q27 24 20 27" fill="#4c0519" />

          {/* Glowing Eye */}
          <circle cx="21" cy="32" r="2" fill="#fbbf24" />
          <circle cx="21" cy="32" r="0.8" fill="#7f1d1d" />

          {/* Open Jaws & Molten Throat */}
          {isAttacking ? (
            <g>
              {/* Lower Jaw Dropped */}
              <path d="M22 40 L8 46 L18 42 Z" fill="#1c0b16" stroke="#9f1239" strokeWidth="1.5" />
              {/* Throat Fire Core */}
              <circle cx="14" cy="38" r="6" fill="#f97316" />
              <circle cx="12" cy="39" r="3.5" fill="#fef08a" />
              {/* Fangs */}
              <polygon points="12,33 13,36 14,33" fill="#ffffff" />
              <polygon points="10,43 11,40 12,43" fill="#ffffff" />
            </g>
          ) : (
            <g>
              <path d="M22 39 L12 40 L16 38 Z" fill="#1c0b16" />
              {/* Molten Glow inside closed teeth */}
              <circle cx="14" cy="37" r="1.5" fill="#f97316" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};

// ==========================================
// 3. MAIN BATTLE STAGE COMPONENT (CLEAN MODERN FLAT ARENA)
// ==========================================
export const BattleStage = ({
  activeCharacter = 'verdant',
  playerHearts = 3,
  maxHearts = 3,
  bossHp = 100,
  currentRound = 1,
  totalRounds = 10,
  combatState = 'idle', // 'idle' | 'player_attacking' | 'boss_attacking' | 'hurt'
  isFlickering = false,
}) => {
  const isStorm = activeCharacter === 'storm';

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-[#060b14] h-40 sm:h-48 shadow-2xl flex flex-col justify-between select-none">
      {/* 1. CLEAN MODERN DARK FANTASY FLAT BACKGROUND (NO REALISTIC IMAGE) */}
      {/* Gradient Night Sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1325] via-[#070d18] to-[#040810]" />

      {/* Atmospheric Celestial Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Minimalist Distant Mountain Silhouettes */}
      <svg
        viewBox="0 0 800 160"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-8 sm:bottom-10 w-full h-24 sm:h-28 opacity-30 pointer-events-none"
      >
        {/* Deep background peaks */}
        <path
          d="M0 110 L60 70 L140 100 L230 65 L330 95 L440 55 L550 90 L650 60 L730 95 L800 70 L800 160 L0 160 Z"
          fill="#1e293b"
        />
        {/* Mid-ground ridges */}
        <path
          d="M0 125 L90 95 L190 120 L280 85 L390 115 L490 80 L590 110 L690 90 L770 115 L800 100 L800 160 L0 160 Z"
          fill="#0f172a"
        />
      </svg>

      {/* Subtle Star Embers in Night Sky */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <span className="absolute top-6 left-1/4 w-1 h-1 rounded-full bg-cyan-200 animate-pulse" />
        <span className="absolute top-10 left-1/2 w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse delay-300" />
        <span className="absolute top-8 right-1/4 w-1 h-1 rounded-full bg-amber-200 animate-pulse delay-700" />
        <span className="absolute top-12 right-1/3 w-0.5 h-0.5 rounded-full bg-white" />
        <span className="absolute top-4 left-1/3 w-0.5 h-0.5 rounded-full bg-white" />
      </div>

      {/* SCREEN FLASH RED ON DAMAGE */}
      <AnimatePresence>
        {combatState === 'hurt' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-rose-600/35 z-40 pointer-events-none backdrop-brightness-125"
          />
        )}
      </AnimatePresence>

      {/* 2. TOP HUD (Hearts, Round, Boss HP) */}
      <div className="relative z-30 flex items-center justify-between px-2 sm:px-4 py-1.5 sm:py-2">
        {/* Left: Player Hearts */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-800/80 shadow-md">
          {Array.from({ length: maxHearts }).map((_, index) => {
            const isAlive = index < playerHearts;
            return (
              <motion.div
                key={index}
                animate={isAlive ? { scale: [1, 1.15, 1] } : { scale: 0.8 }}
                transition={{ duration: 1.5, repeat: isAlive ? Infinity : 0, delay: index * 0.2 }}
              >
                <Heart
                  className={`w-4 h-4 transition-colors duration-300 ${
                    isAlive
                      ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                      : 'text-slate-700 fill-slate-800'
                  }`}
                />
              </motion.div>
            );
          })}
          <span className="text-[11px] font-bold text-slate-300 ml-1">
            {playerHearts} / {maxHearts}
          </span>
        </div>

        {/* Center: Round Indicator */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[10px] sm:text-[11px] font-bold text-slate-300 shadow">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Babak {currentRound} / {totalRounds}</span>
        </div>

        {/* Right: Boss HP Bar */}
        <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 flex items-center gap-2 shadow-md">
          <div className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse fill-rose-500" />
            <span className="text-[10px] font-black text-rose-300 tracking-wider">BOSS</span>
          </div>
          <div className="w-20 sm:w-28 h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden relative">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-rose-600 via-orange-500 to-amber-400 shadow-[0_0_10px_rgba(244,63,94,0.8)]"
              animate={{ width: `${Math.max(0, bossHp)}%` }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            />
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-300 w-7 text-right">
            {Math.max(0, Math.round(bossHp))}%
          </span>
        </div>
      </div>

      {/* 3. ARENA GROUND PLATFORM (Lantai Pijakan Bersih) */}
      <div className="absolute inset-x-0 bottom-0 h-8 sm:h-9 bg-gradient-to-b from-[#0f1d30] via-[#09111e] to-[#040810] border-t-2 border-slate-700/80 shadow-lg pointer-events-none z-10">
        {/* Neon Floor Accent Line (Emerald to Rose split) */}
        <div className="w-full h-0.5 bg-gradient-to-r from-emerald-500/70 via-slate-600/40 to-rose-500/70 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
      </div>

      {/* 4. 2D BATTLE STAGE CANVAS (Characters resting precisely on ground) */}
      <div className="relative z-20 flex items-end justify-between px-6 sm:px-14 pb-2.5 sm:pb-3 flex-1">
        {/* ARCHER (LEFT) - STANDS DIRECTLY ON GROUND LINE */}
        <motion.div
          animate={
            combatState === 'player_attacking'
              ? {
                  // Draw & release recoil animation
                  x: [-8, 14, 0],
                  scale: [1, 1.05, 1],
                  transition: { duration: 0.35, ease: 'easeOut' },
                }
              : combatState === 'hurt'
              ? {
                  // Knocked back to the left
                  x: [0, -28, -14],
                  rotate: [0, -10, 0],
                  transition: { duration: 0.35 },
                }
              : isFlickering
              ? {
                  // Invincibility respawn flicker
                  opacity: [1, 0.15, 1, 0.15, 1, 0.25, 1],
                  transition: { duration: 1.2 },
                }
              : {
                  // Idle ready bobbing
                  y: [0, -4, 0],
                  transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
                }
          }
          className="relative"
        >
          <ArcherFigure
            activeCharacter={activeCharacter}
            isDrawing={combatState === 'player_attacking'}
            isHurt={combatState === 'hurt'}
          />
        </motion.div>

        {/* 5. PROYEKTIL PANAH HIJAU MELUNCUR CEPAT (BENAR) */}
        <AnimatePresence>
          {combatState === 'player_attacking' && (
            <motion.div
              initial={{ left: '16%', opacity: 1, scale: 0.8 }}
              animate={{ left: '76%', opacity: 1, scale: 1.1 }}
              exit={{ opacity: 0, scale: 1.4 }}
              transition={{ duration: 0.28, ease: 'easeIn' }}
              className="absolute bottom-11 sm:bottom-13 z-30 pointer-events-none flex items-center"
            >
              {/* Glowing Arrow Projectile */}
              <div className="relative flex items-center">
                {/* Radiant Light Trail */}
                <div
                  className={`w-16 sm:w-24 h-1.5 rounded-full blur-[1px] shadow-lg ${
                    isStorm
                      ? 'bg-gradient-to-r from-transparent via-cyan-400 to-white shadow-[0_0_15px_rgba(6,182,212,1)]'
                      : 'bg-gradient-to-r from-transparent via-emerald-400 to-white shadow-[0_0_15px_rgba(16,185,129,1)]'
                  }`}
                />
                {/* Luminous Arrowhead */}
                <div
                  className={`w-4 h-4 rounded-full border-2 border-white shadow-xl flex items-center justify-center -ml-1 ${
                    isStorm ? 'bg-cyan-300' : 'bg-emerald-300'
                  }`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SPARK PARTICLES EXPLOSION ON DRAGON (BENAR) */}
        <AnimatePresence>
          {combatState === 'player_attacking' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.8], opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, delay: 0.22 }}
              className="absolute right-12 sm:right-20 bottom-12 z-30 pointer-events-none"
            >
              <div
                className={`w-12 h-12 rounded-full border-2 animate-spin blur-[1px] ${
                  isStorm ? 'border-cyan-300 bg-cyan-400/30' : 'border-emerald-300 bg-emerald-400/30'
                }`}
              />
              <Sparkles
                className={`w-8 h-8 absolute -top-2 -left-2 ${
                  isStorm ? 'text-cyan-200 fill-cyan-300' : 'text-emerald-200 fill-emerald-300'
                }`}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 6. PROYEKTIL SEMBURAN API NAGA (SALAH) */}
        <AnimatePresence>
          {combatState === 'boss_attacking' && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '68%', opacity: 1 }}
              exit={{ opacity: 0, scaleY: 0 }}
              transition={{ duration: 0.32, ease: 'easeOut' }}
              className="absolute right-20 sm:right-28 bottom-11 sm:bottom-13 z-30 pointer-events-none flex items-center justify-end overflow-hidden"
            >
              {/* Roaring Fire Breath Beam / Cone */}
              <div className="w-full h-8 sm:h-10 bg-gradient-to-l from-amber-300 via-orange-500 to-rose-600 rounded-l-full blur-[1px] shadow-[0_0_35px_rgba(244,63,94,1)] flex items-center justify-start px-2 relative">
                <Flame className="w-7 h-7 text-yellow-200 fill-orange-400 animate-spin" />
                <div className="absolute inset-0 bg-yellow-200/40 rounded-l-full animate-pulse" />
                <span className="text-white text-xs font-black tracking-widest pl-2">
                  &lt;&lt;&lt;🔥
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOSS DRAGON (RIGHT) - STANDS DIRECTLY ON GROUND LINE */}
        <motion.div
          animate={
            combatState === 'player_attacking'
              ? {
                  // Violent shake animation when hit by arrow
                  x: [0, -16, 16, -12, 12, -8, 8, -4, 4, 0],
                  y: [0, -4, 4, -3, 3, 0],
                  transition: { duration: 0.45, delay: 0.15 },
                }
              : combatState === 'boss_attacking'
              ? {
                  // Lunging head & body forward to breathe fire
                  x: [0, -32, 0],
                  scale: [1, 1.12, 1],
                  transition: { duration: 0.38 },
                }
              : {
                  // Idle breathing hover
                  y: [0, -5, 0],
                  transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' },
                }
          }
          className="relative"
        >
          <DragonFigure
            isAttacking={combatState === 'boss_attacking'}
            isHit={combatState === 'player_attacking'}
          />
        </motion.div>
      </div>
    </div>
  );
};
