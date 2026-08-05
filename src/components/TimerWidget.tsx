import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Maximize2, Minimize2, BellRing, Clock, Timer as TimerIcon } from 'lucide-react';

export const TimerWidget: React.FC = () => {
  const [mode, setMode] = useState<'stopwatch' | 'countdown'>('countdown');
  const [timeInSeconds, setTimeInSeconds] = useState(3000); // Default 50 minutes (3000s)
  const [initialCountdown, setInitialCountdown] = useState(3000);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [alarmActive, setAlarmActive] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setTimeInSeconds(prev => {
          if (mode === 'stopwatch') {
            return prev + 1;
          } else {
            if (prev <= 1) {
              setIsRunning(false);
              setAlarmActive(true);
              return 0;
            }
            return prev - 1;
          }
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, mode]);

  const handleStartPause = () => {
    setAlarmActive(false);
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setAlarmActive(false);
    if (mode === 'countdown') {
      setTimeInSeconds(initialCountdown);
    } else {
      setTimeInSeconds(0);
    }
  };

  const handlePreset = (minutes: number) => {
    setIsRunning(false);
    setAlarmActive(false);
    setMode('countdown');
    const seconds = minutes * 60;
    setInitialCountdown(seconds);
    setTimeInSeconds(seconds);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Format MM:SS or HH:MM:SS
  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');

    if (hours > 0) {
      const formattedHours = String(hours).padStart(2, '0');
      return `${formattedHours}:${formattedMins}:${formattedSecs}`;
    }
    return `${formattedMins}:${formattedSecs}`;
  };

  return (
    <div 
      ref={containerRef}
      className={`relative rounded-[32px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/90 dark:border-slate-800 p-6 md:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col items-center justify-center transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none justify-center bg-slate-900/95 dark:bg-slate-950/95' : 'w-full'
      } ${alarmActive ? 'animate-pulse ring-4 ring-rose-500' : ''}`}
    >
      {/* Alarm Banner */}
      {alarmActive && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-rose-600 text-white font-bold text-sm shadow-xl animate-bounce">
          <BellRing className="w-5 h-5" />
          <span>시간이 종료되었습니다! 🔔</span>
        </div>
      )}

      {/* Mode & Fullscreen Controls */}
      <div className="w-full flex items-center justify-between mb-6">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold">
          <button
            onClick={() => {
              setMode('countdown');
              setIsRunning(false);
              setTimeInSeconds(initialCountdown);
            }}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              mode === 'countdown' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            카운트다운
          </button>
          <button
            onClick={() => {
              setMode('stopwatch');
              setIsRunning(false);
              setTimeInSeconds(0);
            }}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              mode === 'stopwatch' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            스톱워치
          </button>
        </div>

        <button
          onClick={toggleFullscreen}
          className="p-2.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 transition-all shadow-xs"
          title={isFullscreen ? '화면 축소' : '전체화면 모드'}
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Time Display */}
      <div className="my-4 text-center">
        <div className="font-mono text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
          {formatTime(timeInSeconds)}
        </div>
        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-2 tracking-wide uppercase">
          {mode === 'countdown' ? '수업 / 집중 타임 카운트다운' : '실시간 스톱워치 측정'}
        </p>
      </div>

      {/* Main Buttons */}
      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={handleStartPause}
          className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-lg transition-all active:scale-95 ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 dark:shadow-none'
          }`}
        >
          {isRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
          <span>{isRunning ? '일시정지' : '시작'}</span>
        </button>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm backdrop-blur-md border border-slate-200/80 dark:border-slate-700/60 shadow-xs transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>초기화</span>
        </button>
      </div>

      {/* Countdown Presets */}
      {mode === 'countdown' && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          <span className="text-xs text-slate-500 dark:text-slate-400 mr-1 font-medium">빠른 설정:</span>
          {[10, 25, 50, 60].map(mins => (
            <button
              key={mins}
              onClick={() => handlePreset(mins)}
              className="px-3.5 py-1.5 rounded-xl bg-white/60 dark:bg-slate-800/60 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-md transition-all shadow-xs"
            >
              {mins}분
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
