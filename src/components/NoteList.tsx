/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, Search, Grid, List, Folder, Tag, Pin, Calendar, FileText, 
  Trash2, ChevronRight, Settings, Sparkles, Filter, ShieldAlert, BadgeInfo
} from 'lucide-react';
import { Note } from '../types';

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string | null) => void;
  onNewNote: (category?: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string; // "all", "trash", or a custom folder
  setSelectedCategory: (cat: string) => void;
  selectedSort: 'newest' | 'oldest' | 'alphabetical' | 'last_edited';
  setSelectedSort: (sort: 'newest' | 'oldest' | 'alphabetical' | 'last_edited') => void;
  isGridView: boolean;
  setIsGridView: (gv: boolean) => void;
  onOpenSettings: () => void;
  isPrivacyModeActive: boolean;
  accentColor: string;
  isLightMode: boolean;
}

export function NoteList({
  notes,
  selectedNoteId,
  onSelectNote,
  onNewNote,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedSort,
  setSelectedSort,
  isGridView,
  setIsGridView,
  onOpenSettings,
  isPrivacyModeActive,
  accentColor,
  isLightMode
}: NoteListProps) {

  // Define luxury default directories (Categories)
  const folders = [
    { id: 'all', label: 'All Documents', count: notes.filter(n => !n.isDeleted).length },
    { id: 'Executive Briefs', label: 'Executive Briefs', count: notes.filter(n => !n.isDeleted && n.category === 'Executive Briefs').length },
    { id: 'Personal Documents', label: 'Personal Documents', count: notes.filter(n => !n.isDeleted && n.category === 'Personal Documents').length },
    { id: 'Strategy Vault', label: 'Strategy Vault', count: notes.filter(n => !n.isDeleted && n.category === 'Strategy Vault').length },
    { id: 'Unfiled Scribbles', label: 'Unfiled Scribbles', count: notes.filter(n => !n.isDeleted && n.category === 'Unfiled Scribbles').length },
    { id: 'trash', label: 'Recycle Bin', count: notes.filter(n => n.isDeleted).length, icon: Trash2 },
  ];

  // Retrieve unique tags from our notes
  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>();
    notes.forEach(note => {
      if (!note.isDeleted && note.tags) {
        note.tags.forEach(t => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet).slice(0, 8); // top 8 categories
  }, [notes]);

  // Filter and sort the notes
  const processedNotes = useMemo(() => {
    // 1. Base Filter (Category and Deletion flag)
    let filtered = notes.filter(note => {
      if (selectedCategory === 'trash') {
        return note.isDeleted;
      }
      if (note.isDeleted) {
        return false;
      }
      if (selectedCategory === 'all') {
        return true;
      }
      return note.category === selectedCategory || note.tags.includes(selectedCategory);
    });

    // 2. Search Query filter (Title, Content, Tag)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(q) || 
        (note.decryptedContent || note.content).toLowerCase().includes(q) ||
        note.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // 3. Sorting options
    return filtered.sort((a, b) => {
      // Pinned notes are always on top!
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      switch (selectedSort) {
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'last_edited':
          return b.updatedAt - a.updatedAt;
        case 'newest':
        default:
          return b.createdAt - a.createdAt;
      }
    });

  }, [notes, selectedCategory, searchQuery, selectedSort]);

  // Format UNIX timestamp to beautiful date string
  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div id="note_explorer_pane" className="flex-1 flex flex-col h-full font-sans select-none relative">
      
      {/* 1. Header Workspace Controller */}
      <div className={`p-4 border-b flex flex-col gap-3.5 ${isLightMode ? 'border-slate-100 bg-white' : 'border-white/5 bg-[#121214]'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/20">
              <span className="text-white font-bold text-base tracking-tight select-none">12</span>
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wider uppercase font-display leading-tight select-none">12 Note Series</h2>
              <p className="text-[8px] font-mono tracking-widest text-[#3B82F6] uppercase leading-none mt-0.5 select-none">
                Enterprise &nbsp;&bull;&nbsp; Secure Vault
              </p>
            </div>
          </div>
          
          <button 
            id="open_settings_modal_btn"
            onClick={onOpenSettings} 
            className={`p-2 transition-all rounded-xl cursor-pointer ${isLightMode ? 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600' : 'bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white'}`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Instant Database Search Engine */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
          <input
            id="search_notes_field"
            type="text"
            placeholder="Search unlimited notes instantly..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full py-2.5 pl-11 pr-4 rounded-full text-xs outline-none border transition-all ${isLightMode ? 'bg-[#F1F5F9] border-[#E2E8F0] text-slate-800 focus:bg-white focus:border-slate-400' : 'bg-white/5 border-white/10 text-[#E0E0E0] placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500'}`}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")} 
              className="absolute right-4 top-3 text-[10px] text-slate-400 hover:text-white font-mono"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Toolbar (New Note, Filter Sort, View Toggle) */}
        <div className="flex items-center justify-between gap-2">
          {/* Create Note Trigger */}
          <button
            id="create_new_note_btn"
            onClick={() => onNewNote(selectedCategory !== 'trash' ? selectedCategory : 'Unfiled Scribbles')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold active:scale-95 transition-all text-white shadow-lg shadow-blue-900/20 cursor-pointer ${isLightMode ? 'bg-slate-900 hover:bg-slate-800' : 'bg-blue-600 hover:bg-blue-500'}`}
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>

          <div className="flex items-center gap-1.5">
            {/* Sort Selection Drop */}
            <div className={`flex items-center gap-1 px-1 border rounded-full ${isLightMode ? 'border-slate-200 bg-slate-50' : 'bg-white/5 border-white/10'}`}>
              <Filter className="w-3 h-3 text-slate-500 ml-2" />
              <select
                id="sort_notes_selector"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value as any)}
                className="text-[10px] font-mono tracking-[0.1em] py-1.5 bg-transparent pr-2 text-slate-400 block outline-none border-0 cursor-pointer uppercase font-semibold text-center"
              >
                <option value="newest">Recent</option>
                <option value="oldest">Historical</option>
                <option value="alphabetical">A-Z Name</option>
                <option value="last_edited">Last Edit</option>
              </select>
            </div>

            {/* Grid vs List View toggle */}
            <button
              id="grid_view_toggle_btn"
              onClick={() => setIsGridView(!isGridView)}
              className={`p-1.5 rounded-full border transition-all cursor-pointer ${isLightMode ? 'border-[#E2E8F0] hover:bg-slate-50' : 'border-white/10 hover:bg-white/5'} text-slate-500 hover:text-white`}
            >
              {isGridView ? <List className="w-3.5 h-3.5" /> : <Grid className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Horizontal Directories scroll (Folders) */}
      <div className={`p-2.5 px-4 overflow-x-auto flex gap-1.5 border-b select-none scrollbar-none items-center shrink-0 ${isLightMode ? 'bg-[#FBFBFC] border-slate-100' : 'bg-[#0A0A0B] border-white/5'}`}>
        {folders.map((fd) => {
          const isSelected = selectedCategory === fd.id;
          return (
            <button
              key={fd.id}
              onClick={() => setSelectedCategory(fd.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${isSelected ? (isLightMode ? 'bg-slate-900 text-white font-semibold' : 'bg-white/10 text-blue-400 border border-white/5 font-semibold') : (isLightMode ? 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200' : 'text-gray-400 hover:bg-white/5 border border-transparent')}`}
              style={{ color: isSelected && !isLightMode ? '#60a5fa' : '' }}
            >
              {fd.icon ? <fd.icon className="w-3.5 h-3.5" /> : <Folder className="w-3.5 h-3.5" />}
              <span>{fd.label}</span>
              <span className={`text-[9px] opacity-60 px-1.5 py-0.2 rounded-full font-mono font-bold ${isLightMode ? 'bg-[#000000]/5' : 'bg-black/35'}`}>{fd.count}</span>
            </button>
          );
        })}
      </div>

      {/* Tags Quick List Subhead */}
      {availableTags.length > 0 && (
        <div className={`flex gap-1.5 px-4 py-1.5 text-[9px] font-mono tracking-widest text-slate-500 overflow-x-auto uppercase items-center shrink-0 border-b ${isLightMode ? 'border-slate-150' : 'border-white/5'}`}>
          <span>🏷️ Filter:</span>
          {availableTags.map(tag => (
            <button 
              key={tag}
              onClick={() => setSelectedCategory(selectedCategory === tag ? 'all' : tag)}
              className={`hover:text-white rounded-md px-1.5 py-0.5 bg-white/5 border border-white/5 transition-colors cursor-pointer ${selectedCategory === tag ? (isLightMode ? 'text-blue-600 border-blue-200 bg-blue-50' : 'text-blue-400 border-blue-500/20 bg-blue-900/10') : ''}`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* 4. Notes Grid/List Component Content */}
      <div className="flex-1 overflow-y-auto p-4 dots-pattern-container">
        {processedNotes.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-3 shrink-0">
            <div className="p-4 bg-slate-900Item rounded-2.5xl bg-white/5 border border-white/5 w-14 h-14 flex items-center justify-center">
              <FileText className="w-7 h-7 text-slate-500" />
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-semibold tracking-wide">No decrypted indices resolved</h4>
              <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed mx-auto font-sans">
                {searchQuery ? "No matches recorded for this parameter search." : "Ready for unlimited note creations. Tap 'New Note'."}
              </p>
            </div>
            {selectedCategory === 'trash' && (
              <p className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
                Recycle Bin keeps assets for 30 days before shredding.
              </p>
            )}
          </div>
        ) : (
          <div className={isGridView ? "grid grid-cols-2 gap-3" : "flex flex-col gap-2.5"}>
            {processedNotes.map((note) => {
              const isSelected = selectedNoteId === note.id;
              
              // Privacy mode preview mask simulation
              const rawPreview = note.decryptedContent || note.content;
              const displayPreview = isPrivacyModeActive 
                ? "•••• •••• •••• ••••" 
                : rawPreview.substring(0, 60) + (rawPreview.length > 60 ? "..." : "");

              // Note color/tag custom aesthetic
              const highlightBorder = note.color ? note.color : accentColor;

              // Extract category colors
              const getCategoryColorClass = (cat: string) => {
                const c = cat.toLowerCase();
                if (c.includes('strategy')) return isLightMode ? 'text-blue-600' : 'text-blue-500';
                if (c.includes('executive')) return isLightMode ? 'text-amber-700' : 'text-amber-500';
                if (c.includes('personal')) return isLightMode ? 'text-emerald-600' : 'text-emerald-500';
                if (c.includes('scribbles') || c.includes('draft') || c.includes('unfiled')) return isLightMode ? 'text-purple-600' : 'text-purple-400';
                return isLightMode ? 'text-slate-600' : 'text-slate-400';
              };

              return (
                <motion.button
                  key={note.id}
                  onClick={() => onSelectNote(note.id)}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  className={`group relative p-5 rounded-2xl text-left border flex flex-col justify-between h-[132px] transition-all overflow-hidden ${
                    isSelected 
                      ? (isLightMode ? 'bg-[#F1F5F9] border-slate-300' : 'bg-[#1a1c24] border-blue-500/50 shadow-xl') 
                      : (isLightMode ? 'bg-white border-slate-100 shadow-sm hover:border-slate-300' : 'bg-[#161619] border-white/5 shadow-xl hover:border-blue-500/30')
                  } cursor-pointer`}
                  style={{
                    backgroundColor: note.bgColor ? note.bgColor : undefined,
                    borderColor: isSelected && !isLightMode ? '#3B82F6' : undefined,
                    boxShadow: isSelected && !isLightMode ? '0 12px 24px -10px rgba(59, 130, 246, 0.25)' : undefined
                  }}
                >
                  {/* Elegant gold or custom top edge accent line */}
                  <div className="absolute top-0 inset-x-0 h-[3px]" style={{ backgroundColor: note.color || '#3B82F6' }} />

                  <div className="w-full flex-1 flex flex-col justify-between">
                    {/* Top line: Brand tag category and short time */}
                    <div className="flex justify-between items-center mb-2.5">
                      <span className={`text-[10px] uppercase font-bold tracking-widest ${getCategoryColorClass(note.category)}`} style={{ color: note.textColor ? note.textColor : undefined }}>
                        {note.isDeleted ? 'TRASH' : note.category}
                      </span>
                      <span className="text-[9px] font-mono text-gray-500 uppercase shrink-0" style={{ color: note.textColor ? `${note.textColor}A0` : undefined }}>
                        {formatDate(note.updatedAt)}
                      </span>
                    </div>

                    {/* Note title heading with Pin check */}
                    <div className="flex items-start justify-between gap-1.5 mb-1.5">
                      <h3 className={`text-xs font-semibold leading-tight line-clamp-1 flex-1 font-sans uppercase tracking-wider ${
                        isSelected 
                          ? 'text-white font-bold' 
                          : isLightMode 
                            ? 'text-slate-900' 
                            : 'text-[#E0E0E0] group-hover:text-blue-400 transition-colors'
                      }`}
                      style={{ color: note.textColor ? note.textColor : undefined }}
                      >
                        {note.title || "Untitled Brief"}
                      </h3>
                      {note.isPinned && (
                        <Pin className="w-3 h-3 fill-current shrink-0 text-blue-500" style={{ color: highlightBorder }} />
                      )}
                    </div>

                    {/* Decrypted plain content segment */}
                    <p className={`text-[10px] font-sans leading-relaxed line-clamp-2 select-none overflow-hidden h-[30px] ${
                      isLightMode ? 'text-slate-500' : 'text-gray-400'
                    }`}
                    style={{ color: note.textColor ? `${note.textColor}D0` : undefined }}
                    >
                      {displayPreview || "No content saved."}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Master Warning Shield if lock is configured */}
      {notes.length > 0 && (
        <span className="text-[8px] font-mono text-slate-600/75 select-none absolute bottom-1 right-2 uppercase tracking-widest leading-none pointer-events-none text-right">
          ⚙️ PRIVATE SANDBOX ENCRYPTION : AES-XOR &bull; ON-CHIP
        </span>
      )}
    </div>
  );
}
