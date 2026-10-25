import React from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  TrendingUp, 
  Smile, 
  Frown, 
  Meh, 
  Award, 
  Flame, 
  Calendar,
  Zap,
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { Task, FinanceRecord, Goal, MoodLog, AppSettings } from '../types';

interface Props {
  tasks: Task[];
  finance: FinanceRecord[];
  goals: Goal[];
  moodLogs: MoodLog[];
  settings: AppSettings;
}

export const AnalyticsView: React.FC<Props> = ({
  tasks,
  finance,
  goals,
  moodLogs,
  settings
}) => {
  // Weekly Days Analysis (Last 7 Days)
  const daysOfWeek = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = daysOfWeek[d.getDay()];

    const completedOnDay = tasks.filter(t => t.completed && t.completedAt?.startsWith(dateStr)).length;
    const addedOnDay = tasks.filter(t => t.createdAt?.startsWith(dateStr)).length;

    return {
      day: dayName,
      date: dateStr,
      completed: completedOnDay,
      added: addedOnDay
    };
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Goals completion
  const totalMilestones = goals.reduce((acc, g) => acc + g.milestones.length, 0);
  const completedMilestones = goals.reduce((acc, g) => acc + g.milestones.filter(m => m.completed).length, 0);
  const goalRate = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  // Mood summary
  const stressedCount = moodLogs.filter(m => m.mood === 'stressed').length;
  const neutralCount = moodLogs.filter(m => m.mood === 'neutral').length;
  const happyCount = moodLogs.filter(m => m.mood === 'happy').length;

  // Productivity Score Calculation (0 - 100)
  const productivityScore = Math.min(
    100,
    Math.round(
      (taskCompletionRate * 0.4) +
      (goalRate * 0.4) +
      (completedTasks > 0 ? 20 : 5)
    )
  );

  return (
    <div id="analytics-view" className="p-6 max-w-7xl mx-auto space-y-6 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-400" />
          <span>الإحصائيات ونبض الإنجاز الأسبوعي</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          تعرف على مستوى إنتاجيتك، معدل إكمال المهام، وتطور حالتك المزاجية
        </p>
      </div>

      {/* Top 3 Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Productivity Index */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>مؤشر الإنتاجية العام</span>
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-amber-400">{productivityScore}%</span>
            <span className="text-xs text-emerald-400 font-bold">
              {productivityScore >= 80 ? '🔥 أداء استثنائي' : productivityScore >= 50 ? '⚡ أداء جيد ومستقر' : '🌱 بداية الانطلاق'}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
              style={{ width: `${productivityScore}%` }}
            />
          </div>
        </div>

        {/* Card 2: Tasks Completion Rate */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>نسبة إنجاز المهام</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-emerald-400">{taskCompletionRate}%</span>
            <span className="text-xs text-slate-400">({completedTasks} من {totalTasks} مهمة)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            كل مهمة تكتمل تبعد عنك التشتت والضغط
          </p>
        </div>

        {/* Card 3: Goals Progression */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>المحطات المحققة في الأهداف</span>
            <Zap className="w-5 h-5 text-sky-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-sky-400">{goalRate}%</span>
            <span className="text-xs text-slate-400">({completedMilestones} من {totalMilestones} خطوة)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            الأهداف الكبرى تتحقق بالمثابرة اليومية
          </p>
        </div>
      </div>

      {/* Weekly Activity Bar Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-200">المهام المنجزة خلال آخر 7 أيام</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {last7DaysData.reduce((acc, d) => acc + d.completed, 0)} مهمة منجزة هذا الأسبوع
          </span>
        </div>

        <div className="h-56 w-full pt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7DaysData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
              <Tooltip 
                formatter={(val: number) => [`${val} مهمة`, 'المكتمل']}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#f8fafc' }}
              />
              <Bar dataKey="completed" fill="#f59e0b" radius={[6, 6, 0, 0]}>
                {last7DaysData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.completed > 0 ? '#f59e0b' : '#334155'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mood History & Activity Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Mood Distribution */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
            <Smile className="w-4 h-4 text-emerald-400" />
            <span>توزيع الحالات المزاجية المسجلة</span>
          </h3>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
              <Smile className="w-6 h-6 mx-auto text-emerald-400 mb-1" />
              <span className="text-xs text-slate-400 block">مبسوط</span>
              <span className="text-lg font-mono font-bold text-emerald-400">{happyCount}</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
              <Meh className="w-6 h-6 mx-auto text-amber-400 mb-1" />
              <span className="text-xs text-slate-400 block">عادي</span>
              <span className="text-lg font-mono font-bold text-amber-400">{neutralCount}</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
              <Frown className="w-6 h-6 mx-auto text-rose-400 mb-1" />
              <span className="text-xs text-slate-400 block">مخنوق</span>
              <span className="text-lg font-mono font-bold text-rose-400">{stressedCount}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
            💡 نصيحة ذكية: استخدامك لمحطة الترويق (أنا مخنوق) يقلل من فترات الضغط ويساعدك على استعادة تركيزك سريعاً.
          </p>
        </div>

        {/* Task Category Distribution */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <span>توزيع المهام حسب المجالات</span>
          </h3>

          <div className="space-y-2 pt-1">
            {[
              { label: 'العمل والإنتاج المهني', key: 'work', color: '#0284c7' },
              { label: 'الدراسة والتعلم', key: 'study', color: '#8b5cf6' },
              { label: 'الصحة واللياقة', key: 'health', color: '#10b981' },
              { label: 'الماليات والمصروفات', key: 'finance', color: '#f59e0b' },
              { label: 'شخصي وأخرى', key: 'personal', color: '#ec4899' },
            ].map((cat) => {
              const count = tasks.filter(t => t.category === cat.key).length;
              const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;

              return (
                <div key={cat.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{cat.label}</span>
                    <span className="font-mono text-slate-400">{count} مهمة ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
