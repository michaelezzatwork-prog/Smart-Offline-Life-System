import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Wallet, 
  FolderKanban, 
  Lock, 
  Target, 
  BarChart3, 
  Settings, 
  Flame,
  Smile,
  Meh,
  Frown
} from 'lucide-react';
import { ActiveTab, MoodMode, AppSettings } from '../types';
import { soundManager } from '../utils/audio';

interface Props {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  pendingTasksCount: number;
  activeGoalsCount: number;
  settings: AppSettings;
  onUpdateMood: (mood: MoodMode) => void;
  onTriggerRescue: () => void;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  pendingTasksCount,
  activeGoalsCount,
  settings,
  onUpdateMood,
  onTriggerRescue
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'tasks', label: 'مهامي اليومية', icon: <CheckSquare className="w-4 h-4" />, badge: pendingTasksCount, badgeColor: 'bg-amber-500 text-slate-950' },
    { id: 'finance', label: 'مصروفي والماليات', icon: <Wallet className="w-4 h-4" /> },
    { id: 'files', label: 'ملفاتي ومجلداتي', icon: <FolderKanban className="w-4 h-4" /> },
    { id: 'vault', label: 'الخزنة السرية', icon: <Lock className="w-4 h-4" /> },
    { id: 'goals', label: 'أهدافي الكبرى', icon: <Target className="w-4 h-4" />, badge: activeGoalsCount, badgeColor: 'bg-emerald-500 text-slate-950' },
    { id: 'analytics', label: 'الإحصائيات والإنجاز', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'النسخ والتهيئة', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleTabClick = (tab: ActiveTab) => {
    soundManager.playClick(settings.soundEffects);
    onSelectTab(tab);
  };

  const handleMoodClick = (mood: MoodMode) => {
    soundManager.playClick(settings.soundEffects);
    onUpdateMood(mood);
  };

  return (
    <aside 
      id="desktop-sidebar"
      className="w-64 bg-slate-900/95 border-l border-slate-800/80 flex flex-col justify-between p-3 select-none flex-shrink-0 h-[calc(100vh-44px)] overflow-y-auto custom-scrollbar"
    >
      {/* Top Section: Navigation Links */}
      <div className="space-y-4">
        {/* User Card */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-2.5 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-500/20 to-amber-400/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
            {settings.userName.slice(0, 1) || 'م'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-slate-200 truncate">{settings.userName}</h4>
            <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              النظام جاهز ومحلي
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
            الأقسام الرئيسية
          </div>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-amber-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${item.badgeColor || 'bg-slate-700 text-slate-300'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Mood Mode & Emergency Rescue Button */}
      <div className="space-y-3 pt-3 border-t border-slate-800/80">
        {/* Mood Mode Selector */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 px-1 mb-1.5 flex items-center justify-between">
            <span>حالتك المزاجية الآن:</span>
            <span className="text-amber-400 font-normal">
              {settings.currentMood === 'stressed' ? 'مخنوق 😤' : settings.currentMood === 'happy' ? 'مبسوط 😄' : 'عادي 😐'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => handleMoodClick('stressed')}
              className={`flex flex-col items-center justify-center py-1.5 rounded-md text-[11px] transition-all ${
                settings.currentMood === 'stressed'
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-700/60 font-bold shadow'
                  : 'text-slate-400 hover:text-rose-300 hover:bg-slate-800/50'
              }`}
              title="مخنوق أو مضغوط"
            >
              <Frown className="w-4 h-4 mb-0.5" />
              <span>مخنوق</span>
            </button>

            <button
              onClick={() => handleMoodClick('neutral')}
              className={`flex flex-col items-center justify-center py-1.5 rounded-md text-[11px] transition-all ${
                settings.currentMood === 'neutral'
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-700/50 font-bold shadow'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/50'
              }`}
              title="يوم عادي ومتوازن"
            >
              <Meh className="w-4 h-4 mb-0.5" />
              <span>عادي</span>
            </button>

            <button
              onClick={() => handleMoodClick('happy')}
              className={`flex flex-col items-center justify-center py-1.5 rounded-md text-[11px] transition-all ${
                settings.currentMood === 'happy'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-bold shadow'
                  : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800/50'
              }`}
              title="مبسوط وطاقة عالية"
            >
              <Smile className="w-4 h-4 mb-0.5" />
              <span>مبسوط</span>
            </button>
          </div>
        </div>

        {/* 🔥 The Signature "أنا مخنوق" Rescue Button */}
        <button
          onClick={() => {
            soundManager.playClick(settings.soundEffects);
            onTriggerRescue();
          }}
          id="btn-sidebar-rescue"
          className="w-full relative group overflow-hidden rounded-xl p-[1px] focus:outline-none transition-transform active:scale-95"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 rounded-xl animate-gradient-x opacity-90 group-hover:opacity-100 transition-opacity"></span>
          <div className="relative px-3 py-2.5 rounded-[11px] bg-slate-950/90 flex items-center justify-center gap-2 group-hover:bg-slate-900/80 transition-colors">
            <Flame className="w-4 h-4 text-rose-400 animate-bounce" />
            <span className="font-bold text-xs text-rose-200 tracking-wide">
              أنا مخنوق! 😤
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
};
