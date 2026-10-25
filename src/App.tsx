import React, { useState, useEffect } from 'react';
import { 
  Task, 
  FinanceRecord, 
  FileBookmark, 
  VaultItem, 
  Goal, 
  MoodMode, 
  MoodLog, 
  AppSettings, 
  ActiveTab 
} from './types';
import { 
  loadDatabase, 
  saveDatabase, 
  MeftahDatabase, 
  getDatabaseMetrics 
} from './utils/storage';
import { DesktopTitleBar } from './components/DesktopTitleBar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { TasksView } from './components/TasksView';
import { FinanceView } from './components/FinanceView';
import { FilesView } from './components/FilesView';
import { VaultView } from './components/VaultView';
import { GoalsView } from './components/GoalsView';
import { AnalyticsView } from './components/AnalyticsView';
import { RescueModal } from './components/RescueModal';
import { SettingsBackupModal } from './components/SettingsBackupModal';

export default function App() {
  const [db, setDb] = useState<MeftahDatabase>(() => loadDatabase());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isRescueModalOpen, setIsRescueModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Sync to local storage on any state update
  useEffect(() => {
    saveDatabase(db);
  }, [db]);

  const metrics = getDatabaseMetrics(db);

  // Task Handlers
  const handleAddTask = (newTask: Omit<Task, 'id' | 'createdAt' | 'completed' | 'pomodorosCompleted'>) => {
    const task: Task = {
      ...newTask,
      id: `task-${Date.now()}`,
      completed: false,
      createdAt: new Date().toISOString(),
      pomodorosCompleted: 0
    };
    setDb(prev => ({ ...prev, tasks: [task, ...prev.tasks] }));
  };

  const handleQuickAddTask = (title: string) => {
    const task: Task = {
      id: `task-${Date.now()}`,
      title,
      priority: 'medium',
      category: 'work',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '12:00',
      completed: false,
      createdAt: new Date().toISOString(),
      estimatedMinutes: 25,
      pomodorosCompleted: 0
    };
    setDb(prev => ({ ...prev, tasks: [task, ...prev.tasks] }));
  };

  const handleToggleTask = (taskId: string) => {
    setDb(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined
          };
        }
        return t;
      })
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setDb(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId)
    }));
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setDb(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
    }));
  };

  // Finance Handlers
  const handleAddFinance = (record: Omit<FinanceRecord, 'id'>) => {
    const newRecord: FinanceRecord = {
      ...record,
      id: `fin-${Date.now()}`
    };
    setDb(prev => ({ ...prev, finance: [newRecord, ...prev.finance] }));
  };

  const handleDeleteFinance = (id: string) => {
    setDb(prev => ({
      ...prev,
      finance: prev.finance.filter(f => f.id !== id)
    }));
  };

  // Files Handlers
  const handleAddFile = (file: Omit<FileBookmark, 'id'>) => {
    const newFile: FileBookmark = {
      ...file,
      id: `file-${Date.now()}`
    };
    setDb(prev => ({ ...prev, files: [newFile, ...prev.files] }));
  };

  const handleDeleteFile = (id: string) => {
    setDb(prev => ({
      ...prev,
      files: prev.files.filter(f => f.id !== id)
    }));
  };

  const handleTogglePinFile = (id: string) => {
    setDb(prev => ({
      ...prev,
      files: prev.files.map(f => f.id === id ? { ...f, isPinned: !f.isPinned } : f)
    }));
  };

  // Vault Handlers
  const handleAddVaultItem = (item: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: VaultItem = {
      ...item,
      id: `vault-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setDb(prev => ({ ...prev, vault: [newItem, ...prev.vault] }));
  };

  const handleDeleteVaultItem = (id: string) => {
    setDb(prev => ({
      ...prev,
      vault: prev.vault.filter(v => v.id !== id)
    }));
  };

  const handleToggleFavoriteVault = (id: string) => {
    setDb(prev => ({
      ...prev,
      vault: prev.vault.map(v => v.id === id ? { ...v, isFavorite: !v.isFavorite } : v)
    }));
  };

  // Goals Handlers
  const handleAddGoal = (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goal,
      id: `goal-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setDb(prev => ({ ...prev, goals: [newGoal, ...prev.goals] }));
  };

  const handleUpdateGoal = (updatedGoal: Goal) => {
    setDb(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === updatedGoal.id ? updatedGoal : g)
    }));
  };

  const handleDeleteGoal = (id: string) => {
    setDb(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== id)
    }));
  };

  // Settings & Mood Handlers
  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setDb(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  };

  const handleUpdateMood = (mood: MoodMode) => {
    const newLog: MoodLog = {
      id: `mood-${Date.now()}`,
      mood,
      timestamp: new Date().toISOString()
    };
    setDb(prev => ({
      ...prev,
      moodLogs: [newLog, ...prev.moodLogs],
      settings: { ...prev.settings, currentMood: mood }
    }));

    if (mood === 'stressed') {
      setIsRescueModalOpen(true);
    }
  };

  const handleLogRescueActivity = (activityName: string) => {
    const newLog: MoodLog = {
      id: `mood-rescue-${Date.now()}`,
      mood: 'happy',
      timestamp: new Date().toISOString(),
      activityDone: activityName,
      note: `تم تنفيذ نشاط ترويق: ${activityName}`
    };
    setDb(prev => ({
      ...prev,
      moodLogs: [newLog, ...prev.moodLogs],
      settings: { ...prev.settings, currentMood: 'happy' }
    }));
  };

  const handleRestoreDatabase = (restoredDb: MeftahDatabase) => {
    setDb(restoredDb);
  };

  const pendingTasksCount = db.tasks.filter(t => !t.completed).length;
  const activeGoalsCount = db.goals.length;

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 font-['Cairo',sans-serif] overflow-hidden select-none">
      {/* Desktop Windows Title Bar */}
      <DesktopTitleBar
        settings={db.settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenBackup={() => setIsSettingsModalOpen(true)}
        storageKb={metrics.sizeKb}
        onTriggerRescue={() => setIsRescueModalOpen(true)}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'settings') {
              setIsSettingsModalOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          pendingTasksCount={pendingTasksCount}
          activeGoalsCount={activeGoalsCount}
          settings={db.settings}
          onUpdateMood={handleUpdateMood}
          onTriggerRescue={() => setIsRescueModalOpen(true)}
        />

        {/* Active View Container */}
        <main className="flex-1 bg-slate-950 overflow-y-auto custom-scrollbar">
          {activeTab === 'dashboard' && (
            <DashboardView
              tasks={db.tasks}
              finance={db.finance}
              files={db.files}
              goals={db.goals}
              settings={db.settings}
              onSelectTab={setActiveTab}
              onToggleTask={handleToggleTask}
              onTriggerRescue={() => setIsRescueModalOpen(true)}
              onQuickAddTask={handleQuickAddTask}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              tasks={db.tasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
              settings={db.settings}
            />
          )}

          {activeTab === 'finance' && (
            <FinanceView
              finance={db.finance}
              onAddFinance={handleAddFinance}
              onDeleteFinance={handleDeleteFinance}
              settings={db.settings}
            />
          )}

          {activeTab === 'files' && (
            <FilesView
              files={db.files}
              onAddFile={handleAddFile}
              onDeleteFile={handleDeleteFile}
              onTogglePin={handleTogglePinFile}
              settings={db.settings}
            />
          )}

          {activeTab === 'vault' && (
            <VaultView
              vault={db.vault}
              onAddVaultItem={handleAddVaultItem}
              onDeleteVaultItem={handleDeleteVaultItem}
              onToggleFavorite={handleToggleFavoriteVault}
              settings={db.settings}
              onUpdateSettings={handleUpdateSettings}
            />
          )}

          {activeTab === 'goals' && (
            <GoalsView
              goals={db.goals}
              onAddGoal={handleAddGoal}
              onUpdateGoal={handleUpdateGoal}
              onDeleteGoal={handleDeleteGoal}
              settings={db.settings}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              tasks={db.tasks}
              finance={db.finance}
              goals={db.goals}
              moodLogs={db.moodLogs}
              settings={db.settings}
            />
          )}
        </main>
      </div>

      {/* "أنا مخنوق" Decompression Rescue Modal */}
      <RescueModal
        isOpen={isRescueModalOpen}
        onClose={() => setIsRescueModalOpen(false)}
        onLogMoodActivity={handleLogRescueActivity}
        soundEnabled={db.settings.soundEffects}
      />

      {/* Backup, Storage & Windows EXE Guide Modal */}
      <SettingsBackupModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={db.settings}
        onUpdateSettings={handleUpdateSettings}
        database={db}
        onRestoreDatabase={handleRestoreDatabase}
      />
    </div>
  );
}
