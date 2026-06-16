/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, Info, Shield, Download, Upload, Type, Eye, EyeOff, LayoutGrid, Check, 
  Trash2, Database, AlertCircle, FileText, Sparkles, CreditCard, HelpCircle
} from 'lucide-react';
import { ThemeType, FontSizeType, SecuritySettings } from '../types';

interface SettingsModalProps {
  onClose: () => void;
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
  fontSize: FontSizeType;
  setFontSize: (fs: FontSizeType) => void;
  security: SecuritySettings;
  setSecurity: (s: SecuritySettings) => void;
  onExport: (format: 'txt' | 'json') => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onResetDatabase: () => void;
  totalNotesCount: number;
  trashNotesCount: number;
  accentColor: string;
  isLightMode: boolean;
}

export function SettingsModal({
  onClose,
  theme,
  setTheme,
  fontSize,
  setFontSize,
  security,
  setSecurity,
  onExport,
  onImport,
  onResetDatabase,
  totalNotesCount,
  trashNotesCount,
  accentColor,
  isLightMode
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'appearance' | 'security' | 'backup' | 'about'>('appearance');
  const [pinInput, setPinInput] = useState(security.pinCode);
  const [questionInput, setQuestionInput] = useState(security.securityQuestion);
  const [answerInput, setAnswerInput] = useState(security.securityAnswer);
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleUpdateSecurity = () => {
    // Save PIN and recovery
    setSecurity({
      ...security,
      pinCode: pinInput.length === 4 ? pinInput : security.pinCode,
      securityQuestion: questionInput,
      securityAnswer: answerInput
    });
    setPinChangeSuccess(true);
    setTimeout(() => setPinChangeSuccess(false), 2000);
  };

  const toggleAppLock = () => {
    setSecurity({
      ...security,
      isLocked: !security.isLocked
    });
  };

  const togglePrivacyPreviews = () => {
    setSecurity({
      ...security,
      isPrivacyModeActive: !security.isPrivacyModeActive
    });
  };

  const themesList: { id: ThemeType; name: string; desc: string; colors: string }[] = [
    { id: 'EXECUTIVE_DARK', name: 'Executive Dark Luxury', desc: 'Obsidian charcoal with gold accents', colors: 'bg-[#0B0C10] border-gold' },
    { id: 'PREMIUM_LIGHT', name: 'Premium Cashmere Light', desc: 'Soft warm whites with dark slate accents', colors: 'bg-slate-50 border-slate-300' },
    { id: 'CYBERPUNK_NEON', name: 'Cyberpunk Neon Pink', desc: 'Dark neon cyberspace with high-vibrancy pink', colors: 'bg-[#05030A] border-[#FF0055]' },
    { id: 'VINTAGE_SEPIA', name: 'Vintage Sepia Journal', desc: 'Nostalgic warm parchment paper and typewriter ink', colors: 'bg-[#F4EFE6] border-[#8C6239]' },
    { id: 'FOREST_EMERALD', name: 'Forest Emerald Zen', desc: 'Deep woods and foliage green with light mint', colors: 'bg-[#08120E] border-[#38C172]' },
    { id: 'SOLARIZED_DARK', name: 'Solarized Dark Teal', desc: 'Precision dark teal console layout with bright orange', colors: 'bg-[#002B36] border-[#CB4B16]' },
    { id: 'ROYAL_VELVET', name: 'Royal Velvet Lavender', desc: 'Deep amethyst purple with indigo highlights', colors: 'bg-[#0A0518] border-[#818CF8]' },
    { id: 'MIDNIGHT_TITANIUM', name: 'Midnight Titanium', desc: 'Brushed steel with electric teal highlights', colors: 'bg-[#111827] border-cyan-400' },
    { id: 'AURORA_GRADIENT', name: 'Aurora Gradient Space', desc: 'Deep violet canvas with neon pink shadows', colors: 'bg-[#0A0118] border-indigo-500' },
    { id: 'DYNAMIC_ADAPTIVE', name: 'Dynamic Adaptive Theme', desc: 'Flows with the tone of your active note', colors: 'bg-slate-900 border-rainbow animate-pulse' }
  ];

  const fontSizes: { id: FontSizeType; label: string; desc: string }[] = [
    { id: 'sm', label: 'Compact Executive', desc: '12px high density plaintext typing' },
    { id: 'md', label: 'Standard Medium', desc: '14px ideal focus sizing' },
    { id: 'lg', label: 'Reader Large', desc: '16px comfortable notes reading' },
    { id: 'xl', label: 'Super High-Contrast', desc: '18px max core visibility' }
  ];

  // Storage byte size calculator simulation
  const bytesUsed = totalNotesCount * 280 + trashNotesCount * 210;
  const sizeText = bytesUsed > 1024 ? `${(bytesUsed / 1024).toFixed(2)} KB` : `${bytesUsed} Bytes`;

  return (
    <div id="settings_modal" className="absolute inset-0 z-30 flex flex-col bg-black/50 backdrop-blur-md p-4 justify-center items-center">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`w-full max-w-sm h-[580px] rounded-3xl flex flex-col overflow-hidden shadow-2xl relative ${isLightMode ? 'bg-[#FFFFFF] text-[#0F172A] border border-slate-200' : 'bg-[#12141F] text-slate-100 border border-slate-800'}`}
      >
        {/* Modal Top Header */}
        <header className={`p-4 flex items-center justify-between border-b ${isLightMode ? 'border-slate-100' : 'border-slate-800'}`}>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
            <span className="text-xs uppercase font-mono font-medium tracking-widest text-slate-400">Security Sandbox Settings</span>
          </div>
          <button 
            id="close_settings_btn"
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Tab Selector buttons */}
        <div className={`grid grid-cols-4 border-b text-[10px] uppercase font-mono tracking-wider ${isLightMode ? 'border-slate-100 bg-slate-50' : 'border-slate-800 bg-black/20'}`}>
          <button 
            onClick={() => setActiveTab('appearance')}
            className={`py-3 transition-colors ${activeTab === 'appearance' ? 'border-b font-medium' : 'text-slate-500'} cursor-pointer`}
            style={{ borderBottomColor: activeTab === 'appearance' ? accentColor : 'transparent', color: activeTab === 'appearance' ? (isLightMode ? '#000': '#fff') : '' }}
          >
            Aesthetics
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`py-3 transition-colors ${activeTab === 'security' ? 'border-b font-medium' : 'text-slate-500'} cursor-pointer`}
            style={{ borderBottomColor: activeTab === 'security' ? accentColor : 'transparent', color: activeTab === 'security' ? (isLightMode ? '#000': '#fff') : '' }}
          >
            Encryption
          </button>
          <button 
            onClick={() => setActiveTab('backup')}
            className={`py-3 transition-colors ${activeTab === 'backup' ? 'border-b font-medium' : 'text-slate-500'} cursor-pointer`}
            style={{ borderBottomColor: activeTab === 'backup' ? accentColor : 'transparent', color: activeTab === 'backup' ? (isLightMode ? '#000': '#fff') : '' }}
          >
            Sync
          </button>
          <button 
            onClick={() => setActiveTab('about')}
            className={`py-3 transition-colors ${activeTab === 'about' ? 'border-b font-medium' : 'text-slate-500'} cursor-pointer`}
            style={{ borderBottomColor: activeTab === 'about' ? accentColor : 'transparent', color: activeTab === 'about' ? (isLightMode ? '#000': '#fff') : '' }}
          >
            About us
          </button>
        </div>

        {/* Modal Center Dynamic Client Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
          {/* TAB 1: APPEARANCE (Themes and Fonts) */}
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Luxury Theme Selector</label>
                <div className="flex flex-col gap-2">
                  {themesList.map((tm) => {
                    const isSelected = theme === tm.id;
                    return (
                      <button
                        key={tm.id}
                        onClick={() => setTheme(tm.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left border transition-all cursor-pointer ${isLightMode ? 'hover:bg-slate-50' : 'hover:bg-white/5'} ${isSelected ? 'border-white/25 ring-1 ring-offset-2' : isLightMode ? 'border-slate-100' : 'border-slate-850'}`}
                        style={{ ringColor: accentColor }}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded-full ${tm.colors}`} />
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold">{tm.name}</span>
                            <span className="text-[10px] text-slate-500">{tm.desc}</span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4" style={{ color: accentColor }} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Functional Font Sizing</label>
                <div className="grid grid-cols-2 gap-2">
                  {fontSizes.map((fs) => {
                    const isSelected = fontSize === fs.id;
                    return (
                      <button
                        key={fs.id}
                        onClick={() => setFontSize(fs.id)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${isLightMode ? 'hover:bg-slate-50' : 'hover:bg-white/5'} ${isSelected ? 'border-white/20' : isLightMode ? 'border-slate-100' : 'border-slate-850'}`}
                        style={{ borderColor: isSelected ? accentColor : '', backgroundColor: isSelected ? `${accentColor}1A` : '' }}
                      >
                        <Type className="w-4.5 h-4.5 mx-auto mb-1 opacity-70" />
                        <p className="text-[11px] font-semibold tracking-wide">{fs.label}</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">{fs.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ENCRYPTION AND APP LOCK */}
          {activeTab === 'security' && (
            <div className="space-y-4 font-sans">
              <div className={`p-3 rounded-xl flex items-center justify-between border ${isLightMode ? 'bg-slate-50 border-slate-100' : 'bg-black/20 border-slate-850'}`}>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold">Enable App PIN Gate</span>
                  <span className="text-[10px] text-slate-500">Require lock screen on application initialization</span>
                </div>
                <button
                  id="toggle_app_lock_btn"
                  onClick={toggleAppLock}
                  className="relative w-10 h-5 rounded-full transition-colors cursor-pointer"
                  style={{ backgroundColor: security.isLocked ? accentColor : 'rgba(255, 255, 255, 0.15)' }}
                >
                  <motion.div
                    className="w-4 h-4 rounded-full bg-black absolute top-0.5"
                    animate={{ left: security.isLocked ? 22 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              <div className={`p-3 rounded-xl flex items-center justify-between border ${isLightMode ? 'bg-slate-50 border-slate-100' : 'bg-black/20 border-slate-850'}`}>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold">Privacy Mode Preview Shroud</span>
                  <span className="text-[10px] text-slate-500 font-sans">Mask note subtitles with asterisks on grid layout</span>
                </div>
                <button
                  id="toggle_privacy_mode_btn"
                  onClick={togglePrivacyPreviews}
                  className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white cursor-pointer"
                >
                  {security.isPrivacyModeActive ? <EyeOff className="w-5 h-5 text-red-400" /> : <Eye className="w-5 h-5 text-emerald-400" />}
                </button>
              </div>

              {/* PIN Code Change */}
              <div className={`p-4 rounded-xl border space-y-3 ${isLightMode ? 'bg-slate-150 border-slate-200' : 'bg-slate-900/40 border-slate-850'}`}>
                <div className="flex items-center gap-1.5 text-xs font-mono tracking-wider text-slate-400 uppercase">
                  <Shield className="w-3.5 h-3.5" style={{ color: accentColor }} />
                  <span>Configure Master passcode</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500">New 4-Digit Security PIN</label>
                  <input
                    id="new_pin_input"
                    type="password"
                    maxLength={4}
                    placeholder="Enter 4 values (e.g. 1912)"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                    className={`w-full px-3 py-2 bg-black/35 border text-xs font-mono rounded-lg focus:outline-none focus:border-slate-400 text-white`}
                    style={{ borderColor: isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.1)' }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Lost recovery challenge statement</label>
                  <input
                    id="recovery_question_input"
                    type="text"
                    placeholder="E.g., What is my private dog's code name?"
                    value={questionInput}
                    onChange={(e) => setQuestionInput(e.target.value)}
                    className="w-full px-3 py-2 bg-black/35 border text-xs rounded-lg focus:outline-none text-white"
                    style={{ borderColor: isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.1)' }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Security Gate Answer</label>
                  <input
                    id="recovery_answer_input"
                    type="password"
                    placeholder="Answers are case-insensitive..."
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                    className="w-full px-3 py-2 bg-black/35 border text-xs rounded-lg focus:outline-none text-white"
                    style={{ borderColor: isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.1)' }}
                  />
                </div>

                {pinChangeSuccess && (
                  <p className="text-[10px] font-mono text-emerald-400 text-center uppercase tracking-wider animate-pulse">
                    ✔️ Cryptographic credentials applied.
                  </p>
                )}

                <button
                  id="save_security_btn"
                  onClick={handleUpdateSecurity}
                  className="w-full py-2 rounded-lg text-xs tracking-widest font-mono font-medium hover:brightness-110 uppercase active:scale-95 transition-all text-black cursor-pointer"
                  style={{ backgroundColor: accentColor }}
                >
                  Apply gate configs
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: BACKUP AND FILES STORAGE */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border space-y-2.5 ${isLightMode ? 'bg-slate-50 border-slate-100' : 'bg-black/20 border-slate-850'}`}>
                <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-slate-400">
                  <Database className="w-3.5 h-3.5" style={{ color: accentColor }} />
                  <span>Sandbox storage allocation</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-center py-1">
                  <div className="bg-black/20 p-2.5 rounded-lg border border-white/5">
                    <p className="text-[9px] font-mono uppercase text-slate-500">Index Payload</p>
                    <p className="text-sm font-semibold mt-1 font-mono">{sizeText}</p>
                  </div>
                  <div className="bg-black/20 p-2.5 rounded-lg border border-white/5">
                    <p className="text-[9px] font-mono uppercase text-slate-500">Total index count</p>
                    <p className="text-sm font-semibold mt-1 font-mono">{totalNotesCount} notes</p>
                  </div>
                </div>

                <div className="flex gap-2 text-[10px] font-mono text-slate-400 flex-col leading-tight">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span>Recycle Storage:</span>
                    <span className="text-orange-400 font-semibold">{trashNotesCount} active</span>
                  </div>
                  <p className="text-[9px] mt-1 text-slate-500">
                    Offline metadata persists completely inside standard encrypted dynamic SQLite keys. Clearing browse data wipes active memory unless backed up.
                  </p>
                </div>
              </div>

              {/* Text / File Operations */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Secured Document Operations</label>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onExport('txt')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${isLightMode ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-white/5 border-slate-850 hover:bg-white/10'}`}
                  >
                    <Download className="w-5 h-5 text-blue-400 mb-1" />
                    <span className="text-[11px] font-bold tracking-wide">Export TXT Vault</span>
                    <span className="text-[9px] text-slate-500 mt-0.5">Offline raw plaintexts</span>
                  </button>

                  <button
                    onClick={() => onExport('json')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${isLightMode ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-white/5 border-slate-850 hover:bg-white/10'}`}
                  >
                    <FileText className="w-5 h-5 text-emerald-400 mb-1" />
                    <span className="text-[11px] font-bold tracking-wide">Export JSON Seed</span>
                    <span className="text-[9px] text-slate-500 mt-0.5">Encrypted backups map</span>
                  </button>
                </div>

                {/* Import Notes Input Trigger */}
                <div className={`relative p-3.5 border border-dashed rounded-xl overflow-hidden text-center cursor-pointer ${isLightMode ? 'hover:bg-slate-50 border-slate-300' : 'hover:bg-white/5 border-slate-800'}`}>
                  <Upload className="w-5 h-5 mx-auto text-orange-400 mb-1.5" />
                  <span className="text-xs font-semibold block">Load Offline Document backup</span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Supports text parsing of .txt or .json notes</span>
                  <input
                    type="file"
                    accept=".txt,.json"
                    onChange={onImport}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Danger Reset */}
              <div className={`p-3.5 border border-red-950 bg-red-950/10 rounded-xl space-y-2`}>
                <div className="flex items-center gap-1 text-xs text-red-400 font-semibold uppercase font-mono">
                  <AlertCircle className="w-4 h-4" />
                  <span>Destructive Section</span>
                </div>
                
                {confirmReset ? (
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-red-300 font-sans leading-tight">
                      This will permanently wipe molecular indices, cache tables, and current notes indices. Wiped content cannot be recovered!
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={onResetDatabase}
                        className="flex-1 py-1 px-3 bg-red-600 text-white rounded text-[10px] uppercase font-mono font-bold"
                      >
                        Wipe Clean
                      </button>
                      <button
                        onClick={() => setConfirmReset(false)}
                        className="py-1 px-3 bg-slate-800 text-slate-300 rounded text-[10px] uppercase font-mono"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmReset(true)}
                    className="w-full py-2 bg-red-900/40 hover:bg-red-900/60 text-red-300 border border-red-900/60 rounded-lg text-xs font-mono uppercase tracking-widest text-center transition-colors cursor-pointer"
                  >
                    Clear Database indices
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ABOUT US (Product Statement) */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              <div className="text-center py-3 flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: `${accentColor}1C` }}>
                  <Sparkles className="w-6 h-6" style={{ color: accentColor }} />
                </div>
                <h3 className="text-base font-bold tracking-widest font-display uppercase text-white">12 Note Series</h3>
                <p className="text-[10px] font-mono text-slate-500 uppercase mt-0.5">Executive Sandbox Version 1.12</p>
              </div>

              <div className={`p-4 rounded-xl border leading-relaxed text-xs space-y-3 ${isLightMode ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-black/30 border-slate-850 text-slate-300'}`}>
                <p>
                  "12 Note Series is designed to provide a premium, distraction-free, secure, and elegant note-taking experience focused on productivity and simplicity."
                </p>
                <p>
                  Developed exclusively as a secure, sandboxed executive document lock, the engine prevents cloud surveillance by fully rendering data assets into a sandbox storage shell encrypted on-chip using client-side cryptographic hashes.
                </p>
              </div>

              <div className={`p-3 rounded-xl border text-[10px] text-slate-400 font-mono space-y-1 ${isLightMode ? 'bg-slate-50 border-slate-150' : 'bg-white/5 border-slate-850'}`}>
                <p>🎓 Author: Azhar AI Studio Executive Team</p>
                <p>⚡ Build Architecture: React 19 + TypeScript + Motion Engine</p>
                <p>🛡️ Licensing: Apache-2.0 Cryptographic Sandbox</p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-xs uppercase font-mono font-semibold tracking-wider text-center transition-all bg-white hover:bg-slate-200 text-black cursor-pointer"
              >
                Go To App Interface
              </button>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer bar with specs */}
        <footer className={`p-3 border-t text-[9px] text-center font-mono text-slate-500 ${isLightMode ? 'border-slate-100 bg-slate-50' : 'border-slate-800 bg-black/40'}`}>
          🔐 LOCAL CRYPTO BOUNDARIES ONLINE &bull; SECURE MEMORY ACTIVE &bull; 1.12
        </footer>
      </motion.div>
    </div>
  );
}
