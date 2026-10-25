import React, { useState } from 'react';
import { 
  FolderKanban, 
  Folder, 
  FileText, 
  Globe, 
  AppWindow, 
  Plus, 
  Copy, 
  Pin, 
  Trash2, 
  Search, 
  ExternalLink, 
  Check, 
  X,
  Tag
} from 'lucide-react';
import { FileBookmark, AppSettings } from '../types';
import { soundManager } from '../utils/audio';

interface Props {
  files: FileBookmark[];
  onAddFile: (file: Omit<FileBookmark, 'id'>) => void;
  onDeleteFile: (id: string) => void;
  onTogglePin: (id: string) => void;
  settings: AppSettings;
}

export const FilesView: React.FC<Props> = ({
  files,
  onAddFile,
  onDeleteFile,
  onTogglePin,
  settings
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [pathOrUrl, setPathOrUrl] = useState('');
  const [type, setType] = useState<'folder' | 'file' | 'url' | 'app'>('folder');
  const [category, setCategory] = useState('العمل');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  const categories = ['all', ...Array.from(new Set(files.map(f => f.category)))];

  const handleOpenAddModal = () => {
    soundManager.playClick(settings.soundEffects);
    setTitle('');
    setPathOrUrl('');
    setType('folder');
    setCategory('العمل');
    setDescription('');
    setTagsInput('');
    setIsPinned(false);
    setIsAddModalOpen(true);
  };

  const handleCopyPath = (path: string, id: string) => {
    soundManager.playClick(settings.soundEffects);
    navigator.clipboard.writeText(path);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !pathOrUrl.trim()) return;

    soundManager.playSuccess(settings.soundEffects);
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    onAddFile({
      title: title.trim(),
      pathOrUrl: pathOrUrl.trim(),
      type,
      category: category.trim() || 'عام',
      description: description.trim(),
      tags,
      isPinned
    });

    setIsAddModalOpen(false);
  };

  const filteredFiles = files.filter(file => {
    if (selectedCategory !== 'all' && file.category !== selectedCategory) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        file.title.toLowerCase().includes(q) ||
        file.pathOrUrl.toLowerCase().includes(q) ||
        file.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getFileIcon = (fileType: FileBookmark['type']) => {
    switch (fileType) {
      case 'folder': return <Folder className="w-5 h-5 text-amber-400" />;
      case 'file': return <FileText className="w-5 h-5 text-sky-400" />;
      case 'url': return <Globe className="w-5 h-5 text-emerald-400" />;
      case 'app': return <AppWindow className="w-5 h-5 text-violet-400" />;
    }
  };

  return (
    <div id="files-view" className="p-6 max-w-7xl mx-auto space-y-6 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-violet-400" />
            <span>ملفاتي ومسارات ويندوز المهمة</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            احفظ مسارات المجلدات والمشاريع والملفات للوصول السريع إليها بنقرة واحدة
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-violet-950/40 transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مسار / ملف جديد</span>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث في اسم الملف أو المسار أو الوسوم..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar w-full sm:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-violet-600 text-white font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat === 'all' ? 'كافة التصنيفات' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFiles.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
            <FolderKanban className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <h4 className="text-sm font-bold text-slate-300">لا توجد ملفات محفوظة في هذا القسم</h4>
            <p className="text-xs text-slate-500 mt-1">أضف مسارات مجلدات العمل أو المراجع المهمة للوصول السريع</p>
          </div>
        ) : (
          filteredFiles.map((file) => (
            <div
              key={file.id}
              className={`bg-slate-900/80 border rounded-2xl p-4 flex flex-col justify-between transition-all hover:border-slate-700 space-y-3 ${
                file.isPinned ? 'border-amber-500/40 bg-slate-900/90' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center flex-shrink-0">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-100 truncate">{file.title}</h4>
                      <span className="text-[10px] text-slate-400">{file.category}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundManager.playClick(settings.soundEffects);
                      onTogglePin(file.id);
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${
                      file.isPinned ? 'text-amber-400 bg-amber-950/60 border border-amber-800/60' : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title={file.isPinned ? 'إلغاء التثبيت' : 'تثبيت في المفضلة'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                </div>

                {file.description && (
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{file.description}</p>
                )}

                {/* Windows Path Box */}
                <div className="mt-3 p-2 bg-slate-950/80 border border-slate-850 rounded-xl flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-slate-300 truncate dir-ltr select-all">
                    {file.pathOrUrl}
                  </span>
                </div>

                {/* Tags */}
                {file.tags && file.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {file.tags.map((tag, idx) => (
                      <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => handleCopyPath(file.pathOrUrl, file.id)}
                  className="px-3 py-1.5 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copiedId === file.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">تم نسخ المسار!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ المسار (Win+R)</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  {file.pathOrUrl.startsWith('http') && (
                    <a
                      href={file.pathOrUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                      title="فتح الرابط"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() => {
                      soundManager.playClick(settings.soundEffects);
                      onDeleteFile(file.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-rose-950/60 text-slate-500 hover:text-rose-400"
                    title="حذف المسار"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add File Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-violet-400" />
                <span>إضافة رابط أو مسار ملف جديد</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">اسم العنصر / المجلد *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: مجلد مشاريع 2026 أو ملف الميزانية"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">المسار على الويندوز أو الرابط *</label>
                <input
                  type="text"
                  required
                  value={pathOrUrl}
                  onChange={(e) => setPathOrUrl(e.target.value)}
                  placeholder="مثال: D:\Work\Projects أو C:\Users\Documents\File.pdf"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 font-mono dir-ltr"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  💡 تلميح: يمكنك نسخ المسار بسهولة من ويندوز عبر الضغط على Shift + كليك يمين على الملف واختيار "Copy as path".
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">النوع</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
                  >
                    <option value="folder">📁 مجلد (Folder)</option>
                    <option value="file">📄 ملف مستند (File)</option>
                    <option value="app">⚡ تطبيق / برنامج EXE</option>
                    <option value="url">🌐 رابط إنترنت (URL)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">التصنيف</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="مثال: العمل، الدراسة، ترفيه..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">الوصف (اختياري)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ملاحظات حول هذا المجلد أو الملف..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">الوسوم (مفصولة بفاصلة)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="مثال: برمجة, تصميم, مهم"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pin-check"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-violet-600 focus:ring-violet-500"
                />
                <label htmlFor="pin-check" className="text-xs text-slate-300 cursor-pointer">
                  تثبيت هذا العنصر في الصفحة الرئيسية للمفضلة
                </label>
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
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ المسار</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
