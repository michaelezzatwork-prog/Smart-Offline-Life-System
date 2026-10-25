export type MoodMode = 'stressed' | 'neutral' | 'happy';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'work' | 'study' | 'personal' | 'health' | 'finance' | 'other';
  dueDate?: string;
  dueTime?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  estimatedMinutes?: number;
  pomodorosCompleted?: number;
}

export interface FinanceRecord {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  note: string;
  date: string;
  paymentMethod: 'cash' | 'card' | 'wallet' | 'bank';
}

export interface FileBookmark {
  id: string;
  title: string;
  pathOrUrl: string;
  type: 'folder' | 'file' | 'url' | 'app';
  category: string;
  description?: string;
  tags: string[];
  isPinned: boolean;
  lastOpened?: string;
}

export interface VaultItem {
  id: string;
  title: string;
  content: string;
  category: 'passwords' | 'notes' | 'ideas' | 'secrets' | 'documents';
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'career' | 'health' | 'learning' | 'finance' | 'spiritual' | 'life';
  targetDate: string;
  milestones: Milestone[];
  color: string;
  createdAt: string;
}

export interface MoodLog {
  id: string;
  mood: MoodMode;
  timestamp: string;
  note?: string;
  activityDone?: string;
}

export interface AppSettings {
  userName: string;
  currency: string;
  vaultPinHash: string; // Stored locally hashed / base64
  vaultSecurityQuestion?: string;
  vaultSecurityAnswer?: string;
  soundEffects: boolean;
  ambientSound: boolean;
  currentMood: MoodMode;
  autoBackupNoticeDays: number;
  lastBackupDate?: string;
  theme: 'windows-dark' | 'windows-slate' | 'windows-warm';
}

export type ActiveTab = 'dashboard' | 'tasks' | 'finance' | 'files' | 'vault' | 'goals' | 'analytics' | 'settings';

export interface RescueActivity {
  id: string;
  title: string;
  subtitle: string;
  instruction: string;
  durationSeconds: number;
  category: 'physical' | 'mental' | 'breathing' | 'challenge' | 'game' | 'gratitude';
  badge: string;
  emoji: string;
}
