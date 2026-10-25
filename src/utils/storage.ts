import { Task, FinanceRecord, FileBookmark, VaultItem, Goal, MoodLog, AppSettings, RescueActivity } from '../types';

export interface MeftahDatabase {
  version: string;
  exportedAt?: string;
  tasks: Task[];
  finance: FinanceRecord[];
  files: FileBookmark[];
  vault: VaultItem[];
  goals: Goal[];
  moodLogs: MoodLog[];
  settings: AppSettings;
}

const STORAGE_KEY = 'MEFTAH_SMART_OFFLINE_DB_V1';

const INITIAL_SETTINGS: AppSettings = {
  userName: 'صديقي',
  currency: 'ج.م',
  vaultPinHash: btoa('1234'), // Default PIN 1234
  vaultSecurityQuestion: 'ما هو اسم أول مدرسة أو كتاب مفضل؟',
  vaultSecurityAnswer: 'المستقبل',
  soundEffects: true,
  ambientSound: false,
  currentMood: 'neutral',
  autoBackupNoticeDays: 7,
  lastBackupDate: new Date().toISOString().split('T')[0],
  theme: 'windows-dark'
};

const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'مراجعة خطة العمل الأسبوعية',
    description: 'ترتيب الأولويات وتحديد أهم 3 مهام لهذا الأسبوع',
    priority: 'high',
    category: 'work',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '11:00',
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    estimatedMinutes: 25,
    pomodorosCompleted: 1
  },
  {
    id: 't-2',
    title: 'شرب 2 لتر مياه على مدار اليوم 💧',
    description: 'توزيع شرب المياه كل ساعتين للحفاظ على التركيز والصحة',
    priority: 'medium',
    category: 'health',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '18:00',
    completed: true,
    completedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    estimatedMinutes: 5,
    pomodorosCompleted: 0
  },
  {
    id: 't-3',
    title: 'دفع فاتورة الإنترنت المنزلي',
    description: 'سداد الفاتورة الشهرية قبل موعد الاستحقاق',
    priority: 'urgent',
    category: 'finance',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '15:00',
    completed: false,
    createdAt: new Date().toISOString(),
    estimatedMinutes: 10,
    pomodorosCompleted: 0
  },
  {
    id: 't-4',
    title: 'قراءة 10 صفحات من كتاب التنمية الذاتية',
    description: 'فصل رقم 4: قوة العادات اليومية وتأثيرها التراكمي',
    priority: 'low',
    category: 'study',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    dueTime: '21:00',
    completed: false,
    createdAt: new Date().toISOString(),
    estimatedMinutes: 30,
    pomodorosCompleted: 0
  }
];

const INITIAL_FINANCE: FinanceRecord[] = [
  {
    id: 'f-1',
    type: 'income',
    amount: 15000,
    category: 'راتب شهري',
    note: 'راتب الوظيفة الأساسي',
    date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
    paymentMethod: 'bank'
  },
  {
    id: 'f-2',
    type: 'expense',
    amount: 850,
    category: 'سوبرماركت وطلبات',
    note: 'مشتريات البقالة والخضار الأسبوعية',
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    paymentMethod: 'card'
  },
  {
    id: 'f-3',
    type: 'expense',
    amount: 320,
    category: 'فواتير واشتراكات',
    note: 'اشتراك الإنترنت والكهرباء',
    date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
    paymentMethod: 'wallet'
  },
  {
    id: 'f-4',
    type: 'income',
    amount: 2800,
    category: 'عمل حر / Freelance',
    note: 'مشروع تصميم وتطوير موقع محلي',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'wallet'
  }
];

const INITIAL_FILES: FileBookmark[] = [
  {
    id: 'file-1',
    title: 'مجلد مشاريع العمل الرئيسية',
    pathOrUrl: 'D:\\Work\\Projects_2026',
    type: 'folder',
    category: 'العمل',
    description: 'يحتوي على كافة ملفات ومخططات المشاريع البرمجية والتصاميم الحالية',
    tags: ['برمجة', 'شغل', 'مشاريع'],
    isPinned: true,
    lastOpened: new Date().toISOString()
  },
  {
    id: 'file-2',
    title: 'ملف الميزانية والمصروفات السنوي Excel',
    pathOrUrl: 'C:\\Users\\Desktop\\Finance_2026.xlsx',
    type: 'file',
    category: 'الماليات',
    description: 'جدول الإكسيل المفصل لحساب الأرباح والضرائب والادخار',
    tags: ['ماليات', 'اكسل', 'حسابات'],
    isPinned: true
  },
  {
    id: 'file-3',
    title: 'مكتبة الكتب والمراجع PDF',
    pathOrUrl: 'D:\\Books\\Self_Development',
    type: 'folder',
    category: 'التعلم',
    description: 'كتب التطوير المهني، إدارة الوقت، ولغات البرمجة',
    tags: ['كتب', 'قراءة', 'تطوير'],
    isPinned: false
  },
  {
    id: 'file-4',
    title: 'محرر الأكواد VS Code',
    pathOrUrl: 'C:\\Users\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe',
    type: 'app',
    category: 'أدوات',
    description: 'برنامج العمل والتطوير اليومي',
    tags: ['أدوات', 'برامج'],
    isPinned: false
  }
];

