import React, { useState } from 'react';
import { 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieIcon, 
  BarChart3, 
  Trash2, 
  Search, 
  Download, 
  CreditCard, 
  Banknote, 
  Coins, 
  X, 
  Check,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis 
} from 'recharts';
import confetti from 'canvas-confetti';
import { FinanceRecord, AppSettings } from '../types';
import { soundManager } from '../utils/audio';

interface Props {
  finance: FinanceRecord[];
  onAddFinance: (record: Omit<FinanceRecord, 'id'>) => void;
  onDeleteFinance: (id: string) => void;
  settings: AppSettings;
}

const COLORS = ['#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ec4899', '#f43f5e', '#3b82f6'];

export const FinanceView: React.FC<Props> = ({
  finance,
  onAddFinance,
  onDeleteFinance,
  settings
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState('طعام ومأكولات');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'wallet' | 'bank'>('card');

  // Calculations
  const totalIncome = finance.filter(f => f.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = finance.filter(f => f.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  // Expense Category Grouping for Chart
  const expenseCategoriesMap: { [key: string]: number } = {};
  finance.filter(f => f.type === 'expense').forEach(item => {
    expenseCategoriesMap[item.category] = (expenseCategoriesMap[item.category] || 0) + item.amount;
  });

  const pieData = Object.keys(expenseCategoriesMap).map((cat, idx) => ({
    name: cat,
    value: expenseCategoriesMap[cat],
    color: COLORS[idx % COLORS.length]
  }));

  // Bar Data for Income vs Expense
  const barData = [
    { name: 'إجمالي الدخل', amount: totalIncome, fill: '#10b981' },
    { name: 'إجمالي المصروفات', amount: totalExpense, fill: '#f43f5e' }
  ];

  const handleOpenAddModal = (presetType: 'expense' | 'income' = 'expense') => {
    soundManager.playClick(settings.soundEffects);
    setType(presetType);
    setAmount('');
    setCategory(presetType === 'expense' ? 'سوبرماركت وطعام' : 'راتب شهري');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;

    soundManager.playSuccess(settings.soundEffects);
    onAddFinance({
      type,
      amount: Number(amount),
      category: category.trim() || (type === 'expense' ? 'مصروف عام' : 'دخل عام'),
      note: note.trim(),
      date,
      paymentMethod
    });

    if (type === 'income') {
      try {
        confetti({ particleCount: 50, spread: 60 });
      } catch {}
    }

    setIsModalOpen(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    soundManager.playClick(settings.soundEffects);
    const headers = ['المعرف', 'النوع', 'المبلغ', 'التصنيف', 'البيان/الملاحظة', 'التاريخ', 'طريقة الدفع'];
    const rows = finance.map(f => [
      f.id,
      f.type === 'income' ? 'دخل' : 'مصروف',
      f.amount,
      `"${f.category}"`,
      `"${f.note}"`,
      f.date,
      f.paymentMethod
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Meftah_Finance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filteredFinance = finance.filter(item => {
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return item.category.toLowerCase().includes(q) || item.note.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div id="finance-view" className="p-6 max-w-7xl mx-auto space-y-6 overflow-y-auto custom-scrollbar">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <span>مصروفي وإدارة الميزانية الذكية</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            سجل دخلك ومصروفاتك اليومية وتحكم في ميزانيتك بكل أمان وخصوصية
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
            title="تصدير ملف Excel / CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>تصدير Excel/CSV</span>
          </button>

          <button
            onClick={() => handleOpenAddModal('expense')}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-950/40"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>تسجيل مصروف</span>
          </button>

          <button
            onClick={() => handleOpenAddModal('income')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>تسجيل دخل</span>
          </button>
        </div>
      </div>

      {/* Summary Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Net Balance */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-850 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>صافي الرصيد المتبقي</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className={`text-2xl font-mono font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {balance.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">{settings.currency}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {balance >= 0 ? '👍 ميزانيتك في المنطقة الإيجابية ومتحكم في الصرف' : '⚠️ المصروفات تتجاوز الدخل، حاول ترشيد النفقات'}
          </p>
        </div>

        {/* Total Income */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>إجمالي الدخل والأرباح</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-bold text-emerald-400">
              +{totalIncome.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">{settings.currency}</span>
          </div>
          <p className="text-[11px] text-emerald-400/80 mt-1">
            {finance.filter(f => f.type === 'income').length} عمليات واردة
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>إجمالي المصروفات والنفقات</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-bold text-rose-400">
              -{totalExpense.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">{settings.currency}</span>
          </div>
          <p className="text-[11px] text-rose-400/80 mt-1">
            {finance.filter(f => f.type === 'expense').length} عمليات منصرفة
          </p>
        </div>
      </div>

      {/* Analytics Charts (Pie & Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category Breakdown Pie */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
              <PieIcon className="w-4 h-4 text-amber-400" />
              <span>توزيع المصروفات حسب التصنيف</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              {pieData.length} تصنيفات
            </span>
          </div>

          {pieData.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">لا توجد مصروفات مسجلة بعد</div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-44 h-44 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={65}
                      innerRadius={38}
                      paddingAngle={3}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: number) => [`${val.toLocaleString()} ${settings.currency}`, 'المبلغ']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#f8fafc' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend List */}
              <div className="flex-1 space-y-1.5 w-full">
                {pieData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-300 font-medium truncate max-w-[120px]">{item.name}</span>
                    </div>
                    <span className="font-mono text-slate-200 font-bold">{item.value.toLocaleString()} {settings.currency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Income vs Expense Bar Chart */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              <span>مقارنة التدفق المالي (الدخل مقابل الصرف)</span>
            </h3>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip 
                  formatter={(val: number) => [`${val.toLocaleString()} ${settings.currency}`, 'القيمة']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#f8fafc' }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transaction History & Filters */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="font-bold text-sm text-slate-200">سجل المعاملات والتحويلات</h3>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث في البيان أو التصنيف..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-8 pl-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-2.5 py-1 rounded-md ${typeFilter === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
              >
                الكل
              </button>
              <button
                onClick={() => setTypeFilter('income')}
                className={`px-2.5 py-1 rounded-md ${typeFilter === 'income' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'}`}
              >
                الدخل
              </button>
              <button
                onClick={() => setTypeFilter('expense')}
                className={`px-2.5 py-1 rounded-md ${typeFilter === 'expense' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400'}`}
              >
                المصروفات
              </button>
            </div>
          </div>
        </div>

        {/* List Table */}
        <div className="space-y-2">
          {filteredFinance.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">لا توجد معاملات مسجلة</div>
          ) : (
            filteredFinance.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                    item.type === 'income' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60' : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                  }`}>
                    {item.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{item.category}</h4>
                    <p className="text-[11px] text-slate-400">{item.note || 'بدون ملاحظات'}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span>{item.date}</span>
                      <span>•</span>
                      <span>{item.paymentMethod === 'card' ? 'بطاقة بنكية' : item.paymentMethod === 'wallet' ? 'محفظة إلكترونية' : item.paymentMethod === 'bank' ? 'تحويل بنكي' : 'كاش نقدي'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-sm font-mono font-bold ${item.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.type === 'income' ? '+' : '-'}{item.amount.toLocaleString()} {settings.currency}
                  </span>

                  <button
                    onClick={() => {
                      soundManager.playClick(settings.soundEffects);
                      onDeleteFinance(item.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-rose-950/60 text-slate-500 hover:text-rose-400"
                    title="حذف السجل"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Finance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>{type === 'expense' ? 'تسجيل مصروف جديد' : 'تسجيل دخل جديد'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-2 rounded-lg text-xs font-bold transition-colors ${
                    type === 'expense' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  مصروف (خرج من جيبي) 💸
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-2 rounded-lg text-xs font-bold transition-colors ${
                    type === 'income' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  دخل (فلوس دخلت) 💰
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">المبلغ ({settings.currency}) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">التصنيف</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="مثال: سوبرماركت، راتب، كافيه، فواتير..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(type === 'expense'
                    ? ['طعام وبقالة', 'فواتير', 'مواصلات', 'ترفيه وكافيهات', 'صحة وعلاج', 'تسوق']
                    : ['راتب شهري', 'عمل حر / Freelance', 'أرباح استثمار', 'هدية / مكافأة']
                  ).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCategory(preset)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">بيان / ملاحظة (اختياري)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="تفاصيل الشراء أو مصدر الدخل..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">طريقة الدفع</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="card">بطاقة بنكية / فيزا</option>
                    <option value="wallet">محفظة إلكترونية (فودافون كاش...)</option>
                    <option value="cash">نقداً (كاش)</option>
                    <option value="bank">تحويل حساب بنكي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">التاريخ</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
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
                  className={`px-5 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 ${
                    type === 'expense' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>تسجيل المعاملة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
