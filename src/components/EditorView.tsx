/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Pin, Trash2, RotateCcw, RotateCw, Save, Check, FileText, Download, 
  Tag, Folder, Hash, Sparkles, Share2, Clipboard, HelpCircle, RefreshCcw, ShieldAlert
} from 'lucide-react';
import { Note } from '../types';

interface EditorViewProps {
  note: Note;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onClose: () => void;
  onDeleteNote: (id: string) => void;
  onRestoreNote: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  accentColor: string;
  isLightMode: boolean;
}

export function EditorView({
  note,
  onUpdateNote,
  onClose,
  onDeleteNote,
  onRestoreNote,
  onPermanentDelete,
  accentColor,
  isLightMode
}: EditorViewProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.decryptedContent || note.content);
  const [category, setCategory] = useState(note.category);
  const [newTagInput, setNewTagInput] = useState("");
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [historyStack, setHistoryStack] = useState<{title: string, content: string}[]>([]);
  const [redoStack, setRedoStack] = useState<{title: string, content: string}[]>([]);

  const isPending = useTransition()[0];
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synced updates whenever active note swaps
  useEffect(() => {
    setTitle(note.title);
    setContent(note.decryptedContent || note.content);
    setCategory(note.category);
    setHistoryStack([{ title: note.title, content: note.decryptedContent || note.content }]);
    setRedoStack([]);
  }, [note.id]);

  // Document sound tap feedback
  const playTypingSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        // Random subtle high tone simulating premium typewriter key hit
        osc.frequency.setValueAtTime(400 + Math.random() * 60, ctx.currentTime);
        gain.gain.setValueAtTime(0.005, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      }
    } catch {}
  };

  // Real-time auto saver background process
  const triggerAutosave = (updatedTitle: string, updatedContent: string) => {
    setSaveStatus('saving');
    
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      // Calculate word/char counts
      const words = updatedContent.trim() ? updatedContent.trim().split(/\s+/).length : 0;
      const chars = updatedContent.length;

      onUpdateNote(note.id, {
        title: updatedTitle,
        decryptedContent: updatedContent,
        content: updatedContent, // Will be encrypted in App.tsx save handler
        wordCount: words,
        charCount: chars,
        updatedAt: Date.now()
      });
      setSaveStatus('saved');
    }, 400); // Debounced save delay
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    triggerAutosave(val, content);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    playTypingSound();
    
    // Add to history stack periodically
    if (val.length % 8 === 0) {
      setHistoryStack(prev => [...prev.slice(-20), { title, content: val }]);
    }
    
    triggerAutosave(title, val);
  };

  // Manual Undo
  const handleUndo = () => {
    if (historyStack.length <= 1) return;
    const previous = historyStack[historyStack.length - 2];
    const current = historyStack[historyStack.length - 1];
    
    setRedoStack(prev => [...prev, current]);
    setHistoryStack(prev => prev.slice(0, -1));
    
    setTitle(previous.title);
    setContent(previous.content);
    triggerAutosave(previous.title, previous.content);
  };

  // Manual Redo
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    
    setHistoryStack(prev => [...prev, next]);
    setRedoStack(prev => prev.slice(0, -1));
    
    setTitle(next.title);
    setContent(next.content);
    triggerAutosave(next.title, next.content);
  };

  // Tag Manager
  const handleAddTag = () => {
    const clean = newTagInput.trim().toLowerCase().replace(/#/g, '');
    if (clean && !note.tags.includes(clean)) {
      const updatedTags = [...note.tags, clean];
      onUpdateNote(note.id, { tags: updatedTags });
      setNewTagInput("");
    }
  };

  const handleRemoveTag = (t: string) => {
    const updatedTags = note.tags.filter(tag => tag !== t);
    onUpdateNote(note.id, { tags: updatedTags });
  };

  // Category Manager
  const handleCategorySelect = (c: string) => {
    setCategory(c);
    onUpdateNote(note.id, { category: c });
  };

  // Color selection list
  const luxuryColors = [
    { value: '#C5A880', label: 'Gold Accent' },
    { value: '#718096', label: 'Silver Navy' },
    { value: '#319795', label: 'Titanium Teal' },
    { value: '#B7791F', label: 'Amber Aura' },
    { value: '#9B2C2C', label: 'Ruby Brief' },
    { value: '#3B82F6', label: 'Sovereign Blue' },
    { value: '#EC4899', label: 'Cyber Rose' },
    { value: '#10B981', label: 'Emerald Mint' }
  ];

  const luxuryBgColors = [
    { value: '', label: 'Fluid Default' },
    { value: 'rgba(24, 24, 27, 0.9)', label: 'Obsidian Velvet' },
    { value: 'rgba(11, 22, 18, 0.9)', label: 'Zen Forest' },
    { value: 'rgba(9, 14, 26, 0.9)', label: 'Midnight Blue' },
    { value: 'rgba(26, 11, 14, 0.9)', label: 'Sangria Burgundy' },
    { value: 'rgba(17, 9, 28, 0.9)', label: 'Sunset Amethyst' },
    { value: 'rgba(245, 235, 230, 0.95)', label: 'Parchment Sand' }
  ];

  const luxuryTextColors = [
    { value: '', label: 'Themed Text' },
    { value: '#FFFFFF', label: 'Pure White' },
    { value: '#000000', label: 'Ink Black' },
    { value: '#C5A880', label: 'Cashmere Gold' },
    { value: '#34D399', label: 'Mint Grass' },
    { value: '#60A5FA', label: 'Glacier Blue' },
    { value: '#F472B6', label: 'Pink Glitch' }
  ];

  // Document Export Engines (TXT and PDF formatted outputs)
  const handleExportTxt = () => {
    const header = `========================================\n12 NOTE SERIES SECURE DOCUMENT SEED\nID: ${note.id}\nCategory: ${category}\nCreated: ${new Date(note.createdAt).toLocaleString()}\nUpdated: ${new Date(note.updatedAt).toLocaleString()}\n========================================\n\nTITLE: ${title}\n\nCONTENT:\n${content}\n\n[End of File - Zero-Knowledge Archive]`;
    const element = document.createElement("a");
    const file = new Blob([header], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${title.toLowerCase().replace(/\s+/g, '_')}_document.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleExportPDF = () => {
    // Elegant client-side printing output focused purely on readability
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${title} - 12 Note Series</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; padding: 40px; color: #111; line-height: 1.6; }
            .header { border-bottom: 2px solid #336; padding-bottom: 10px; margin-bottom: 30px; font-family: sans-serif; font-size: 11px; color: #444; }
            h1 { font-family: Arial, sans-serif; font-size: 26px; font-weight: bold; margin-bottom: 5px; color: #000; }
            .meta { font-size: 11px; font-style: italic; color: #555; margin-bottom: 25px; }
            .body-text { white-space: pre-wrap; font-size: 14px; text-align: justify; }
            .footer { border-top: 1px solid #ddd; margin-top: 50px; font-family: sans-serif; font-size: 9px; text-align: center; color: #888; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">12 NOTE SERIES &bull; ENCRYPTED DOCUMENT ARCHIVE</div>
          <h1>${title || 'Untitled Brief'}</h1>
          <div class="meta">Category: ${category} &bull; Generated: ${new Date(note.updatedAt).toLocaleString()}</div>
          <div class="body-text">${content}</div>
          <div class="footer">Confidential. Zero-Knowledge Offline Secure Shell Ecosystem.</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div 
      id="note_editor_pane" 
      className={`flex-1 flex flex-col h-full font-sans select-none relative transition-all duration-700 ${isLightMode ? 'bg-white' : 'bg-[#0A0A0B]'}`}
      style={{ backgroundColor: note.bgColor || undefined }}
    >
      
      {/* 1. Header Options Menu */}
      <header className={`p-3.5 border-b flex items-center justify-between z-10 shrink-0 ${isLightMode ? 'border-slate-100 bg-white' : 'border-white/5 bg-[#121214]'}`}>
        <div className="flex items-center gap-1">
          <button 
            id="back_to_list_btn"
            onClick={onClose} 
            className="p-1 px-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          {/* Real-time Save micro interaction indicator */}
          <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">
            {saveStatus === 'saving' ? (
              <span className="flex items-center gap-1 text-amber-400">
                <RefreshCcw className="w-2.5 h-2.5 animate-spin" />
                SAVING SYNC...
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-400">
                <Check className="w-2.5 h-2.5" />
                SECURELY PERSISTED
              </span>
            )}
          </span>
        </div>

        {/* Action Panel items (Pin, Undo/Redo, Delete) */}
        {!note.isDeleted ? (
          <div className="flex items-center gap-1">
            {/* Undo */}
            <button
              onClick={handleUndo}
              disabled={historyStack.length <= 1}
              className={`p-1.5 rounded-lg hover:bg-white/5 transition-opacity cursor-pointer ${historyStack.length <= 1 ? 'opacity-30' : 'text-slate-400 hover:text-white'}`}
              title="Undo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Redo */}
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className={`p-1.5 rounded-lg hover:bg-white/5 transition-opacity cursor-pointer ${redoStack.length === 0 ? 'opacity-30' : 'text-slate-400 hover:text-white'}`}
              title="Redo"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Pin Toggle */}
            <button
              id="pin_note_btn"
              onClick={() => onUpdateNote(note.id, { isPinned: !note.isPinned })}
              className={`p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer ${note.isPinned ? 'text-amber-400' : 'text-slate-500'}`}
              title={note.isPinned ? "Unpin document" : "Pin document"}
            >
              <Pin className="w-3.5 h-3.5 fill-current" />
            </button>

            {/* Recycle delete */}
            <button
              id="trash_note_btn"
              onClick={() => {
                onDeleteNote(note.id);
                onClose();
              }}
              className="p-1.5 rounded-lg hover:bg-red-950/40 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
              title="Send to recycle bin"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex gap-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 font-semibold bg-red-950/20 border border-red-950/40 px-2 py-0.5 rounded">
              Recycled Archive
            </span>
          </div>
        )}
      </header>

      {/* 2. RECYCLE BIN ACTIVE ACTION GATE BANNER */}
      {note.isDeleted && (
        <div className="bg-orange-950/20 border-b border-orange-950/40 p-3 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0 z-10">
          <div className="flex items-center gap-2 text-xs text-orange-400 font-sans">
            <ShieldAlert className="w-4 h-4 scale-110 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Restricted Debris Block</span>
              <p className="text-[9.5px] text-slate-400 mt-0.5 leading-none">Deleted documents stay for 30 days before molecular vaporisation.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              id="restore_note_btn"
              onClick={() => onRestoreNote(note.id)}
              className="px-3.5 py-1.5 bg-emerald-500/15 border border-emerald-500/20 hover:bg-emerald-500/25 text-emerald-400 uppercase font-mono text-[10px] rounded-lg tracking-wider transition-colors font-medium cursor-pointer"
            >
              Restore Document
            </button>
            <button
              id="permanent_shred_btn"
              onClick={() => {
                onPermanentDelete(note.id);
                onClose();
              }}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white uppercase font-mono text-[10px] rounded-lg tracking-wider transition-colors font-semibold cursor-pointer"
            >
              Shred Note
            </button>
          </div>
        </div>
      )}

      {/* 3. Primary Writing Fields Scroll Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4 relative dots-pattern-container">
        
        {/* Dynamic decorative note accent color bubble */}
        <div 
          className="absolute -top-10 left-12 w-64 h-64 rounded-full blur-[100px] pointer-events-none opacity-10 transition-colors duration-700" 
          style={{ backgroundColor: note.color || accentColor }}
        />

        {/* Title Input Field (Plain text) */}
        <input
          id="active_note_title"
          type="text"
          placeholder="SECURED BRIEFING TITLE..."
          value={title}
          onChange={handleTitleChange}
          disabled={note.isDeleted}
          className={`w-full bg-transparent border-b py-2 text-base font-bold font-display tracking-widest uppercase outline-none focus:border-blue-500/50 placeholder:text-gray-600 transition-colors ${
            isLightMode 
              ? `border-slate-100 ${note.isDeleted ? 'opacity-40 text-slate-400' : 'text-slate-900 focus:border-slate-300'}`
              : `border-white/[0.04] ${note.isDeleted ? 'opacity-40 text-slate-400' : 'text-white'}`
          }`}
          style={{ color: note.textColor ? note.textColor : undefined }}
        />

        {/* Rich body Content typing field */}
        <textarea
          id="active_note_content"
          placeholder="Begin typing secure documentation here... Your notes are instantly saved in real-time."
          value={content}
          onChange={handleContentChange}
          disabled={note.isDeleted}
          className={`w-full flex-1 bg-transparent py-1 text-xs font-sans leading-relaxed outline-none resize-none placeholder-slate-500 transition-all ${
            note.isDeleted 
              ? 'opacity-40 text-slate-400' 
              : isLightMode 
                ? 'text-slate-700' 
                : 'text-gray-300'
          }`}
          style={{ color: note.textColor ? note.textColor : undefined }}
        />

        {/* 4. Luxury Controls panel (Folders selects, Colors selectors, Tags list) */}
        {!note.isDeleted && (
          <div className={`pt-3 border-t space-y-3 shrink-0 ${isLightMode ? 'border-slate-100' : 'border-white/[0.04]'}`}>
            {/* Folders Placement Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Folder className="w-3.5 h-3.5" /> Direct:
              </span>
              <div className="flex gap-1.5 overflow-x-auto py-0.5 select-none text-[10px]">
                {['Executive Briefs', 'Personal Documents', 'Strategy Vault', 'Unfiled Scribbles'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-[10px] whitespace-nowrap transition-all cursor-pointer font-medium ${
                      category === cat 
                        ? (isLightMode ? 'bg-slate-900 text-white shadow' : 'bg-blue-600 text-white shadow-md shadow-blue-900/25') 
                        : (isLightMode ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'text-gray-400 bg-white/5 hover:bg-white/10 border border-transparent')
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Tag block management list */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Tags:
              </span>
              <div className="flex gap-1 flex-wrap items-center">
                {note.tags.map((t) => (
                  <span 
                    key={t}
                    className="inline-flex items-center gap-1 text-[9px] font-mono tracking-wider bg-white/5 border border-white/5 px-2 py-0.5 rounded text-slate-300"
                  >
                    #{t}
                    <button 
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-red-400 font-bold scale-110"
                    >
                      &times;
                    </button>
                  </span>
                ))}
                
                {/* Add dynamic new action input tag */}
                <div className="flex items-center">
                  <input
                    id="add_tag_field"
                    type="text"
                    maxLength={10}
                    placeholder="New Tag..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddTag();
                    }}
                    className="w-16 bg-transparent text-[9px] font-mono border-b border-white/5 focus:border-white/20 outline-none text-slate-400 py-0.5"
                  />
                  <button 
                    onClick={handleAddTag} 
                    className="text-[10px] ml-1 hover:text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Color accent Picker list */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 w-16 shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Accent:
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {luxuryColors.map((lc) => {
                    const isColorSelected = note.color === lc.value;
                    return (
                      <button
                        key={lc.value}
                        onClick={() => onUpdateNote(note.id, { color: lc.value })}
                        className="w-4 h-4 rounded-full relative transition-all hover:scale-110 cursor-pointer border border-white/10"
                        style={{ backgroundColor: lc.value }}
                        title={lc.label}
                      >
                        {isColorSelected && (
                          <div className="absolute inset-0 rounded-full border border-black/90 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Note Background Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 w-16 shrink-0 flex items-center gap-1">
                  <div className="w-3.5 h-3.5 rounded border border-dashed border-slate-500" /> Canvas:
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {luxuryBgColors.map((lbg) => {
                    const isBgSelected = (note.bgColor || '') === lbg.value;
                    const displayColor = lbg.value || (isLightMode ? '#FFFFFF' : '#0A0A0B');
                    return (
                      <button
                        key={lbg.value}
                        onClick={() => onUpdateNote(note.id, { bgColor: lbg.value })}
                        className="w-4 h-4 rounded relative transition-all hover:scale-110 cursor-pointer border border-white/10"
                        style={{ backgroundColor: displayColor }}
                        title={lbg.label}
                      >
                        {isBgSelected && (
                          <div className="absolute inset-0 rounded border border-blue-500/80 flex items-center justify-center bg-blue-500/10">
                            <Check className="w-2 text-blue-400 stroke-[3px]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Note Text Color Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 w-16 shrink-0 flex items-center gap-1">
                  <span className="text-[10px] font-serif font-bold">A</span> Ink Tone:
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {luxuryTextColors.map((ltc) => {
                    const isTextSelected = (note.textColor || '') === ltc.value;
                    const displayColor = ltc.value || (isLightMode ? '#0F172A' : '#E2E8F0');
                    return (
                      <button
                        key={ltc.value}
                        onClick={() => onUpdateNote(note.id, { textColor: ltc.value })}
                        className="w-4 h-4 rounded-full relative transition-all hover:scale-110 cursor-pointer border border-white/10 flex items-center justify-center bg-zinc-800 text-[9px] font-semibold"
                        style={{ color: displayColor }}
                        title={ltc.label}
                      >
                        A
                        {isTextSelected && (
                          <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-blue-500 flex items-center justify-center">
                            <Check className="w-2 h-2 text-white stroke-[3px]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Document statistics and Exports controller on footer */}
      <footer className={`p-3.5 border-t text-[10px] flex sm:flex-row justify-between items-center gap-2 ${isLightMode ? 'border-slate-100 bg-slate-50' : 'border-slate-850 bg-slate-900/40'}`}>
        {/* Character/Words diagnostics info */}
        <div className="flex gap-4 font-mono text-slate-500 text-[10px]">
          <span>WORDS: <strong className="text-slate-300">{note.wordCount || 0}</strong></span>
          <span>CHARS: <strong className="text-slate-300">{note.charCount || 0}</strong></span>
        </div>

        {/* Export options */}
        <div className="flex items-center gap-1.5 scrollbar-none select-none">
          <span className="text-[9px] font-mono text-slate-500 uppercase">Export Briefing:</span>
          
          <button
            id="export_txt_document"
            onClick={handleExportTxt}
            className="p-1 px-2.5 bg-slate-800/20 hover:bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700/10 rounded-lg text-[9px] uppercase font-mono transition-colors font-medium flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3 h-3 text-sky-400" />
            TXT
          </button>

          <button
            id="export_pdf_document"
            onClick={handleExportPDF}
            className="p-1 px-2.5 bg-slate-800/20 hover:bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700/10 rounded-lg text-[9px] uppercase font-mono transition-colors font-medium flex items-center gap-1 cursor-pointer"
          >
            <FileText className="w-3 h-3 text-emerald-400" />
            PDF PRINT
          </button>
        </div>
      </footer>
    </div>
  );
}
