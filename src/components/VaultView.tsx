import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  Key, 
  Eye, 
  EyeOff, 
  Copy, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  AlertCircle, 
  Check, 
  X, 
  Star, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VaultItem, AppSettings } from '../types';
import { soundManager } from '../utils/audio';

interface Props {
  vault: VaultItem[];
  onAddVaultItem: (item: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteVaultItem: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const VaultView: React.FC<Props> = ({
  vault,
  onAddVaultItem,
  onDeleteVaultItem,
  onToggleFavorite,
  settings,
  onUpdateSettings
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [revealedIds, setRevealedIds] = useState<{ [key: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Recovery & PIN change modal
  const [isPinChangeModalOpen, setIsPinChangeModalOpen] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [newPinConfirm, setNewPinConfirm] = useState('');
  const [securityAnswerInput, setSecurityAnswerInput] = useState('');
  const [isForgotPinOpen, setIsForgotPinOpen] = useState(false);

  // New Vault Item Form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'passwords' | 'notes' | 'ideas' | 'secrets' | 'documents'>('passwords');
  const [isFavorite, setIsFavorite] = useState(false);

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const enteredHash = btoa(pinInput);
    if (enteredHash === settings.vaultPinHash) {
      soundManager.playSuccess(settings.soundEffects);
      setIsUnlocked(true);
      setPinError(false);
      setPinInput('');
    } else {
      soundManager.playClick(settings.soundEffects);
      setPinError(true);
      setPinInput('');
    }
  };

  const handleKeypadPress = (digit: string) => {
    soundManager.playClick(settings.soundEffects);
    if (pinInput.length < 6) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      if (nextPin.length >= 4 && btoa(nextPin) === settings.vaultPinHash) {
        soundManager.playSuccess(settings.soundEffects);
        setIsUnlocked(true);
        setPinError(false);
        setPinInput('');
      }
    }
  };

  const handleLock = () => {
    soundManager.playClick(settings.soundEffects);
    setIsUnlocked(false);
    setRevealedIds({});
  };

  const toggleReveal = (id: string) => {
    soundManager.playClick(settings.soundEffects);
    setRevealedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, id: string) => {
    soundManager.playClick(settings.soundEffects);
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmitItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    soundManager.playSuccess(settings.soundEffects);
    onAddVaultItem({
      title: title.trim(),
      content: content.trim(),
      category,
      isFavorite
    });

    setTitle('');
    setContent('');
    setIsFavorite(false);
    setIsModalOpen(false);
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4 || newPin !== newPinConfirm) return;

    soundManager.playSuccess(settings.soundEffects);
    onUpdateSettings({ vaultPinHash: btoa(newPin) });
    setIsPinChangeModalOpen(false);
    setNewPin('');
    setNewPinConfirm('');
    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch {}
  };

  const handleRecoverWithSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (securityAnswerInput.trim().toLowerCase() === (settings.vaultSecurityAnswer || '').toLowerCase()) {
      soundManager.playSuccess(settings.soundEffects);
      setIsUnlocked(true);
      setIsForgotPinOpen(false);
      setSecurityAnswerInput('');
    } else {
      soundManager.playClick(settings.soundEffects);
      alert('إجابة سؤال الأمان غير صحيحة!');
    }
  };

  return (
    <div id="vault-view" className="p-6 max-w-7xl mx-auto space-y-6 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" />
            <span>الخزنة الرقمية السرية المشفرة</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            احفظ كلمات المرور والملاحظات السرية وبياناتك الحساسة برمز PIN محلي
          </p>
        </div>

        {isUnlocked && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPinChangeModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>تغيير رمز الـ PIN</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة عنصر سري</span>
            </button>

            <button
              onClick={handleLock}
              className="px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 font-bold text-xs flex items-center gap-1.5"
              title="قفل الخزنة فوراً"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>قفل الخزنة</span>
            </button>
          </div>
        )}
      </div>

      {/* LOCKED STATE SCREEN */}
      {!isUnlocked ? (
        <div className="max-w-md mx-auto my-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 text-center shadow-2xl space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-100">الخزنة مغلقة حالياً</h3>
            <p className="text-xs text-slate-400 mt-1">
              أدخل رمز المرور PIN (الرمز الافتراضي: <span className="font-mono text-amber-400 font-bold">1234</span>)
            </p>
          </div>

          {/* PIN Input Dots */}
          <div className="flex items-center justify-center gap-2 my-2">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full border transition-all ${
                  pinInput.length > idx
                    ? 'bg-amber-400 border-amber-400 scale-110 shadow-sm shadow-amber-500'
                    : 'border-slate-700 bg-slate-950'
                }`}
              />
            ))}
          </div>

          {pinError && (
            <p className="text-xs text-rose-400 flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>رمز الـ PIN غير صحيح! جرب 1234 أو استرجع الرمز</span>
            </p>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                onClick={() => handleKeypadPress(digit)}
                className="h-12 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-base font-mono font-bold text-slate-200 active:scale-95 transition-all"
              >
                {digit}
              </button>
            ))}
            <button
              onClick={() => {
                soundManager.playClick(settings.soundEffects);
                setPinInput('');
              }}
              className="h-12 rounded-xl bg-slate-950/50 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-400"
            >
              مسح
            </button>
            <button
              onClick={() => handleKeypadPress('0')}
              className="h-12 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-base font-mono font-bold text-slate-200 active:scale-95"
            >
              0
            </button>
            <button
              onClick={() => handleUnlock()}
              className="h-12 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center"
            >
              فتح 🔓
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <button
              onClick={() => setIsForgotPinOpen(true)}
              className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center justify-center gap-1 mx-auto"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>نسيت رمز الـ PIN؟ استرجاع بسؤال الأمان</span>
            </button>
          </div>
        </div>
      ) : (
        /* UNLOCKED STATE SCREEN */
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>الخزنة مفتوحة وآمنة محلياً 100% — لا يتم إرسال أي حرف إلى أي خادم خارجي.</span>
            </div>
            <button
              onClick={handleLock}
              className="px-2.5 py-1 rounded bg-slate-900 border border-emerald-700/60 text-emerald-300 hover:bg-slate-850 font-bold"
            >
              إعادة القفل
            </button>
          </div>

          {/* Vault Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vault.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
                <Lock className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <h4 className="text-sm font-bold text-slate-300">الخزنة فارغة حالياً</h4>
                <p className="text-xs text-slate-500 mt-1">أضف أول ملاحظة سرية أو كلمة مرور خاصة بك</p>
              </div>
            ) : (
              vault.map((item) => {
                const isRevealed = revealedIds[item.id] || false;
                return (
                  <div
                    key={item.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-100">{item.title}</h4>
                          <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/50 mt-1 inline-block">
                            {item.category === 'passwords' ? '🔑 كلمة مرور / حساب' :
                             item.category === 'ideas' ? '💡 فكرة سرية' :
                             item.category === 'documents' ? '📑 بيانات رسمية' :
                             item.category === 'secrets' ? '🔒 سر خاص' : '📝 ملاحظة خاصة'}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            soundManager.playClick(settings.soundEffects);
                            onToggleFavorite(item.id);
                          }}
                          className={`p-1.5 rounded-lg ${item.isFavorite ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>

                      {/* Content Box */}
                      <div className="mt-3 p-3 bg-slate-950 border border-slate-850 rounded-xl relative">
                        <div className="text-xs text-slate-200 font-mono whitespace-pre-wrap break-words">
                          {isRevealed ? item.content : '••••••••••••••••••••••••••••'}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleReveal(item.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{isRevealed ? 'إخفاء' : 'إظهار'}</span>
                        </button>

                        <button
                          onClick={() => handleCopy(item.content, item.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
                        >
                          {copiedId === item.id ? (
                            <span className="text-emerald-400 font-bold">تم النسخ!</span>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>نسخ</span>
                            </>
                          )}
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          soundManager.playClick(settings.soundEffects);
                          onDeleteVaultItem(item.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-rose-950 text-slate-500 hover:text-rose-400"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Add Vault Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>إضافة عنصر جديد للخزنة</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitItem} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">العنوان أو اسم الحساب *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: كلمة سر الراوتر، أفكار مشروعي، أرقام الحساب..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">التصنيف</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="passwords">🔑 كلمات مرور وحسابات</option>
                  <option value="notes">📝 ملاحظات خاصة</option>
                  <option value="ideas">💡 أفكار سرية</option>
                  <option value="secrets">🔒 أسرار ومعلومات حساسة</option>
                  <option value="documents">📑 بيانات بنكية ومستندات</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">المحتوى السري *</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="اكتب المحتوى السري أو كلمة المرور هنا..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="vault-fav"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="vault-fav" className="text-xs text-slate-300 cursor-pointer">
                  تمييز كمفضل
                </label>
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
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ في الخزنة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change PIN Modal */}
      {isPinChangeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              <span>تغيير رمز المرور PIN</span>
            </h3>

            <form onSubmit={handleChangePin} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">الرمز الجديد (4 أرقام على الأقل)</label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-center text-sm font-mono text-slate-100 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">تأكيد الرمز الجديد</label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={newPinConfirm}
                  onChange={(e) => setNewPinConfirm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-center text-sm font-mono text-slate-100 focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPinChangeModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={newPin.length < 4 || newPin !== newPinConfirm}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs"
                >
                  تحديث الـ PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Forgot PIN Recovery Modal */}
      {isForgotPinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>استرجاع الخزنة بسؤال الأمان</span>
            </h3>

            <form onSubmit={handleRecoverWithSecurity} className="space-y-3">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-amber-400 font-bold block">سؤال الأمان:</span>
                <p className="text-xs text-slate-200 mt-0.5">{settings.vaultSecurityQuestion || 'ما هو اسم أول مدرسة أو كتاب مفضل؟'}</p>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">الإجابة</label>
                <input
                  type="text"
                  required
                  value={securityAnswerInput}
                  onChange={(e) => setSecurityAnswerInput(e.target.value)}
                  placeholder="اكتب الإجابة..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotPinOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  تحقق وفتح
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
