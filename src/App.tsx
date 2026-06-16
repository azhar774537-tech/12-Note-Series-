/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, Grid, List, Folder, Tag, Pin, Calendar, FileText, 
  Trash2, Shield, Eye, Settings, Sparkles, Feather, CircleAlert, Check
} from 'lucide-react';

import { Note, ThemeType, FontSizeType, SecuritySettings, AppState } from './types';
import { encryptText, decryptText } from './utils/crypto';
import { SplashView } from './components/SplashView';
import { LockScreen } from './components/LockScreen';
import { DeviceFrame } from './components/DeviceFrame';
import { NoteList } from './components/NoteList';
import { EditorView } from './components/EditorView';
import { SettingsModal } from './components/SettingsModal';

const STORAGE_KEY = "@12_note_series_sandbox_state";

// Master starter luxury seed note packets
const SEED_NOTES = (): Note[] => [
  {
    id: "welcome_note_12",
    title: "12 Note Series Sovereign Manifest",
    content: encryptText(
      "Welcome to 12 Note Series — the world's most premium, distraction-free corporate secure notepad.\n\nEvery single brief you log here is dynamically scrambled using a specialized client-side cryptograhic hash. No intelligence algorithms, parsers, or scraper bots can access your thoughts. This notepad operates entirely on zero-knowledge offline local storage.\n\n👑 KEY FEATURES SYSTEM:\n1. Dynamic Theme Modules: Select from five majestic executive visual themes via settings.\n2. Biometric and Pattern Lock Gates: Protect your memory stack with PIN or Fingerprint scanners.\n3. Recycle Safety Vaults: Deleted documents are kept here for 30 days before shredding.\n4. Fluid Plaintext document exports: Direct printing to PDF or .txt file streams.\n\nTo lock or personalize your sandbox, tap the gear icon above. Enjoy executive-grade documentation.",
      "1212"
    ),
    decryptedContent: "Welcome to 12 Note Series — the world's most premium, distraction-free corporate secure notepad.\n\nEvery single brief you log here is dynamically scrambled using a specialized client-side cryptograhic hash. No intelligence algorithms, parsers, or scraper bots can access your thoughts. This notepad operates entirely on zero-knowledge offline local storage.\n\n👑 KEY FEATURES SYSTEM:\n1. Dynamic Theme Modules: Select from five majestic executive visual themes via settings.\n2. Biometric and Pattern Lock Gates: Protect your memory stack with PIN or Fingerprint scanners.\n3. Recycle Safety Vaults: Deleted documents are kept here for 30 days before shredding.\n4. Fluid Plaintext document exports: Direct printing to PDF or .txt file streams.\n\nTo lock or personalize your sandbox, tap the gear icon above. Enjoy executive-grade documentation.",
    createdAt: Date.now() - 3600000 * 2, // 2 hours ago
    updatedAt: Date.now() - 3600000 * 2,
    category: "Executive Briefs",
    tags: ["manifest", "guide", "confidential"],
    isPinned: true,
    isDeleted: false,
    wordCount: 140,
    charCount: 880,
    color: "#C5A880"
  },
  {
    id: "asset_note_12",
    title: "Strategic Multi-Chain Inventory Briefing",
    content: encryptText(
      "SECURED BRIEF - AUTHORIZED EYES ONLY\n\nParameters resolved for strategic allocations in next fiscal cycle:\n- Global Vault Anchorage: Coordinates Locked under code A-99\n- Sovereign Ledger: Self-referential plaintext storage only\n- Contact Channel: Secure offline wireless node beacons.",
      "1212"
    ),
    decryptedContent: "SECURED BRIEF - AUTHORIZED EYES ONLY\n\nParameters resolved for strategic allocations in next fiscal cycle:\n- Global Vault Anchorage: Coordinates Locked under code A-99\n- Sovereign Ledger: Self-referential plaintext storage only\n- Contact Channel: Secure offline wireless node beacons.",
    createdAt: Date.now() - 3600000 * 12, // 12 hours ago
    updatedAt: Date.now() - 3600000 * 10,
    category: "Strategy Vault",
    tags: ["strategy", "assets"],
    isPinned: false,
    isDeleted: false,
    wordCount: 35,
    charCount: 240,
    color: "#9B2C2C"
  },
  {
    id: "ideas_note_12",
    title: "Minimalist Craftsmanship Ideation",
    content: encryptText(
      "Design criteria for premium executive software:\n- No unrequested clutter or logs\n- Pure obsidian elements matched with genuine deep golds and cashmere silvers\n- Generous, deliberate negative space pairings\n- Tactile typewriter audio feedback",
      "1212"
    ),
    decryptedContent: "Design criteria for premium executive software:\n- No unrequested clutter or logs\n- Pure obsidian elements matched with genuine deep golds and cashmere silvers\n- Generous, deliberate negative space pairings\n- Tactile typewriter audio feedback",
    createdAt: Date.now() - 3600000 * 48, // 2 days ago
    updatedAt: Date.now() - 3600000 * 46,
    category: "Unfiled Scribbles",
    tags: ["philosophy", "design"],
    isPinned: false,
    isDeleted: false,
    wordCount: 32,
    charCount: 228,
    color: "#319795"
  }
];

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [state, setState] = useState<AppState>({
    notes: [],
    selectedNoteId: null,
    searchQuery: "",
    selectedCategory: "all",
    selectedSort: "newest",
    theme: "EXECUTIVE_DARK",
    fontSize: "md",
    security: {
      isLocked: false,
      pinCode: "1212", // Default secure PIN
      isPrivacyModeActive: false,
      fingerprintConfigured: true,
      securityQuestion: "What is your primary encryption safeguard node?",
      securityAnswer: "gate"
    },
    isUnlocked: false, // Session auth state
    isGridView: false
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 1. Initial Load and Decrypt localStorage transactions
  useEffect(() => {
    try {
      const persisted = localStorage.getItem(STORAGE_KEY);
      if (persisted) {
        const parsed = JSON.parse(persisted);
        
        // Decrypt notes text using the user's PIN code
        const userPin = parsed.security?.pinCode || "1212";
        const decryptedNotes = (parsed.notes || []).map((note: Note) => {
          return {
            ...note,
            decryptedContent: decryptText(note.content, userPin)
          };
        });

        setState({
          ...parsed,
          notes: decryptedNotes,
          isUnlocked: parsed.security?.isLocked ? false : true // lock if requested
        });
      } else {
        // Load default seed notes
        setState((prev) => ({
          ...prev,
          notes: SEED_NOTES(),
          isUnlocked: true
        }));
      }
    } catch (e) {
      console.error("Critical storage parse failed, defaulting database seeds", e);
      setState((prev) => ({
        ...prev,
        notes: SEED_NOTES(),
        isUnlocked: true
      }));
    }
  }, []);

  // 2. Auto-sync fully encrypted notes to client key-value cache
  const syncStateToLocalStorage = (latestState: AppState) => {
    try {
      const userPin = latestState.security.pinCode || "1212";
      
      // Scramble normal text format into gibberish before writing to storage
      const encryptedNotes = latestState.notes.map((note) => {
        const textToEncrypt = note.decryptedContent !== undefined ? note.decryptedContent : note.content;
        return {
          ...note,
          content: encryptText(textToEncrypt, userPin),
          decryptedContent: undefined // Never persist decrypted text to disk!
        };
      });

      const serializedState = {
        ...latestState,
        notes: encryptedNotes,
        isUnlocked: false // force lock safety on next fresh reload
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedState));
    } catch (e) {
      console.error("Storage write transaction blocked", e);
    }
  };

  // State update wrapping helpers to seamlessly trigger saving
  const updateState = (updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev);
      syncStateToLocalStorage(next);
      return next;
    });
  };

  // 3. Security Unlock sequence
  const handleUnlockSuccess = () => {
    updateState((prev) => ({ ...prev, isUnlocked: true }));
  };

  // 4. Note Updating
  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    updateState((prev) => {
      const updatedNotes = prev.notes.map((note) => {
        if (note.id === id) {
          const contentText = updates.decryptedContent !== undefined ? updates.decryptedContent : note.decryptedContent;
          const words = contentText ? contentText.trim().split(/\s+/).length : 0;
          const chars = contentText ? contentText.length : 0;

          return {
            ...note,
            ...updates,
            wordCount: words,
            charCount: chars,
            updatedAt: Date.now()
          };
        }
        return note;
      });
      return { ...prev, notes: updatedNotes };
    });
  };

  // 5. Creating New notes
  const handleCreateNewNote = (category: string = "Unfiled Scribbles") => {
    const id = `note_${Date.now()}`;
    const newNotePacket: Note = {
      id,
      title: "UNPUBLISHED STRATEGY BRIEF",
      content: "",
      decryptedContent: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      category: category,
      tags: ["draft"],
      isPinned: false,
      isDeleted: false,
      wordCount: 0,
      charCount: 0,
      color: "#C5A880" // Primary Executive gold highlight
    };

    updateState((prev) => ({
      ...prev,
      notes: [newNotePacket, ...prev.notes],
      selectedNoteId: id
    }));
  };

  // 6. Delete (Recycle Bin shift)
  const handleDeleteNote = (id: string) => {
    updateState((prev) => {
      const updated = prev.notes.map((n) => {
        if (n.id === id) {
          return { ...n, isDeleted: true, deletedAt: Date.now() };
        }
        return n;
      });
      return { ...prev, notes: updated, selectedNoteId: null };
    });
  };

  // 7. Restore Note from Recycling
  const handleRestoreNote = (id: string) => {
    updateState((prev) => {
      const updated = prev.notes.map((n) => {
        if (n.id === id) {
          return { ...n, isDeleted: false, deletedAt: undefined };
        }
        return n;
      });
      return { ...prev, notes: updated };
    });
  };

  // 8. Fully Shred note from system storage
  const handlePermanentShred = (id: string) => {
    updateState((prev) => {
      const filtered = prev.notes.filter((n) => n.id !== id);
      return { ...prev, notes: filtered, selectedNoteId: null };
    });
  };

  // Save changes to settings
  const handleSetTheme = (t: ThemeType) => {
    updateState((prev) => ({ ...prev, theme: t }));
  };

  const handleSetFontSize = (fs: FontSizeType) => {
    updateState((prev) => ({ ...prev, fontSize: fs }));
  };

  const handleSetSecuritySettings = (s: SecuritySettings) => {
    updateState((prev) => ({ ...prev, security: s }));
  };

  const handleResetDatabase = () => {
    localStorage.removeItem(STORAGE_KEY);
    updateState((prev) => ({
      ...prev,
      notes: SEED_NOTES(),
      selectedNoteId: null,
      theme: "EXECUTIVE_DARK"
    }));
    setIsSettingsOpen(false);
  };

  // 9. Document Exporter file bridge
  const handleExportAll = (format: 'txt' | 'json') => {
    if (format === 'txt') {
      const consolidatedText = state.notes
        .filter(n => !n.isDeleted)
        .map(n => `TITLE: ${n.title}\nCATEGORY: ${n.category}\nDATE: ${new Date(n.updatedAt).toLocaleString()}\n\n${n.decryptedContent || n.content}\n\n========================================\n\n`)
        .join("\n");

      const element = document.createElement("a");
      const file = new Blob([consolidatedText], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `12_note_all_briefs_backup.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else {
      // JSON secure download containing raw keys
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.notes));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `12_note_series_backups_seed.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.removeChild(downloadAnchor);
    }
  };

  // 10. Document Backup Importer
  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        if (file.name.endsWith('.json')) {
          // Parse JSON database seed notes
          const importedNotes = JSON.parse(text) as Note[];
          if (Array.isArray(importedNotes)) {
            const sanitized = importedNotes.map(n => ({
              ...n,
              id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              decryptedContent: decryptText(n.content, state.security.pinCode)
            }));
            updateState(prev => ({
              ...prev,
              notes: [...sanitized, ...prev.notes]
            }));
            alert("🔒 JSON notes vault successfully synchronized!");
          }
        } else {
          // Parse single raw TXT document details
          const titleName = file.name.replace('.txt', '').replace(/_/g, ' ').toUpperCase();
          const newN: Note = {
            id: `imported_txt_${Date.now()}`,
            title: titleName,
            content: encryptText(text, state.security.pinCode),
            decryptedContent: text,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            category: "Unfiled Scribbles",
            tags: ["imported", "txt"],
            isPinned: false,
            isDeleted: false,
            wordCount: text.trim().split(/\s+/).length,
            charCount: text.length,
            color: "#718096"
          };
          updateState(prev => ({
            ...prev,
            notes: [newN, ...prev.notes]
          }));
          alert("✔️ Imported plaintext note successfully indexed!");
        }
      } catch (err) {
        alert("❌ Failed parsing file container. Please make sure the structure matches expectations.");
      }
    };
    reader.readAsText(file);
  };

  // --- Dynamic Color Schemes and typography settings based on visual active themes ---
  const visualThemeConfig = useMemo(() => {
    const isLight = state.theme === 'PREMIUM_LIGHT' || state.theme === 'VINTAGE_SEPIA';
    let bgClass = "bg-[#0B0C10]";
    let cardClass = "bg-[#181a24]/80 text-[#E2E8F0] border-slate-900";
    let textMuted = "text-slate-500";
    let accentColor = "#C5A880"; // Gold luxurious primary

    switch (state.theme) {
      case 'PREMIUM_LIGHT':
        bgClass = "bg-[#F8FAFC] dots-pattern-light";
        cardClass = "bg-white text-[#0F172A] border-slate-200 shadow-sm";
        accentColor = "#4cbd95"; // Warm mint emerald silver light accent
        break;
      case 'CYBERPUNK_NEON':
        bgClass = "bg-[#05030A] dots-pattern";
        cardClass = "bg-[#0E061A] text-[#10FF80] border-[#FF0055]/30 hover:border-[#FF0055] shadow-xl";
        accentColor = "#FF0055"; // Pink Cyber
        break;
      case 'VINTAGE_SEPIA':
        bgClass = "bg-[#F4EFE6] dots-pattern-light";
        cardClass = "bg-[#EFE8D9] text-[#2C1E11] border-[#D1C2A3] shadow-sm";
        accentColor = "#8C6239"; // Mahogany Cognac
        break;
      case 'FOREST_EMERALD':
        bgClass = "bg-[#08120E] dots-pattern";
        cardClass = "bg-[#0E2018] text-[#DCEFE5] border-[#1D4031] hover:border-[#38C172]/30 shadow-xl";
        accentColor = "#38C172"; // Pine green
        break;
      case 'SOLARIZED_DARK':
        bgClass = "bg-[#002B36] dots-pattern";
        cardClass = "bg-[#073642] text-[#93A1A1] border-[#586E75] hover:border-[#CB4B16]/30 shadow-xl";
        accentColor = "#CB4B16"; // Solarized red-orange
        break;
      case 'ROYAL_VELVET':
        bgClass = "bg-[#0A0518] dots-pattern";
        cardClass = "bg-[#140C2B] text-[#E0E7FF] border-[#311E63]/50 hover:border-[#818CF8]/30 shadow-xl";
        accentColor = "#818CF8"; // Lavender royal
        break;
      case 'MIDNIGHT_TITANIUM':
        bgClass = "bg-[#0F111A]";
        cardClass = "bg-[#1A1D2D]/90 text-slate-100 border-slate-800";
        accentColor = "#14b8a6"; // Electric Teal accent
        break;
      case 'AURORA_GRADIENT':
        bgClass = "bg-[#060314]";
        cardClass = "bg-[#100928]/95 text-slate-200 border-indigo-950/40";
        accentColor = "#EC4899"; // Glowing Pink/Lavender accent
        break;
      case 'DYNAMIC_ADAPTIVE':
        // Try to read active selected note's color code, otherwise default through gold
        const activeNote = state.notes.find(n => n.id === state.selectedNoteId);
        accentColor = activeNote && activeNote.color ? activeNote.color : "#C5A880";
        bgClass = "bg-[#0B0A0F]";
        cardClass = "bg-[#16151D]/90 text-slate-200 border-[#23212D]";
        break;
      case 'EXECUTIVE_DARK':
      default:
        bgClass = "bg-[#0A0A0B] dots-pattern";
        cardClass = "bg-[#161619] text-[#E0E0E0] border-white/5 hover:border-blue-500/30 shadow-xl transition-all";
        accentColor = "#3B82F6";
        break;
    }

    return { isLight, bgClass, cardClass, textMuted, accentColor };
  }, [state.theme, state.selectedNoteId, state.notes]);

  const activeNoteObject = useMemo(() => {
    return state.notes.find((n) => n.id === state.selectedNoteId) || null;
  }, [state.notes, state.selectedNoteId]);

  // Adjust app core font size class maps
  const fontSizeClassMap = {
    sm: 'text-[11px] leading-relaxed',
    md: 'text-xs leading-relaxed',
    lg: 'text-sm leading-relaxed',
    xl: 'text-base leading-relaxed'
  };

  return (
    <div className={`h-full w-full select-none ${visualThemeConfig.isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0A0A0B] text-[#E2E8F0]'}`}>
      
      {/* 1. CINEMATIC STARTUP SPLASH SCREEN (2-3s delay) */}
      <AnimatePresence>
        {showSplash && (
          <SplashView 
            accentColor={visualThemeConfig.accentColor} 
            onComplete={() => setShowSplash(false)} 
          />
        )}
      </AnimatePresence>

      {!showSplash && (
        /* FLAGSHIP MOBILE/TABLET BOUNDARY FRAME */
        <DeviceFrame themeType={state.theme} accentColor={visualThemeConfig.accentColor}>
          
          <div className="absolute inset-0 flex flex-col h-full bg-[#0A0A0B] overflow-hidden relative">
            
            {/* 2. AUTHENTICATION APP LOCK WALL (Force entry on startup if enabled) */}
            <AnimatePresence>
              {state.security.isLocked && !state.isUnlocked && (
                <LockScreen
                  securitySettings={state.security}
                  onUnlock={handleUnlockSuccess}
                  accentColor={visualThemeConfig.accentColor}
                />
              )}
            </AnimatePresence>

            {/* MAIN ACTIVE APPLICATION WORKSPACE CONTENT */}
            {(!state.security.isLocked || state.isUnlocked) && (
              <div className={`flex-1 flex flex-col relative overflow-hidden ${visualThemeConfig.bgClass}`}>
                
                {/* 3. RESPONSIVE MULTI-PANE VIEW CONTROLLER (Side by side on tablet/foldable, single on phone) */}
                <div className="flex-1 flex h-full overflow-hidden">
                  
                  {/* Left Side: Note List Explorer Panel */}
                  <div className={`flex-col h-full transition-all duration-300 ${activeNoteObject ? 'hidden sm:flex sm:w-[260px] md:w-[320px] shrink-0 border-r border-[#1C1F2F]/20' : 'w-full flex'}`}>
                    <NoteList
                      notes={state.notes}
                      selectedNoteId={state.selectedNoteId}
                      onSelectNote={(id) => updateState((prev) => ({ ...prev, selectedNoteId: id }))}
                      onNewNote={handleCreateNewNote}
                      searchQuery={state.searchQuery}
                      setSearchQuery={(q) => updateState((prev) => ({ ...prev, searchQuery: q }))}
                      selectedCategory={state.selectedCategory}
                      setSelectedCategory={(cat) => updateState((prev) => ({ ...prev, selectedCategory: cat }))}
                      selectedSort={state.selectedSort}
                      setSelectedSort={(sort) => updateState((prev) => ({ ...prev, selectedSort: sort }))}
                      isGridView={state.isGridView}
                      setIsGridView={(gv) => updateState((prev) => ({ ...prev, isGridView: gv }))}
                      onOpenSettings={() => setIsSettingsOpen(true)}
                      isPrivacyModeActive={state.security.isPrivacyModeActive}
                      accentColor={visualThemeConfig.accentColor}
                      isLightMode={visualThemeConfig.isLight}
                    />
                  </div>

                  {/* Right Side: Document Editor Panel */}
                  <div id="editor_parent_box" className={`flex-1 h-full flex flex-col relative transition-all duration-300 ${!activeNoteObject ? 'hidden sm:flex sm:items-center sm:justify-center' : 'w-full flex'}`}>
                    {activeNoteObject ? (
                      <div className={`w-full h-full flex flex-col ${fontSizeClassMap[state.fontSize]}`}>
                        <EditorView
                          note={activeNoteObject}
                          onUpdateNote={handleUpdateNote}
                          onClose={() => updateState((prev) => ({ ...prev, selectedNoteId: null }))}
                          onDeleteNote={handleDeleteNote}
                          onRestoreNote={handleRestoreNote}
                          onPermanentDelete={handlePermanentShred}
                          accentColor={visualThemeConfig.accentColor}
                          isLightMode={visualThemeConfig.isLight}
                        />
                      </div>
                    ) : (
                      /* Tablet Empty State Screen */
                      <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 dots-pattern-container">
                        <div className="max-w-xs space-y-4 flex flex-col items-center">
                          <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
                            <Feather className="w-8 h-8 opacity-40 animate-pulse" style={{ color: visualThemeConfig.accentColor }} />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-base font-semibold font-display tracking-widest text-[#E2E8F0] uppercase">12 Note Workspace</h3>
                            <p className="text-xs text-slate-500 font-sans leading-relaxed">
                              Select an encrypted client brief on the explorer pane or launch a fresh note to populate this sector.
                            </p>
                          </div>
                          
                          {/* Launch directly from middle tablet view empty state */}
                          <button
                            id="empty_state_create_note"
                            onClick={() => handleCreateNewNote("Unfiled Scribbles")}
                            className="px-6 py-2 rounded-xl text-xs font-mono tracking-wider font-semibold active:scale-95 transition-all text-black hover:brightness-110 cursor-pointer flex items-center gap-1.5"
                            style={{ backgroundColor: visualThemeConfig.accentColor }}
                          >
                            <Plus className="w-4 h-4" />
                            Create New Note
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. SETTINGS LAYOUT CONTROL PANEL */}
                <AnimatePresence>
                  {isSettingsOpen && (
                    <SettingsModal
                      onClose={() => setIsSettingsOpen(false)}
                      theme={state.theme}
                      setTheme={handleSetTheme}
                      fontSize={state.fontSize}
                      setFontSize={handleSetFontSize}
                      security={state.security}
                      setSecurity={handleSetSecuritySettings}
                      onExport={handleExportAll}
                      onImport={handleImportBackup}
                      onResetDatabase={handleResetDatabase}
                      totalNotesCount={state.notes.filter(n => !n.isDeleted).length}
                      trashNotesCount={state.notes.filter(n => n.isDeleted).length}
                      accentColor={visualThemeConfig.accentColor}
                      isLightMode={visualThemeConfig.isLight}
                    />
                  )}
                </AnimatePresence>

              </div>
            )}
          </div>

        </DeviceFrame>
      )}

    </div>
  );
}
