/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Note {
  id: string;
  title: string;
  content: string; // Stored encrypted when security is active
  decryptedContent?: string; // Used in memory during current session
  createdAt: number;
  updatedAt: number;
  category: string;
  tags: string[];
  isPinned: boolean;
  isDeleted: boolean;
  deletedAt?: number;
  wordCount: number;
  charCount: number;
  color?: string; // Hex code or custom gradient accent for adaptive UI
  bgColor?: string; // Customizable note editor/card background color
  textColor?: string; // Customizable note text color
}

export type ThemeType = 
  | 'EXECUTIVE_DARK' 
  | 'PREMIUM_LIGHT' 
  | 'MIDNIGHT_TITANIUM' 
  | 'AURORA_GRADIENT' 
  | 'DYNAMIC_ADAPTIVE'
  | 'CYBERPUNK_NEON'
  | 'VINTAGE_SEPIA'
  | 'FOREST_EMERALD'
  | 'SOLARIZED_DARK'
  | 'ROYAL_VELVET';

export type FontSizeType = 'sm' | 'md' | 'lg' | 'xl';

export interface SecuritySettings {
  isLocked: boolean;
  pinCode: string; // 4-digit PIN code
  isPrivacyModeActive: boolean; // Previews hidden
  fingerprintConfigured: boolean;
  securityQuestion: string;
  securityAnswer: string;
}

export interface AppState {
  notes: Note[];
  selectedNoteId: string | null;
  searchQuery: string;
  selectedCategory: string; // 'all', 'pinned', 'trash', or custom categories
  selectedSort: 'newest' | 'oldest' | 'alphabetical' | 'last_edited';
  theme: ThemeType;
  fontSize: FontSizeType;
  security: SecuritySettings;
  isUnlocked: boolean; // Session unlock state
  isGridView: boolean;
}