const INITIAL_VAULT: VaultItem[] = [
  {
    id: 'v-1',
    title: 'ملاحظة سرية: فكرة مشروعي القادم 💡',
    content: 'فكرة تطبيق أتمتة مهام بدون إنترنت يعتمد على خوارزميات الذكاء المحلي لحساب نمط الإنتاجية بدون تسريب أي بيانات سحابية.',
    category: 'ideas',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date().toISOString(),
    isFavorite: true
  },
  {
    id: 'v-2',
    title: 'بيانات الراوتر والشبكة المنزلية',
    content: 'IP الراوتر: 192.168.1.1\nاسم المستخدم: admin\nكلمة مرور الإدارة: RouterSafe#2026!\nمفتاح الـ Wi-Fi الاحتياطي: SecretNetKey99',
    category: 'passwords',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date().toISOString(),
    isFavorite: true
  },
  {
    id: 'v-3',
    title: 'أرقام الحسابات والآيبان البنكي',
    content: 'IBAN: EG450002000100000012345678901\nSwift Code: NBEGEGCX001\nاسم الفرع: الفرع الرئيسي',
    category: 'documents',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    updatedAt: new Date().toISOString(),
    isFavorite: false
  }
];

const INITIAL_GOALS: Goal[] = [
  {
    id: 'g-1',
    title: 'إتقان بناء البرمجيات بدون إنترنت وإطلاق أول تطبيق EXE',
    description: 'الهدف هو تصميم وبرمجة وتصدير تطبيق سطح مكتب متكامل يعمل بكفاءة وسرعة دون اعتماد على السحابة.',
    category: 'learning',
    targetDate: new Date(Date.now() + 86400000 * 60).toISOString().split('T')[0],
    color: '#0284c7',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    milestones: [
      { id: 'm-1', title: 'تحديد كافة متطلبات النظام والـ UI/UX', completed: true },
      { id: 'm-2', title: 'بناء قاعدة البيانات المحلية ونظام الـ Backup التلقائي', completed: true },
      { id: 'm-3', title: 'برمجة محرك تفريغ التوتر وألعاب الاسترخاء', completed: true },
      { id: 'm-4', title: 'تجهيز ملف الـ Portable EXE والتثبيت', completed: false }
    ]
  },
  {
    id: 'g-2',
    title: 'بناء عادة اللياقة البدنية والتمارين 4 مرات أسبوعياً',
    description: 'الوصول للياقة عالية وزيادة الطاقة اليومية عبر ممارسة تمارين الكارديو والقوة.',
    category: 'health',
    targetDate: new Date(Date.now() + 86400000 * 90).toISOString().split('T')[0],
    color: '#10b981',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    milestones: [
      { id: 'm-21', title: 'الالتزام بالمشي 8,000 خطوة يومياً لمدة أسبوعين', completed: true },
      { id: 'm-22', title: 'تجهيز جدول التمارين المنزلية والأوزان', completed: true },
      { id: 'm-23', title: 'إنهاء 16 جلسة تمرين متتالية دون انقطاع', completed: false }
    ]
  }
];

const INITIAL_MOOD_LOGS: MoodLog[] = [
  { id: 'ml-1', mood: 'happy', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), note: 'إنجاز كبير في العمل وسرعة في إنهاء المهام' },
  { id: 'ml-2', mood: 'neutral', timestamp: new Date(Date.now() - 86400000).toISOString(), note: 'يوم هادئ ومنظم' },
  { id: 'ml-3', mood: 'stressed', timestamp: new Date().toISOString(), note: 'ضغط في مواعيد التسليم وتراكم المهام' }
];

