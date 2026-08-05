import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatKoreanDate } from '../lib/utils';
import { Clock, Calendar, CloudSun, Moon, Sun, Bell, LogOut, Shield, UserCheck, GraduationCap, X } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, logout, isDarkMode, toggleDarkMode, announcements, questions, homework } = useAuth();
  
  const [timeState, setTimeState] = useState(formatKoreanDate());
  const [showNotifications, setShowNotifications] = useState(false);

  // Real-time clock tick every 1 second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeState(formatKoreanDate());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const roleBadges = {
    admin: { label: '원장', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300', icon: Shield },
    teacher: { label: '선생님', bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-300', icon: UserCheck },
    student: { label: '학생', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300', icon: GraduationCap }
  };

  const roleInfo = currentUser ? roleBadges[currentUser.role] : roleBadges.student;
  const RoleIcon = roleInfo.icon;

  const unreadCount = announcements.length + questions.filter(q => q.status === 'pending').length;

  return (
    <header className="sticky top-0 z-30 w-full bg-white/70 dark:bg-slate-900/75 backdrop-blur-2xl border-b border-white/80 dark:border-slate-800/80 px-4 lg:px-8 py-3 transition-colors duration-300">
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Real-time Date, Clock & Weather Widget */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm">
          {/* Real-time Clock */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/80 dark:border-slate-700/50 text-slate-700 dark:text-slate-200 font-mono font-bold shadow-sm">
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{timeState.timeStr}</span>
          </div>

          {/* Today's Date */}
          <div className="hidden sm:flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{timeState.dateStr} ({timeState.dayOfWeek})</span>
          </div>

          {/* Weather Widget */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 backdrop-blur-md text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/50 text-xs shadow-sm">
            <CloudSun className="w-4 h-4 text-amber-500" />
            <span className="font-semibold">서울 27°C</span>
            <span className="hidden md:inline text-amber-600 dark:text-amber-400">☀️ 맑음</span>
          </div>
        </div>

        {/* Right: Notification, Theme, User Pill & Logout */}
        <div className="flex items-center gap-3">
          
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/80 dark:border-slate-700/60 hover:bg-white/90 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all shadow-sm"
              title="알림"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse shadow-md">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Modal */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-white/85 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/90 dark:border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100">실시간 학원 알림</span>
                  </div>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {questions.filter(q => q.status === 'pending').slice(0, 3).map(q => (
                    <div key={q.id} className="p-2.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-xs">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-bold mr-1.5">새 질문</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{q.studentName} 학생:</span> {q.title}
                    </div>
                  ))}

                  {announcements.slice(0, 3).map(ann => (
                    <div key={ann.id} className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold mr-1.5">공지</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{ann.title}</span>
                    </div>
                  ))}

                  {homework.slice(0, 2).map(hw => (
                    <div key={hw.id} className="p-2.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 text-xs">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold mr-1.5">숙제</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{hw.title}</span> (마감: {hw.dueDate})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/80 dark:border-slate-700/60 hover:bg-white/90 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all shadow-sm"
            title="테마 변경"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* User profile pill */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${roleInfo.bg}`}>
                  <RoleIcon className="w-3.5 h-3.5" />
                  <span>{roleInfo.label}</span>
                </span>
                <span className="hidden sm:inline font-bold text-sm text-slate-800 dark:text-slate-200">
                  {currentUser.name}
                </span>
              </div>

              {/* Logout button */}
              <button
                onClick={logout}
                className="p-2 rounded-2xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                title="로그아웃"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
