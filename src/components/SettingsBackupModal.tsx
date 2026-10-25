import React, { useState, useRef } from 'react';
import { 
  Settings, 
  Download, 
  Upload, 
  HardDrive, 
  ShieldCheck, 
  User, 
  Coins, 
  Volume2, 
  VolumeX, 
  Terminal, 
  Check, 
  X, 
  RotateCcw, 
  Sparkles,
  HelpCircle,
  FileCode,
  Package
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppSettings, MoodMode } from '../types';
import { MeftahDatabase, exportBackupFile, getDatabaseMetrics } from '../utils/storage';
import { soundManager } from '../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  database: MeftahDatabase;
  onRestoreDatabase: (restoredDb: MeftahDatabase) => void;
}

export const SettingsBackupModal: React.FC<Props> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  database,
  onRestoreDatabase
}) => {
  const [userName, setUserName] = useState(settings.userName);
  const [currency, setCurrency] = useState(settings.currency);
  const [soundEffects, setSoundEffects] = useState(settings.soundEffects);
  const [securityQuestion, setSecurityQuestion] = useState(settings.vaultSecurityQuestion || '');
  const [securityAnswer, setSecurityAnswer] = useState(settings.vaultSecurityAnswer || '');
  const [activeTab, setActiveTab] = useState<'backup' | 'profile' | 'exe_guide'>('backup');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const metrics = getDatabaseMetrics(database);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playSuccess(settings.soundEffects);
    onUpdateSettings({
      userName: userName.trim() || 'صديقي',
      currency: currency.trim() || 'ج.م',
      soundEffects,
      vaultSecurityQuestion: securityQuestion.trim(),
      vaultSecurityAnswer: securityAnswer.trim()
    });
    try {
      confetti({ particleCount: 40, spread: 50 });
    } catch {}
    alert('تم حفظ الإعدادات بنجاح!');
  };

  const handleExport = () => {
    soundManager.playSuccess(settings.soundEffects);
    exportBackupFile(database);
    onUpdateSettings({ lastBackupDate: new Date().toISOString().split('T')[0] });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content) as MeftahDatabase;

        if (parsed.tasks && parsed.finance && parsed.goals) {
          onRestoreDatabase(parsed);
          soundManager.playSuccess(settings.soundEffects);
          try {
            confetti({ particleCount: 70, spread: 60 });
          } catch {}
          setImportStatus('✅ تم استرجاع النسخة الاحتياطية بنجاح!');
          setTimeout(() => setImportStatus(null), 4000);
        } else {
          setImportStatus('❌ ملف النسخة الاحتياطية غير صالح أو تالف.');
        }
      } catch {
        setImportStatus('❌ فشل في قراءة ملف JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div 
        id="settings-modal"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col text-slate-100"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">النسخ الاحتياطي وإعدادات نظام "مفتاح"</h3>
              <p className="text-xs text-slate-400">إدارة قاعدة البيانات المحلية وتصدير التطبيق لويندوز</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 py-2 bg-slate-950/50 border-b border-slate-800 text-xs">
          <button
            onClick={() => { soundManager.playClick(settings.soundEffects); setActiveTab('backup'); }}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'backup' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>النسخ والبيانات المحلية</span>
          </button>

          <button
            onClick={() => { soundManager.playClick(settings.soundEffects); setActiveTab('profile'); }}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'profile' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>الملف الشخصي والعملة</span>
          </button>

          <button
            onClick={() => { soundManager.playClick(settings.soundEffects); setActiveTab('exe_guide'); }}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'exe_guide' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>تصدير ملف EXE لويندوز</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
          {/* TAB 1: Backup & Storage */}
          {activeTab === 'backup' && (
            <div className="space-y-5">
              {/* Storage Health Metrics Box */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-slate-200">حالة قاعدة البيانات المحلية (Offline Storage)</h4>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    🟢 آمن ومحفوظ محلياً
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-400 block">حجم التخزين</span>
                    <span className="text-xs font-mono font-bold text-amber-400">{metrics.sizeKb} KB</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-400 block">المهام المسجلة</span>
                    <span className="text-xs font-mono font-bold text-slate-200">{metrics.totalTasks}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-400 block">المعاملات المالية</span>
                    <span className="text-xs font-mono font-bold text-slate-200">{metrics.totalFinance}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-400 block">عناصر الخزنة</span>
                    <span className="text-xs font-mono font-bold text-slate-200">{metrics.totalVault}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Export & Import */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Export Card */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-amber-400" />
                      <span>تصدير نسخة احتياطية (Backup)</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      حفظ ملف JSON يحتوي على كافة مهامك، ميزانيتك، أهدافك، وعناصر الخزنة لنقلها لأي جهاز آخر.
                    </p>
                  </div>

                  <button
                    onClick={handleExport}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل ملف النسخة الاحتياطية (.json)</span>
                  </button>
                </div>

                {/* Import Card */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-sky-400" />
                      <span>استرجاع نسخة سابقة (Restore)</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      اختر ملف نسخة احتياطية لاستعادة كافة البيانات السابقة على هذا الجهاز فوراً.
                    </p>
                  </div>

                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".json,.meftah"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>استيراد ملف النسخة الاحتياطية</span>
                    </button>
                  </div>
                </div>
              </div>

              {importStatus && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-center font-bold">
                  {importStatus}
                </div>
              )}

              <div className="text-[11px] text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-850 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>
                  آخر موعد تم فيه عمل Backup: <span className="font-mono text-slate-300">{settings.lastBackupDate || 'اليوم'}</span>
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: Profile & General Settings */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">اسم المستخدم / اللقب</label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">العملة الافتراضية</label>
                <input
                  type="text"
                  required
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="مثال: ج.م أو ر.س أو $"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">سؤال أمان الخزنة</label>
                  <input
                    type="text"
                    value={securityQuestion}
                    onChange={(e) => setSecurityQuestion(e.target.value)}
                    placeholder="مثال: اسم كتابك المفضل؟"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">إجابة سؤال الأمان</label>
                  <input
                    type="text"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    placeholder="الإجابة السرية..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="sound-check"
                  checked={soundEffects}
                  onChange={(e) => setSoundEffects(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="sound-check" className="text-xs text-slate-300 cursor-pointer">
                  تفعيل المؤثرات الصوتية وصوت التنبيهات ونغمات الاسترخاء
                </label>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-800">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Windows Desktop EXE Guide */}
          {activeTab === 'exe_guide' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-3.5 bg-gradient-to-r from-amber-950/40 to-slate-950 border border-amber-800/40 rounded-2xl">
                <h4 className="font-bold text-sm text-amber-300 flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4" />
                  <span>كيف تحوّل "مفتاح" لبرنامج Windows EXE حقيقي يشتغل أوفلاين بالكامل؟</span>
                </h4>
                <p className="text-slate-400 text-[11px]">
                  برنامج "مفتاح" مبني بنية بدون خوادم خارجية (Zero-Server Architecture)، مما يجعله جاهزاً 100% للتحويل لملف EXE محمول (Portable) أو مثبت (Setup.exe) بخطوة واحدة:
                </p>
              </div>

              {/* Step 1: Nativefier / Electron */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>الطريقة الأولى (الأسرع في 30 ثانية باستخدام Nativefier أو Tauri):</span>
                </span>
                <p className="text-slate-400 text-[11px]">
                  افتح موجه أوامر الويندوز (CMD / PowerShell) واكتب الأمر التالي لإنشاء ملف <code className="text-amber-300 font-mono">Meftah.exe</code> مباشرة:
                </p>
                <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-lg font-mono text-[11px] text-amber-200 dir-ltr select-all">
                  npx nativefier --name "Meftah" --single-instance --tray --disable-dev-tools http://localhost:3000
                </div>
              </div>

              {/* Step 2: Tauri / Electron Builder */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <span className="font-bold text-sky-400 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5" />
                  <span>الطريقة الثانية (حزمة إنتاج فائقة الخفة بحجم 4 ميجابايت عبر Tauri):</span>
                </span>
                <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-lg font-mono text-[11px] text-sky-200 dir-ltr select-all">
                  npm run build && npx tauri build
                </div>
                <p className="text-[11px] text-slate-400">
                  سينتج لك ملف <code className="text-sky-300 font-mono">src-tauri/target/release/Meftah.exe</code> بدون أي استهلاك للذاكرة وبأقصى سرعة!
                </p>
              </div>

              {/* Step 3: Chrome/Edge PWA Desktop App */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>الطريقة الثالثة (تثبيت فوري كتطبيق سطح مكتب في ويندوز 11/10):</span>
                </span>
                <p className="text-[11px] text-slate-400">
                  من متصفح Edge أو Chrome، اضغط على زر القائمة (⋮) ثم اختر <span className="text-emerald-300 font-semibold">"تثبيت هذا الموقع كتطبيق (Install App)"</span> ليظهر لك أيقونة على سطح المكتب وشريط المهام كبرنامج منفصل تماماً!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
