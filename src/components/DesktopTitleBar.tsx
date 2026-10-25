import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  HardDrive, 
  Download, 
  Minus, 
  Square, 
  X, 
  Maximize2, 
  Volume2, 
  VolumeX,
  Clock,
  Sparkles
} from 'lucide-react';
import { AppSettings } from '../types';
import { soundManager } from '../utils/audio';

interface Props {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onOpenBackup: () => void;
  storageKb: string;
  onTriggerRescue: () => void;
}

export const DesktopTitleBar: React.FC<Props> = ({
  settings,
  onUpdateSettings,
  onOpenBackup,
  storageKb,
  onTriggerRescue
}) => {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('ar-EG', { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    soundManager.playClick(settings.soundEffects);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const toggleSound = () => {
    const nextSound = !settings.soundEffects;
    onUpdateSettings({ soundEffects: nextSound });
    soundManager.playClick(nextSound);
  };

  return (
    <header 
      id="desktop-titlebar"
      className="h-11 bg-slate-900/90 border-b border-slate-800/80 px-3 flex items-center justify-between select-none text-xs text-slate-300 backdrop-blur-md sticky top-0 z-40"
    >
      {/* Right Side: App Brand & Window Controls simulation */}
      <div className="flex items-center gap-3">
        {/* App Logo & Name */}
        <div className="flex items-center gap-2 pr-1">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-sm shadow-amber-500/20">
            <KeyRound className="w-3.5 h-3.5 text-slate-950" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-100 tracking-wide text-sm">مِـفـتـاح</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-mono border border-slate-700/50">
              v1.0 Offline
            </span>
          </div>
        </div>

        {/* Offline & Security Status */}
        <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-800">
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2 py-0.5 rounded-full font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            100% بدون إنترنت (آمن محلياً)
          </span>
          <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full">
            <HardDrive className="w-3 h-3 text-slate-400" />
            الحجم: {storageKb} KB
          </span>
        </div>
      </div>

      {/* Center: Live Clock & Quick De-stress Callout */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            soundManager.playClick(settings.soundEffects);
            onTriggerRescue();
          }}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-rose-300 bg-rose-950/60 border border-rose-800/60 hover:bg-rose-900/60 transition-all hover:scale-105 shadow-sm shadow-rose-900/30"
          title="زر الطوارئ عند الشعور بالضغط أو التوتر"
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span>أنا مخنوق؟ 😤</span>
        </button>

        <div className="flex items-center gap-2 text-slate-400 bg-slate-950/60 px-3 py-1 rounded-md border border-slate-800/50">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono text-slate-200 font-medium text-xs">{time}</span>
          <span className="text-[11px] text-slate-400 hidden xl:inline">({date})</span>
        </div>
      </div>

      {/* Left Side: System Tools & Window Control Buttons */}
      <div className="flex items-center gap-1">
        {/* Toggle Sound */}
        <button
          onClick={toggleSound}
          id="btn-toggle-sound"
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title={settings.soundEffects ? 'كتم المؤثرات الصوتية' : 'تفعيل المؤثرات الصوتية'}
        >
          {settings.soundEffects ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
        </button>

        {/* Quick Backup Trigger */}
        <button
          onClick={() => {
            soundManager.playClick(settings.soundEffects);
            onOpenBackup();
          }}
          id="btn-quick-backup"
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="النسخ الاحتياطي والإعدادات"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          id="btn-toggle-fullscreen"
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="ملء الشاشة"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* Desktop Window Controls (Minimize / Maximize / Close simulation) */}
        <div className="flex items-center gap-0.5 mr-1 border-r border-slate-800 pr-1">
          <button 
            onClick={() => soundManager.playClick(settings.soundEffects)} 
            className="w-7 h-6 flex items-center justify-center hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
            title="تصغير"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button 
            onClick={toggleFullscreen} 
            className="w-7 h-6 flex items-center justify-center hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
            title="تكبير"
          >
            <Square className="w-2.5 h-2.5" />
          </button>
          <button 
            onClick={() => soundManager.playClick(settings.soundEffects)} 
            className="w-7 h-6 flex items-center justify-center hover:bg-rose-900/80 rounded text-slate-400 hover:text-rose-200"
            title="إغلاق البرنامج"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </header>
  );
};
