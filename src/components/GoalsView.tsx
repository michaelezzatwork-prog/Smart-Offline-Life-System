import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Calendar, 
  Sparkles, 
  Trophy, 
  Flag, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Goal, Milestone, AppSettings } from '../types';
import { soundManager } from '../utils/audio';

interface Props {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  onUpdateGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
  settings: AppSettings;
}

const COLOR_PRESETS = [
  '#0284c7', // Sky Blue
  '#10b981', // Emerald Green
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f43f5e'  // Rose
];

export const GoalsView: React.FC<Props> = ({
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  settings
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'career' | 'health' | 'learning' | 'finance' | 'spiritual' | 'life'>('learning');
  const [targetDate, setTargetDate] = useState(new Date(Date.now() + 86400000 * 60).toISOString().split('T')[0]);
  const [color, setColor] = useState(COLOR_PRESETS[0]);
  const [milestonesList, setMilestonesList] = useState<string[]>(['', '', '']);

  // New milestone quick add
  const [newMilestoneText, setNewMilestoneText] = useState<{ [goalId: string]: string }>({});

  const handleOpenAddModal = () => {
    soundManager.playClick(settings.soundEffects);
    setTitle('');
    setDescription('');
    setCategory('learning');
    setTargetDate(new Date(Date.now() + 86400000 * 60).toISOString().split('T')[0]);
    setColor(COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)]);
    setMilestonesList(['الخطوة الأولى: تحديد الخطة', 'الخطوة الثانية: البدء في التطبيق', 'الخطوة الثالثة: الإطلاق والتقييم']);
    setIsModalOpen(true);
  };

  const handleMilestoneChange = (idx: number, val: string) => {
    const next = [...milestonesList];
    next[idx] = val;
    setMilestonesList(next);
  };

  const addMilestoneField = () => {
    setMilestonesList(prev => [...prev, '']);
  };

  const removeMilestoneField = (idx: number) => {
    if (milestonesList.length <= 1) return;
    setMilestonesList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    soundManager.playSuccess(settings.soundEffects);
    const validMilestones: Milestone[] = milestonesList
      .filter(m => m.trim())
      .map((m, idx) => ({
        id: `m-${Date.now()}-${idx}`,
        title: m.trim(),
        completed: false
      }));

    onAddGoal({
      title: title.trim(),
      description: description.trim(),
      category,
      targetDate,
      color,
      milestones: validMilestones
    });

    setIsModalOpen(false);
  };

  const toggleMilestone = (goal: Goal, milestoneId: string) => {
    soundManager.playClick(settings.soundEffects);
    const updatedMilestones = goal.milestones.map(m => {
      if (m.id === milestoneId) {
        return { ...m, completed: !m.completed };
      }
      return m;
    });

    const isAllCompleted = updatedMilestones.length > 0 && updatedMilestones.every(m => m.completed);
    if (isAllCompleted) {
      soundManager.playSuccess(settings.soundEffects);
      try {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      } catch {}
    }

    onUpdateGoal({
      ...goal,
      milestones: updatedMilestones
    });
  };

  const handleAddMilestoneToGoal = (goal: Goal) => {
    const text = (newMilestoneText[goal.id] || '').trim();
    if (!text) return;

    soundManager.playClick(settings.soundEffects);
    const newM: Milestone = {
      id: `m-${Date.now()}`,
      title: text,
      completed: false
    };

    onUpdateGoal({
      ...goal,
      milestones: [...goal.milestones, newM]
    });

    setNewMilestoneText(prev => ({ ...prev, [goal.id]: '' }));
  };

  const handleDeleteMilestoneFromGoal = (goal: Goal, mId: string) => {
    soundManager.playClick(settings.soundEffects);
    onUpdateGoal({
      ...goal,
      milestones: goal.milestones.filter(m => m.id !== mId)
    });
  };

  const getCategoryLabel = (cat: Goal['category']) => {
    switch (cat) {
      case 'career': return '💼 مسار مهني وعمل';
      case 'learning': return '📚 تعلم واكتساب مهارة';
      case 'health': return '🏃‍♂️ صحة ولياقة بدنية';
      case 'finance': return '💰 مالي وادخار';
      case 'spiritual': return '✨ روحي وتطوير ذات';
      case 'life': return '🌱 مشروع شخصي وحياة';
    }
  };

  return (
    <div id="goals-view" className="p-6 max-w-7xl mx-auto space-y-6 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-sky-400" />
            <span>أهدافي الكبرى وخطوات الإنجاز</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            قسّم طموحاتك الكبيرة لخطوات بسيطة قابلة للتحقيق وتتبع نسبة إنجازك
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-sky-950/40 transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة هدف جديد</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {goals.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
            <Target className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <h4 className="text-sm font-bold text-slate-300">لا توجد أهداف مضافة حتى الآن</h4>
            <p className="text-xs text-slate-500 mt-1">ابدأ بتحديد أول هدف كبير ترغب في تحقيقه هذا العام</p>
          </div>
        ) : (
          goals.map((goal) => {
            const totalM = goal.milestones.length;
            const completedM = goal.milestones.filter(m => m.completed).length;
            const percent = totalM > 0 ? Math.round((completedM / totalM) * 100) : 0;
            const isCompleted = totalM > 0 && percent === 100;

            return (
              <div
                key={goal.id}
                className="bg-slate-900/85 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-md relative overflow-hidden"
              >
                {/* Accent Top Border */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: goal.color || '#0284c7' }}
                />

                <div>
                  {/* Top Badges & Delete */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300 font-medium">
                        {getCategoryLabel(goal.category)}
                      </span>
                      {isCompleted && (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-emerald-400" />
                          تم الإنجاز بنجاح! 🎉
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        soundManager.playClick(settings.soundEffects);
                        onDeleteGoal(goal.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-rose-950 text-slate-500 hover:text-rose-400"
                      title="حذف الهدف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-100 mt-2">{goal.title}</h3>
                  {goal.description && (
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{goal.description}</p>
                  )}

                  {/* Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">نسبة التقدم الكلية:</span>
                      <span className="font-mono font-bold" style={{ color: goal.color || '#0284c7' }}>
                        {percent}% ({completedM}/{totalM} خطوة)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%`, backgroundColor: goal.color || '#0284c7' }}
                      />
                    </div>
                  </div>

                  {/* Milestones Checklist */}
                  <div className="mt-4 space-y-2">
                    <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>خطوات الإنجاز (المحطات):</span>
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {goal.milestones.map((m) => (
                        <div
                          key={m.id}
                          className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                            m.completed
                              ? 'bg-slate-950/40 border border-slate-850 opacity-70'
                              : 'bg-slate-950/80 border border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <button
                            onClick={() => toggleMilestone(goal, m.id)}
                            className="flex items-center gap-2 text-right flex-1 min-w-0"
                          >
                            {m.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                            )}
                            <span className={`truncate ${m.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                              {m.title}
                            </span>
                          </button>

                          <button
                            onClick={() => handleDeleteMilestoneFromGoal(goal, m.id)}
                            className="p-1 text-slate-600 hover:text-rose-400"
                            title="حذف الخطوة"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Quick Add Step Input */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <input
                        type="text"
                        value={newMilestoneText[goal.id] || ''}
                        onChange={(e) => setNewMilestoneText({ ...newMilestoneText, [goal.id]: e.target.value })}
                        placeholder="+ إضافة خطوة عملية جديدة..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddMilestoneToGoal(goal);
                          }
                        }}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none flex-1"
                      />
                      <button
                        onClick={() => handleAddMilestoneToGoal(goal)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold"
                      >
                        إضافة
                      </button>
                    </div>
                  </div>
                </div>

                {/* Target Date Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>تاريخ الإنجاز المستهدف: {goal.targetDate}</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Target className="w-4 h-4 text-sky-400" />
                <span>إضافة هدف كبير وتقسيمه لخطوات</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitGoal} className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">الهدف الرئيسي *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: إتقان اللغة الإنجليزية للمحادثة، أو ادخار 50 ألف"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">لماذا هذا الهدف مهم؟ (الوصف)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اكتب دوافعك والنتيجة التي تطمح للوصول إليها..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">المجال</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="learning">📚 تعلم وتطوير مهارة</option>
                    <option value="career">💼 مسار مهني وعمل</option>
                    <option value="health">🏃‍♂️ صحة ولياقة</option>
                    <option value="finance">💰 مالي وادخار</option>
                    <option value="spiritual">✨ تطوير ذات وروحي</option>
                    <option value="life">🌱 شخصي وحياة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">الموعد النهائي المستهدف</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Color Preset Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">لون التمييز</label>
                <div className="flex items-center gap-2">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        color === c ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Milestones Builder */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200">تقسيم الهدف لخطوات صغيرة:</label>
                  <button
                    type="button"
                    onClick={addMilestoneField}
                    className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>خطوة إضافية</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {milestonesList.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={m}
                        onChange={(e) => handleMilestoneChange(idx, e.target.value)}
                        placeholder={`الخطوة رقم ${idx + 1}...`}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                      />
                      {milestonesList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMilestoneField(idx)}
                          className="p-1.5 text-slate-500 hover:text-rose-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>إنشاء الهدف ومحطاته</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
