import React from 'react';
import { 
  CheckSquare, 
  Wallet, 
  FolderKanban, 
  Target, 
  Flame, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Calendar,
  Sparkles,
  ExternalLink,
  Copy,
  Plus,
  TrendingUp,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import { Task, FinanceRecord, FileBookmark, Goal, AppSettings, ActiveTab } from '../types';
import { soundManager } from '../utils/audio';

interface Props {
  tasks: Task[];
  finance: FinanceRecord[];
  files: FileBookmark[];
  goals: Goal[];
  settings: AppSettings;
  onSelectTab: (tab: ActiveTab) => void;
  onToggleTask: (taskId: string) => void;
  onTriggerRescue: () => void;
  onQuickAddTask: (title: string) => void;
}

export const DashboardView: React.FC<Props> = ({
  tasks,
  finance,
  files,
  goals,
  settings,
  onSelectTab,
  onToggleTask,
  onTriggerRescue,
  onQuickAddTask
}) => {
  const [quickTaskInput, setQuickTaskInput] = React.useState('');
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Time-based Arabic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير والإنتاجية ☀️';
    if (hour < 18) return 'مساء النشاط والتركيز 🌤️';
    return 'مساء الهدوء والإنجاز 🌙';
  };

  // Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingTasks = tasks.filter(t => !t.completed);
  const todayTasks = tasks.filter(t => t.dueDate === todayStr || !t.dueDate);
  const completedToday = tasks.filter(t => t.completed && t.completedAt?.startsWith(todayStr)).length;

  const totalIncome = finance.filter(f => f.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = finance.filter(f => f.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const pinnedFiles = files.filter(f => f.isPinned).slice(0, 4);
  const topGoals = goals.slice(0, 3);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskInput.trim()) return;
    soundManager.playClick(settings.soundEffects);
    onQuickAddTask(quickTaskInput.trim());
    setQuickTaskInput('');
  };

  const copyPath = (path: string, id: string) => {
    soundManager.playClick(settings.soundEffects);
    navigator.clipboard.writeText(path);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="dashboard-view" className="space-y-5 p-6 max-w-7xl mx-auto overflow-y-auto custom-scrollbar">
      {/* Top Banner: Greeting & Mood Response */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-850 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100">{getGreeting()}، {settings.userName}</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium">
              نظام محلي 100%
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {settings.currentMood === 'stressed'
              ? 'ملاحظ إنك اخترت وضع (مخنوق) 😤 — متضغطش على نفسك، خد الأمور خطوة بخطوة واستخدم زر الطوارئ.'
              : settings.currentMood === 'happy'
              ? 'طاقتك عالية اليوم ما شاء الله! 🚀 استغل الحماس وحقق تقدم كبير في أهدافك.'
              : 'يومك منظم ومتوازن. ركز على أولوياتك وأنجز مهام اليوم بهدوء.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={() => {
              soundManager.playClick(settings.soundEffects);
              onTriggerRescue();
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-950/40 transition-transform active:scale-95"
          >
            <Flame className="w-4 h-4 text-rose-200 animate-bounce" />
            <span>محطة الترويق (أنا مخنوق) 😤</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Cards (4 stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: Tasks */}
        <div 
          onClick={() => onSelectTab('tasks')}
          className="bg-slate-900/80 hover:bg-slate-850/90 border border-slate-800 rounded-xl p-4 cursor-pointer transition-all hover:border-amber-500/40 group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">مهامي المعلقة</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">{pendingTasks.length}</span>
            <span className="text-[11px] text-emerald-400">({completedToday} مكتملة اليوم)</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400 flex items-center gap-1">
            <span>انقر لإدارة وتتبع المهام</span>
            <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-amber-400" />
          </div>
        </div>

        {/* Metric 2: Finance Balance */}
        <div 
          onClick={() => onSelectTab('finance')}
          className="bg-slate-900/80 hover:bg-slate-850/90 border border-slate-800 rounded-xl p-4 cursor-pointer transition-all hover:border-emerald-500/40 group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">الرصيد المالي الحالي</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-slate-100">{balance.toLocaleString()}</span>
            <span className="text-xs text-slate-400">{settings.currency}</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400 flex items-center justify-between">
            <span className="text-emerald-400">+{totalIncome.toLocaleString()} دخل</span>
            <span className="text-rose-400">-{totalExpense.toLocaleString()} مصروف</span>
          </div>
        </div>

        {/* Metric 3: Goals */}
        <div 
          onClick={() => onSelectTab('goals')}
          className="bg-slate-900/80 hover:bg-slate-850/90 border border-slate-800 rounded-xl p-4 cursor-pointer transition-all hover:border-sky-500/40 group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">الأهداف الكبرى</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">{goals.length}</span>
            <span className="text-[11px] text-sky-400">أهداف قيد التقدم</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400 flex items-center gap-1">
            <span>مقسمة لخطوات عملية صغيرة</span>
            <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-sky-400" />
          </div>
        </div>

        {/* Metric 4: Offline Security & Files */}
        <div 
          onClick={() => onSelectTab('files')}
          className="bg-slate-900/80 hover:bg-slate-850/90 border border-slate-800 rounded-xl p-4 cursor-pointer transition-all hover:border-violet-500/40 group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">روابط الملفات والمجلدات</span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/15 text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">{files.length}</span>
            <span className="text-[11px] text-violet-400">مسار محفوظ</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400 flex items-center gap-1">
            <span>وصول فوري لمسارات ويندوز</span>
            <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-violet-400" />
          </div>
        </div>
      </div>

      {/* Fast Action Quick Task Input */}
      <form onSubmit={handleQuickAdd} className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-2 rounded-xl">
        <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={quickTaskInput}
          onChange={(e) => setQuickTaskInput(e.target.value)}
          placeholder="إضافة سريعة لمهمة جديدة والضغط على Enter..."
          className="bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none flex-1 px-1"
        />
        <button
          type="submit"
          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>إضافة للمهام</span>
        </button>
      </form>

      {/* Main Content Grid: Left (Today's Tasks) & Right (Files & Goals preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Today's Tasks */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-slate-200">أولويات اليوم والمهام المجدولة</h3>
            </div>
            <button
              onClick={() => onSelectTab('tasks')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>عرض كل المهام ({tasks.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2.5">
            {todayTasks.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2 opacity-60" />
                <span>مفيش أي مهام متأخرة لليوم! أنت منظم جداً.</span>
              </div>
            ) : (
              todayTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className={`flex items-start justify-between gap-3 p-3 rounded-xl border transition-all ${
                    task.completed
                      ? 'bg-slate-950/40 border-slate-850 opacity-60'
                      : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors flex-shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <h4 className={`text-xs font-semibold truncate ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                        {task.dueTime && (
                          <span className="flex items-center gap-1 text-amber-300/90 font-mono">
                            <Clock className="w-3 h-3" />
                            {task.dueTime}
                          </span>
                        )}
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          task.priority === 'urgent' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                          task.priority === 'high' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {task.priority === 'urgent' ? 'عاجل جداً' : task.priority === 'high' ? 'أولوية عالية' : 'عادي'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Files & Top Goals */}
        <div className="space-y-5">
          {/* Quick Files */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-violet-400" />
                <h3 className="font-bold text-sm text-slate-200">الملفات والمجلدات المثبتة</h3>
              </div>
              <button
                onClick={() => onSelectTab('files')}
                className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
              >
                <span>المزيد</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 space-y-2">
              {pinnedFiles.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">لا توجد ملفات مثبتة بعد</p>
              ) : (
                pinnedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700"
                  >
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-slate-200 truncate">{file.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">{file.pathOrUrl}</p>
                    </div>

                    <button
                      onClick={() => copyPath(file.pathOrUrl, file.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 flex-shrink-0"
                      title="نسخ المسار لويندوز"
                    >
                      {copiedId === file.id ? (
                        <span className="text-emerald-400 font-bold">تم النسخ!</span>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>نسخ المسار</span>
                        </>
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Goals Progress */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-sky-400" />
                <h3 className="font-bold text-sm text-slate-200">تقدم الأهداف</h3>
              </div>
              <button
                onClick={() => onSelectTab('goals')}
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                <span>كل الأهداف</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 space-y-3">
              {topGoals.map((goal) => {
                const totalM = goal.milestones.length;
                const completedM = goal.milestones.filter(m => m.completed).length;
                const percent = totalM > 0 ? Math.round((completedM / totalM) * 100) : 0;

                return (
                  <div key={goal.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 truncate max-w-[200px]">{goal.title}</span>
                      <span className="font-mono text-sky-400 font-bold">{percent}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%`, backgroundColor: goal.color || '#0284c7' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
