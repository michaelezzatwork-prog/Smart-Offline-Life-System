import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Flame, 
  Sparkles, 
  RotateCcw, 
  Trophy, 
  CheckCircle2, 
  Heart, 
  Smile, 
  Music, 
  GlassWater, 
  Gamepad2, 
  Wind, 
  Trash2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Shuffle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RescueActivity } from '../types';
import { RESCUE_MISSIONS } from '../utils/storage';
import { soundManager } from '../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogMoodActivity?: (activityName: string) => void;
  soundEnabled: boolean;
}

type RescueTab = 'missions' | 'bubbles' | 'breathing' | 'burn' | 'gratitude' | 'challenge';

export const RescueModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onLogMoodActivity,
  soundEnabled
}) => {
  const [activeTab, setActiveTab] = useState<RescueTab>('missions');
  const [currentMission, setCurrentMission] = useState<RescueActivity>(RESCUE_MISSIONS[0]);
  const [timerSeconds, setTimerSeconds] = useState<number>(120);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  
  // Bubbles Game State (24 bubbles)
  const [bubbles, setBubbles] = useState<boolean[]>(Array(24).fill(false));
  const [poppedCount, setPoppedCount] = useState<number>(0);

  // Breathing Pacer State
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathCountdown, setBreathCountdown] = useState<number>(4);
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);
  const [breathsCompleted, setBreathsCompleted] = useState<number>(0);

  // Burn Thoughts State
  const [ventText, setVentText] = useState<string>('');
  const [isBurning, setIsBurning] = useState<boolean>(false);
  const [burnCompleted, setBurnCompleted] = useState<boolean>(false);

  // Gratitude / Aspiration State
  const [gratitudes, setGratitudes] = useState<string[]>(['', '', '']);
  const [gratitudeSaved, setGratitudeSaved] = useState<boolean>(false);

  // Ambient Audio Inside Rescue
  const [isAmbientOn, setIsAmbientOn] = useState<boolean>(false);

  // Random Challenge
  const quickChallenges = [
    '💪 قوم حالا واعمل 10 عدات تمدد أو ضغط خفيف!',
    '☕ اعمل كوباية شاي أو قهوة على نار هادية بمزاج.',
    '📱 ابعت رسالة تشجيع لحد من صحابك أو أهلك.',
    '🪟 افتح الشباك وبص للسما وخد 3 أنفاس عميقة.',
    '😂 افتح فيديو مضحك قصير أو ميم يفصلك لمدة دقيقتين.',
    '🧼 اغسل وشك بمية باردة ورش رشة عطر بتحبها.',
    '🚶‍♂️ اتمشى دقيقة واحدة في الأوضة وافرد ضهرك.',
  ];
  const [randomChallenge, setRandomChallenge] = useState<string>(quickChallenges[0]);

  // Handle Initial Random Mission when opened
  useEffect(() => {
    if (isOpen) {
      const randomIndex = Math.floor(Math.random() * RESCUE_MISSIONS.length);
      const mission = RESCUE_MISSIONS[randomIndex];
      setCurrentMission(mission);
      setTimerSeconds(mission.durationSeconds);
      setIsTimerRunning(false);
      soundManager.playChime();
    }
  }, [isOpen]);

  // Mission countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (isTimerRunning && timerSeconds === 0) {
      setIsTimerRunning(false);
      soundManager.playSuccess(soundEnabled);
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {}
      if (onLogMoodActivity) onLogMoodActivity(currentMission.title);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, currentMission, soundEnabled, onLogMoodActivity]);

  // Breathing 4-7-8 loop
  useEffect(() => {
    let breathInterval: NodeJS.Timeout;
    if (isBreathingActive) {
      breathInterval = setInterval(() => {
        setBreathCountdown(prev => {
          if (prev > 1) return prev - 1;
          
          // Transition phases
          if (breathPhase === 'inhale') {
            setBreathPhase('hold');
            return 7;
          } else if (breathPhase === 'hold') {
            setBreathPhase('exhale');
            return 8;
          } else {
            setBreathPhase('inhale');
            setBreathsCompleted(b => b + 1);
            soundManager.playChime();
            return 4;
          }
        });
      }, 1000);
    }
    return () => clearInterval(breathInterval);
  }, [isBreathingActive, breathPhase]);

  if (!isOpen) return null;

  const handleNextMission = () => {
    soundManager.playClick(soundEnabled);
    const currentIndex = RESCUE_MISSIONS.findIndex(m => m.id === currentMission.id);
    const nextIndex = (currentIndex + 1) % RESCUE_MISSIONS.length;
    const next = RESCUE_MISSIONS[nextIndex];
    setCurrentMission(next);
    setTimerSeconds(next.durationSeconds);
    setIsTimerRunning(false);
  };

  const handlePopBubble = (index: number) => {
    if (!bubbles[index]) {
      const nextBubbles = [...bubbles];
      nextBubbles[index] = true;
      setBubbles(nextBubbles);
      setPoppedCount(prev => prev + 1);
      soundManager.playBubblePop(1 + (index % 5) * 0.1);
      
      if (nextBubbles.every(b => b)) {
        soundManager.playSuccess(soundEnabled);
        try {
          confetti({ particleCount: 60, spread: 60 });
        } catch {}
      }
    }
  };

  const resetBubbles = () => {
    soundManager.playClick(soundEnabled);
    setBubbles(Array(24).fill(false));
    setPoppedCount(0);
  };

  const handleBurnThoughts = () => {
    if (!ventText.trim()) return;
    soundManager.playClick(soundEnabled);
    setIsBurning(true);
    setTimeout(() => {
      setIsBurning(false);
      setVentText('');
      setBurnCompleted(true);
      soundManager.playSuccess(soundEnabled);
      try {
        confetti({ particleCount: 50, spread: 50 });
      } catch {}
      if (onLogMoodActivity) onLogMoodActivity('تفريغ وحرق الأفكار السلبية');
    }, 2200);
  };

  const toggleAmbientSound = () => {
    const nextState = !isAmbientOn;
    setIsAmbientOn(nextState);
    soundManager.toggleAmbient(nextState);
  };

  const spinChallenge = () => {
    soundManager.playClick(soundEnabled);
    const randomIndex = Math.floor(Math.random() * quickChallenges.length);
    setRandomChallenge(quickChallenges[randomIndex]);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="rescue-modal"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col text-slate-100"
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-rose-950/80 via-slate-900 to-amber-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <span>محطة تفريغ التوتر وإعادة الشحن</span>
                <span className="text-[10px] bg-rose-900/60 text-rose-300 px-2 py-0.5 rounded-full border border-rose-700/50">
                  أنا مخنوق 😤
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">افصل عقلك لدقيقة أو دقيقتين وارجع أقوى من الأول</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleAmbientSound}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                isAmbientOn ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="مطر وأمواج هادئة للاسترخاء"
            >
              {isAmbientOn ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="text-[10px] hidden sm:inline">{isAmbientOn ? 'المطر شغال' : 'صوت هادئ'}</span>
            </button>

            <button
              onClick={() => {
                if (isAmbientOn) soundManager.toggleAmbient(false);
                onClose();
              }}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-950/60 border-b border-slate-800 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => { soundManager.playClick(soundEnabled); setActiveTab('missions'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'missions' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>مهمة عشوائية</span>
          </button>

          <button
            onClick={() => { soundManager.playClick(soundEnabled); setActiveTab('bubbles'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'bubbles' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>فرقعة الفقاعات</span>
          </button>

          <button
            onClick={() => { soundManager.playClick(soundEnabled); setActiveTab('breathing'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'breathing' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wind className="w-3.5 h-3.5 text-emerald-400" />
            <span>تنفس 4-7-8</span>
          </button>

          <button
            onClick={() => { soundManager.playClick(soundEnabled); setActiveTab('burn'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'burn' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>محرقة الهموم</span>
          </button>

          <button
            onClick={() => { soundManager.playClick(soundEnabled); setActiveTab('challenge'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'challenge' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5 text-violet-400" />
            <span>تحدي سريع 😂</span>
          </button>

          <button
            onClick={() => { soundManager.playClick(soundEnabled); setActiveTab('gratitude'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'gratitude' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-pink-400" />
            <span>3 أمنيات وامتنان</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {/* TAB 1: Random Micro-Mission */}
          {activeTab === 'missions' && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-rose-500/30 to-amber-500/20 border border-rose-500/40 flex items-center justify-center text-4xl shadow-xl">
                {currentMission.emoji}
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-700/50 px-3 py-1 rounded-full">
                  {currentMission.badge}
                </span>
                <h2 className="text-xl font-bold text-slate-100">{currentMission.title}</h2>
                <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  {currentMission.instruction}
                </p>
              </div>

              {/* Countdown Timer */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 max-w-xs mx-auto flex flex-col items-center">
                <span className="text-3xl font-mono font-bold text-amber-300 tracking-wider">
                  {formatTime(timerSeconds)}
                </span>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => {
                      soundManager.playClick(soundEnabled);
                      setIsTimerRunning(!isTimerRunning);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 flex items-center gap-1.5"
                  >
                    {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isTimerRunning ? 'إيقاف مؤقت' : 'ابدأ المؤقت'}</span>
                  </button>

                  <button
                    onClick={() => {
                      soundManager.playClick(soundEnabled);
                      setTimerSeconds(currentMission.durationSeconds);
                      setIsTimerRunning(false);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200"
                    title="إعادة ضبط"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleNextMission}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-700"
                >
                  <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                  <span>اقتراح مهمة تانية</span>
                </button>

                <button
                  onClick={() => {
                    soundManager.playSuccess(soundEnabled);
                    try {
                      confetti({ particleCount: 70, spread: 60 });
                    } catch {}
                    if (onLogMoodActivity) onLogMoodActivity(currentMission.title);
                    onClose();
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-emerald-900/30"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>عملت المهمة ورجعت بمزاج رايق! 🚀</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Bubble Pop Game */}
          {activeTab === 'bubbles' && (
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-between px-2">
                <div className="text-right">
                  <h4 className="text-sm font-bold text-slate-200">فرقع فقاعات التوتر 🫧</h4>
                  <p className="text-xs text-slate-400">دوس على الفقاعة وفرقع الشحنات السلبية</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-cyan-950 border border-cyan-800 text-cyan-300 px-2.5 py-1 rounded-lg">
                    العدد: {poppedCount} / 24
                  </span>
                  <button
                    onClick={resetBubbles}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
                    title="تجديد الفقاعات"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>تجديد</span>
                  </button>
                </div>
              </div>

              {/* Bubble Grid (4 x 6) */}
              <div className="grid grid-cols-6 gap-3 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl max-w-md mx-auto">
                {bubbles.map((isPopped, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePopBubble(idx)}
                    disabled={isPopped}
                    className={`h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isPopped
                        ? 'bg-slate-800/40 border border-slate-800 scale-90 opacity-40 cursor-default'
                        : 'bg-gradient-to-tr from-cyan-600/80 to-sky-400/90 border border-cyan-300/60 shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-90 animate-pulse'
                    }`}
                  >
                    {isPopped ? (
                      <span className="text-[10px] text-slate-500 font-mono">✓</span>
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-white/70 translate-x-1 -translate-y-1"></div>
                    )}
                  </button>
                ))}
              </div>

              <p className="text-xs text-slate-400">
                {poppedCount === 24 ? '🎉 برافو! فرقعت كل التوتر. حسيت بفرق؟' : 'استمتع بالصوت وافرغ طاقتك'}
              </p>
            </div>
          )}

          {/* TAB 3: 4-7-8 Breathing */}
          {activeTab === 'breathing' && (
            <div className="space-y-6 text-center">
              <div>
                <h4 className="text-sm font-bold text-slate-200">تمرين التنفس العميق المهدئ (4-7-8)</h4>
                <p className="text-xs text-slate-400">يساعد على خفض هرمون الكورتيزول وتهدئة العقل في ثوانٍ</p>
              </div>

              {/* Dynamic Breathing Visualizer Circle */}
              <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                {/* Outer Glow */}
                <div 
                  className={`absolute rounded-full transition-all duration-1000 ${
                    breathPhase === 'inhale'
                      ? 'w-48 h-48 bg-emerald-500/20 border-2 border-emerald-400 scale-100 animate-pulse'
                      : breathPhase === 'hold'
                      ? 'w-48 h-48 bg-amber-500/20 border-2 border-amber-400 scale-105'
                      : 'w-24 h-24 bg-sky-500/20 border-2 border-sky-400 scale-90'
                  }`}
                />

                {/* Center Counter */}
                <div className="relative z-10 flex flex-col items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
                    {breathPhase === 'inhale' ? 'شهيق خفيف 🫁' : breathPhase === 'hold' ? 'احبس النفس ⏸️' : 'زفير بطيء 💨'}
                  </span>
                  <span className="text-4xl font-mono font-bold text-white mt-1">
                    {breathCountdown}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    الجولات المكتملة: {breathsCompleted}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    soundManager.playClick(soundEnabled);
                    setIsBreathingActive(!isBreathingActive);
                  }}
                  className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-transform active:scale-95 ${
                    isBreathingActive ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
                >
                  {isBreathingActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isBreathingActive ? 'إيقاف التمرين' : 'ابدأ جلسة التنفس الآن'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Burn Negative Thoughts */}
          {activeTab === 'burn' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-200">محرقة الأفكار والضغوط السلبية 🔥</h4>
                <p className="text-xs text-slate-400">
                  اكتب أي شيء مضايقك، زعلك، أو شاغل بالك بدون أي قيود، وبعدها احرقه ليتلاشى تماماً من عقلك.
                </p>
              </div>

              <div className="relative">
                <textarea
                  value={ventText}
                  onChange={(e) => setVentText(e.target.value)}
                  placeholder="فضفض هنا واكتب كل اللي خانقك ومضايقك بكل صراحة..."
                  rows={5}
                  disabled={isBurning}
                  className={`w-full bg-slate-950/80 border rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all ${
                    isBurning
                      ? 'border-rose-600 opacity-20 scale-95 blur-sm transition-all duration-1000'
                      : 'border-slate-700 focus:border-amber-500'
                  }`}
                />

                {isBurning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-xs rounded-xl text-rose-400 animate-pulse">
                    <Flame className="w-12 h-12 text-rose-500 animate-bounce" />
                    <span className="text-sm font-bold text-amber-300 mt-2">جاري حرق الهموم وتبديد طاقتها... 🔥</span>
                  </div>
                )}
              </div>

              {burnCompleted && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>تم حرق الفكرة والتخلص منها! عقلك الآن أنظف وأهدأ. استمر في يومك بثقة ✨</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  🔒 ملاحظة: النص لا يتم حفظه في أي مكان ويحذف نهائياً بمجرد حرقه.
                </span>

                <button
                  onClick={handleBurnThoughts}
                  disabled={!ventText.trim() || isBurning}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-950/50 transition-transform active:scale-95"
                >
                  <Flame className="w-4 h-4" />
                  <span>احرق هذه الفكرة للأبد! 🔥</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: Quick Funny / Refreshing Challenge */}
          {activeTab === 'challenge' && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-3xl">
                🎲
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-violet-400 bg-violet-950/60 border border-violet-800/50 px-3 py-1 rounded-full">
                  تحدي سريع لكسر الروتين
                </span>
                <div className="p-5 bg-slate-950/80 border border-violet-900/40 rounded-2xl max-w-md mx-auto">
                  <p className="text-base font-bold text-slate-100 leading-relaxed">
                    {randomChallenge}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={spinChallenge}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-violet-400" />
                  <span>تحدي تاني 😂</span>
                </button>

                <button
                  onClick={() => {
                    soundManager.playSuccess(soundEnabled);
                    try {
                      confetti({ particleCount: 70, spread: 70 });
                    } catch {}
                    if (onLogMoodActivity) onLogMoodActivity(`تحدي سريع: ${randomChallenge}`);
                    onClose();
                  }}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-violet-950/50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>قبلت التحدي ونفذته! 🚀</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: Gratitude & Aspirations */}
          {activeTab === 'gratitude' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-200">اكتب 3 حاجات نفسك تحققها أو ممتن ليها ✨</h4>
                <p className="text-xs text-slate-400">التركيز على النعم الصغيرة يعيد توجيه كيمياء الدماغ للإيجابية</p>
              </div>

              <div className="space-y-2.5">
                {[0, 1, 2].map((idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 p-2 rounded-xl">
                    <span className="w-6 h-6 rounded-lg bg-pink-500/20 text-pink-400 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={gratitudes[idx]}
                      onChange={(e) => {
                        const next = [...gratitudes];
                        next[idx] = e.target.value;
                        setGratitudes(next);
                      }}
                      placeholder={
                        idx === 0
                          ? 'نعمة أو شخص مقدر وجوده في حياتك...'
                          : idx === 1
                          ? 'هدف جميل متحمس توصله...'
                          : 'لحظة سعيدة عشتها مؤخراً...'
                      }
                      className="bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full"
                    />
                  </div>
                ))}
              </div>

              {gratitudeSaved && (
                <div className="p-2.5 bg-pink-950/50 border border-pink-800/50 rounded-xl text-xs text-pink-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-400 flex-shrink-0" />
                  <span>تم حفظ تدوينتك الملهمة بنجاح! شكراً لطاقتك الإيجابية ❤️</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    soundManager.playSuccess(soundEnabled);
                    setGratitudeSaved(true);
                    try {
                      confetti({ particleCount: 50, spread: 60 });
                    } catch {}
                    if (onLogMoodActivity) onLogMoodActivity('تدوين 3 نعم وأهداف ملهمة');
                  }}
                  disabled={!gratitudes.some(g => g.trim())}
                  className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-pink-950/50"
                >
                  <Heart className="w-4 h-4" />
                  <span>تأكيد وشحن الطاقة الإيجابية</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
