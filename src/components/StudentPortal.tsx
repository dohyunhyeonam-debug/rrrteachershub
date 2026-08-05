import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CalendarView } from './CalendarView';
import { HomeworkManagement } from './HomeworkManagement';
import { ChatQA } from './ChatQA';
import { 
  CalendarDays, BookOpenCheck, HelpCircle, GraduationCap, 
  UserCheck, Moon, Sun, LogOut, RefreshCw, Sparkles 
} from 'lucide-react';

export const StudentPortal: React.FC = () => {
  const { 
    currentUser, 
    logout, 
    switchDemoRole, 
    academySettings, 
    isDarkMode, 
    toggleDarkMode,
    students
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'calendar' | 'homework' | 'qa_chat'>('homework');

  const myStudentObj = students.find(s => s.id === currentUser?.studentId || s.loginId === currentUser?.loginId);
  const studentGradeClass = myStudentObj ? `${myStudentObj.grade} | ${myStudentObj.className}` : '중3 심화반';

  return (
    <div className="min-h-screen bg-slate-100/90 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col relative overflow-x-hidden transition-colors duration-300">
      {/* Background Decorative Ambient Blurs */}
      <div className="fixed top-[-10%] right-[-5%] w-[450px] h-[450px] bg-indigo-300/30 dark:bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[5%] w-[450px] h-[450px] bg-sky-300/30 dark:bg-sky-900/20 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Top Student Header */}
      <header className="sticky top-0 z-40 bg-white/75 dark:bg-slate-900/75 backdrop-blur-2xl border-b border-white/80 dark:border-slate-800 shadow-sm px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                {academySettings.name || '에듀플로우'}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                학생 전용 포털
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              내 캘린더 · 맞춤 숙제 · 선생님 1:1 질문 채팅
            </p>
          </div>
        </div>

        {/* Right: User Info & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Student Profile Chip */}
          <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-indigo-50/80 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700">
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {currentUser?.name?.slice(0, 1) || '학'}
            </div>
            <div className="text-left leading-tight">
              <span className="font-bold text-xs text-slate-900 dark:text-white block">
                {currentUser?.name || '김민준'} 학생
              </span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold block">
                {studentGradeClass}
              </span>
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer"
            title="다크모드 토글"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-all cursor-pointer"
            title="로그아웃"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">로그아웃</span>
          </button>
        </div>
      </header>

      {/* Main Student Navigation Bar (Centered 3-tab menu) */}
      <div className="z-10 max-w-7xl mx-auto w-full px-4 lg:px-8 pt-6">
        <div className="p-1.5 rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/80 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none flex items-center gap-2">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/25 scale-[1.01]'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>🗓️ 캘린더</span>
          </button>

          <button
            onClick={() => setActiveTab('homework')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'homework'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/25 scale-[1.01]'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpenCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>📚 숙제 관리</span>
          </button>

          <button
            onClick={() => setActiveTab('qa_chat')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'qa_chat'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/25 scale-[1.01]'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>💬 질문 채팅방</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full z-10">
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'homework' && <HomeworkManagement />}
        {activeTab === 'qa_chat' && <ChatQA />}
      </main>

      {/* Student Footer */}
      <footer className="z-10 border-t border-slate-200/60 dark:border-slate-800 py-4 text-center text-xs text-slate-400">
        {academySettings.name || '에듀플로우'} 학생 학습 지원 센터 · 문의: {academySettings.phone || '02-555-8209'}
      </footer>
    </div>
  );
};
