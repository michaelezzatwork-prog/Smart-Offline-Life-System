import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Tag,
  AlertCircle,
  X,
  Flame,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, AppSettings } from '../types';
import { soundManager } from '../utils/audio';

interface Props {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'pomodorosCompleted'>) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (task: Task) => void;
  settings: AppSettings;
}

export const TasksView: React.FC<Props> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
  settings
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [category, setCategory] = useState<'work' | 'study' | 'personal' | 'health' | 'finance' | 'other'>('work');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('12:00');
  const [estimatedMinutes, setEstimatedMinutes] = useState(25);

  // Pomodoro Focus Timer State
  const [pomoMinutes, setPomoMinutes] = useState(25);
  const [pomoSeconds, setPomoSeconds] = useState(0);
  const [isPomoRunning, setIsPomoRunning] = useState(false);
  const [pomoMode, setPomoMode] = useState<'focus' | 'break'>('focus');
  const [activeTaskForPomo, setActiveTaskForPomo] = useState<Task | null>(null);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);

  // Pomodoro Timer Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPomoRunning) {
      timer = setInterval(() => {
        if (pomoSeconds > 0) {
          setPomoSeconds(prev => prev - 1);
        } else if (pomoMinutes > 0) {
          setPomoMinutes(prev => prev - 1);
          setPomoSeconds(59);
        } else {
          // Timer finished
          setIsPomoRunning(false);
          soundManager.playSuccess(settings.soundEffects);
          try {
            confetti({ particleCount: 80, spread: 70 });
          } catch {}
          
          if (pomoMode === 'focus') {
            setPomoMode('break');
            setPomoMinutes(5);
            setPomoSeconds(0);
            if (activeTaskForPomo) {
              onUpdateTask({
                ...activeTaskForPomo,
                pomodorosCompleted: (activeTaskForPomo.pomodorosCompleted || 0) + 1
              });
            }
          } else {
            setPomoMode('focus');
            setPomoMinutes(25);
            setPomoSeconds(0);
          }
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPomoRunning, pomoMinutes, pomoSeconds, pomoMode, activeTaskForPomo, settings, onUpdateTask]);

  const togglePomoAmbient = () => {
    const next = !isAmbientPlaying;
    setIsAmbientPlaying(next);
    soundManager.toggleAmbient(next);
  };

  const handleOpenAddModal = (taskToEdit?: Task) => {
    soundManager.playClick(settings.soundEffects);
    if (taskToEdit) {
      setEditingTask(taskToEdit);
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority);
      setCategory(taskToEdit.category);
      setDueDate(taskToEdit.dueDate || new Date().toISOString().split('T')[0]);
      setDueTime(taskToEdit.dueTime || '12:00');
      setEstimatedMinutes(taskToEdit.estimatedMinutes || 25);
    } else {
      setEditingTask(null);
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('work');
      setDueDate(new Date().toISOString().split('T')[0]);
      setDueTime('12:00');
      setEstimatedMinutes(25);
    }
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    soundManager.playSuccess(settings.soundEffects);

    if (editingTask) {
      onUpdateTask({
        ...editingTask,
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        dueDate,
        dueTime,
        estimatedMinutes
      });
    } else {
      onAddTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        dueDate,
        dueTime,
        estimatedMinutes
      });
    }

    setIsAddModalOpen(false);
  };

  // Filter Tasks
  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'pending' && task.completed) return false;
    if (filterStatus === 'completed' && !task.completed) return false;
    if (filterCategory !== 'all' && task.category !== filterCategory) return false;
    return true;
  });

  const categories = [
    { id: 'all', label: 'الكل' },
    { id: 'work', label: 'العمل' },
    { id: 'study', label: 'الدراسة' },
    { id: 'personal', label: 'شخصي' },
    { id: 'health', label: 'الصحة' },
    { id: 'finance', label: 'الماليات' },
    { id: 'other', label: 'أخرى' }
  ];

  return (
    <div id="tasks-view" className="p-6 max-w-7xl mx-auto space-y-6 overflow-y-auto custom-scrollbar">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-amber-400" />
            <span>مهامي اليومية وجلسات التركيز</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            نظم مهامك وحدد أوقاتها مع مؤقت بومودورو للتركيز العميق
          </p>
        </div>

        <button
          onClick={() => handleOpenAddModal()}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مهمة جديدة</span>
        </button>
      </div>

      {/* Pomodoro Focus Station Widget */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/40 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-200">
                {pomoMode === 'focus' ? '🎯 جلسة تركيز عميق (Pomodoro)' : '☕ وقت استراحة قصيرة'}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                {pomoMode === 'focus' ? '25 دقيقة عمل' : '5 دقائق راحة'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeTaskForPomo ? `المهمة الحالية: ${activeTaskForPomo.title}` : 'اختر مهمة للتركيز عليها، أو ابدأ المؤقت مباشرة'}
            </p>
          </div>
        </div>

        {/* Timer Display & Controls */}
        <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl">
          <div className="text-2xl font-mono font-bold text-amber-400 tracking-wider">
            {pomoMinutes.toString().padStart(2, '0')}:{pomoSeconds.toString().padStart(2, '0')}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playClick(settings.soundEffects);
                setIsPomoRunning(!isPomoRunning);
              }}
              className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 ${
                isPomoRunning ? 'bg-amber-600 text-white' : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              {isPomoRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => {
                soundManager.playClick(settings.soundEffects);
                setIsPomoRunning(false);
                setPomoMinutes(pomoMode === 'focus' ? 25 : 5);
                setPomoSeconds(0);
              }}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200"
              title="إعادة ضبط"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={togglePomoAmbient}
              className={`p-2 rounded-lg text-xs transition-colors ${
                isAmbientPlaying ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="مؤثر صوت المطر والتركيز"
            >
              {isAmbientPlaying ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/70 border border-slate-800 p-3 rounded-xl">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              filterStatus === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            الكل ({tasks.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              filterStatus === 'pending' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            قيد التنفيذ ({tasks.filter(t => !t.completed).length})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              filterStatus === 'completed' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            المكتملة ({tasks.filter(t => t.completed).length})
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar w-full sm:w-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs transition-colors whitespace-nowrap ${
                filterCategory === cat.id
                  ? 'bg-slate-800 text-amber-300 font-bold border border-amber-500/30'
                  : 'text-slate-400 hover:bg-slate-800/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
            <CheckSquare className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <h4 className="text-sm font-bold text-slate-300">لا توجد مهام تطابق هذا الفلتر</h4>
            <p className="text-xs text-slate-500 mt-1">أضف مهمة جديدة وابدأ في إنجازها</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                task.completed
                  ? 'bg-slate-950/40 border-slate-850 opacity-60'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  onClick={() => {
                    onToggleTask(task.id);
                    if (!task.completed) {
                      soundManager.playSuccess(settings.soundEffects);
                      try {
                        confetti({ particleCount: 40, spread: 50 });
                      } catch {}
                    }
                  }}
                  className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors flex-shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-semibold truncate ${task.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                      {task.title}
                    </h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      task.priority === 'urgent' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                      task.priority === 'high' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      task.priority === 'medium' ? 'bg-sky-950 text-sky-300 border border-sky-800' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {task.priority === 'urgent' ? 'عاجل جداً' : task.priority === 'high' ? 'عالية' : task.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{task.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-400">
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{task.dueDate}</span>
                      </span>
                    )}
                    {task.dueTime && (
                      <span className="flex items-center gap-1 font-mono text-amber-400/80">
                        <Clock className="w-3 h-3" />
                        <span>{task.dueTime}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded text-[10px]">
                      <Tag className="w-2.5 h-2.5 text-slate-400" />
                      <span>{categories.find(c => c.id === task.category)?.label || task.category}</span>
                    </span>
                    {(task.pomodorosCompleted || 0) > 0 && (
                      <span className="flex items-center gap-1 text-amber-400 font-mono text-[10px]">
                        🍅 {task.pomodorosCompleted} جلسات تركيز
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Task Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => {
                    soundManager.playClick(settings.soundEffects);
                    setActiveTaskForPomo(task);
                    setPomoMode('focus');
                    setPomoMinutes(task.estimatedMinutes || 25);
                    setPomoSeconds(0);
                    setIsPomoRunning(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs flex items-center gap-1"
                  title="بدء جلسة تركيز لهذه المهمة"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>تركيز بومودورو</span>
                </button>

                <button
                  onClick={() => handleOpenAddModal(task)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  title="تعديل"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    soundManager.playClick(settings.soundEffects);
                    onDeleteTask(task.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-rose-950/80 text-slate-400 hover:text-rose-400"
                  title="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-amber-400" />
                <span>{editingTask ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">عنوان المهمة *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: تسليم تقرير العمل الأسبوعي"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">الوصف والملاحظات (اختياري)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="تفاصيل إضافية أو روابط تخص المهمة..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">درجة الأهمية</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="low">منخفضة</option>
                    <option value="medium">متوسطة</option>
                    <option value="high">عالية</option>
                    <option value="urgent">عاجل جداً 🔥</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">التصنيف</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="work">العمل</option>
                    <option value="study">الدراسة</option>
                    <option value="personal">شخصي</option>
                    <option value="health">الصحة</option>
                    <option value="finance">الماليات</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">تاريخ الاستحقاق</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">الوقت المحدد</label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">الوقت المقدر (دقيقة)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingTask ? 'حفظ التعديلات' : 'إضافة المهمة'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