export const RESCUE_MISSIONS: RescueActivity[] = [
  {
    id: 'r-1',
    title: 'جرعة مياه باردة 💧',
    subtitle: 'إعادة شحن سريعة للجسم والدماغ',
    instruction: 'قوم حالاً واشرب كوباية مية كبيرة باردة، واغسل وشك بمية ساقعة وارجع خلال دقيقتين.',
    durationSeconds: 120,
    category: 'physical',
    badge: 'دقيقتين راحة',
    emoji: '🌊'
  },
  {
    id: 'r-2',
    title: 'تمرين التنفس 4-7-8 🫁',
    subtitle: 'تهدئة فورية للجهاز العصبي ونبض القلب',
    instruction: 'اتبع الدائرة التفاعلية: شهيق 4 ثواني، احبس نفسك 7 ثواني، وزفير هادئ في 8 ثواني.',
    durationSeconds: 90,
    category: 'breathing',
    badge: 'تنفس علاجي',
    emoji: '🧘'
  },
  {
    id: 'r-3',
    title: 'شغل لحن أو أغنية بتحبها 🎵',
    subtitle: 'فصل تام عن جو الضغط والتوتر',
    instruction: 'البس السماعات، شغل التراك أو السورة المفضلة ليك، واقفل عينك لمدة 3 دقايق واستمتع باللحن.',
    durationSeconds: 180,
    category: 'mental',
    badge: 'موسيقى وراحة',
    emoji: '🎧'
  },
  {
    id: 'r-4',
    title: 'اكتب 3 حاجات ممتن ليها أو نفسك تحققها ✨',
    subtitle: 'تذكير بالهدف والصورة الكبيرة',
    instruction: 'اكتب في المساحة التفاعلية 3 أشياء إيجابية موجودة في حياتك حالياً مهما كانت صغيرة.',
    durationSeconds: 120,
    category: 'gratitude',
    badge: 'تفريغ وتفاؤل',
    emoji: '📝'
  },
  {
    id: 'r-5',
    title: 'تحدي تفجير الفقاعات ضد التوتر 🫧',
    subtitle: 'لعبة حسية لتفريغ الشحنات السلبية',
    instruction: 'فرقع أكبر عدد ممكن من فقاعات التوتر في الشاشة مع مؤثرات صوتية مرضية جداً!',
    durationSeconds: 60,
    category: 'game',
    badge: 'لعبة تفاعلية',
    emoji: '🎮'
  },
  {
    id: 'r-6',
    title: 'تحدي الدقيقة: افرد ضهرك وحرك رقبتك 🤸‍♂️',
    subtitle: 'فك التشنجات العضلية الناتجة عن الجلوس',
    instruction: 'قف وافرد ضراعيك لفوق لأقصى حد، خد لفة يمين وشمال، ونزل كتافك لتحت 5 مرات.',
    durationSeconds: 60,
    category: 'challenge',
    badge: 'تحدي سريع',
    emoji: '⚡'
  },
  {
    id: 'r-7',
    title: 'محرقة الأفكار السلبية 🔥',
    subtitle: 'اكتب اللي مضايقك واحرقها بضغطة زر!',
    instruction: 'اكتب كل الكلام والغيظ اللي جواك هنا بكل حرية، واضغط "احرق الكلام" عشان يختفي تماماً كأنه لم يكن.',
    durationSeconds: 90,
    category: 'mental',
    badge: 'تفريغ نفسي',
    emoji: '🔥'
  }
];

export function loadDatabase(): MeftahDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initialDb: MeftahDatabase = {
        version: '1.0.0',
        tasks: INITIAL_TASKS,
        finance: INITIAL_FINANCE,
        files: INITIAL_FILES,
        vault: INITIAL_VAULT,
        goals: INITIAL_GOALS,
        moodLogs: INITIAL_MOOD_LOGS,
        settings: INITIAL_SETTINGS
      };
      saveDatabase(initialDb);
      return initialDb;
    }
    const parsed = JSON.parse(raw) as MeftahDatabase;
    return {
      ...parsed,
      tasks: parsed.tasks || INITIAL_TASKS,
      finance: parsed.finance || INITIAL_FINANCE,
      files: parsed.files || INITIAL_FILES,
      vault: parsed.vault || INITIAL_VAULT,
      goals: parsed.goals || INITIAL_GOALS,
      moodLogs: parsed.moodLogs || INITIAL_MOOD_LOGS,
      settings: { ...INITIAL_SETTINGS, ...(parsed.settings || {}) }
    };
  } catch (err) {
    console.error('Error loading local DB, initializing default state', err);
    return {
      version: '1.0.0',
      tasks: INITIAL_TASKS,
      finance: INITIAL_FINANCE,
      files: INITIAL_FILES,
      vault: INITIAL_VAULT,
      goals: INITIAL_GOALS,
      moodLogs: INITIAL_MOOD_LOGS,
      settings: INITIAL_SETTINGS
    };
  }
}

export function saveDatabase(db: MeftahDatabase): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    return true;
  } catch (err) {
    console.error('Failed to save to localStorage', err);
    return false;
  }
}

export function exportBackupFile(db: MeftahDatabase): void {
  const exportData: MeftahDatabase = {
    ...db,
    exportedAt: new Date().toISOString()
  };
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `Meftah_Backup_${dateStr}.meftah.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function getDatabaseMetrics(db: MeftahDatabase) {
  const raw = JSON.stringify(db);
  const bytes = new Blob([raw]).size;
  const kb = (bytes / 1024).toFixed(2);
  const totalTasks = db.tasks.length;
  const completedTasks = db.tasks.filter(t => t.completed).length;
  const totalFinance = db.finance.length;
  const totalVault = db.vault.length;
  const totalFiles = db.files.length;
  const totalGoals = db.goals.length;

  return {
    bytes,
    sizeKb: kb,
    totalTasks,
    completedTasks,
    totalFinance,
    totalVault,
    totalFiles,
    totalGoals
  };
}
