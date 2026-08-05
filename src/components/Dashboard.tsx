import React from 'react';
import { useAuth } from '../context/AuthContext';
import { TimerWidget } from './TimerWidget';
import { 
  Users, CalendarCheck, BookOpenCheck, HelpCircle, 
  CalendarDays, Bell, ArrowUpRight, GraduationCap, Clock 
} from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface DashboardProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const { 
    currentUser, 
    students, 
    attendance, 
    homework, 
    questions, 
    announcements, 
    calendarEvents,
    timetable 
  } = useAuth();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.date === todayStr);
  const presentCount = todayAttendance.filter(a => a.status === 'present').length;
  const attendanceRate = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  const pendingQuestionsCount = questions.filter(q => q.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 sm:p-8 rounded-[32px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50/80 dark:bg-indigo-950/60 backdrop-blur-md border border-indigo-100/60 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-2 shadow-sm">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>스마트 통합 학원 대시보드</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            반갑습니다, <span className="text-indigo-600 dark:text-indigo-400">{currentUser?.name}</span>님! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            오늘 학원 현황과 수업 일정, 공지사항을 한눈에 확인하세요.
          </p>
        </div>

        {/* Quick Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
          <div 
            onClick={() => setActiveTab('students')}
            className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-800/40 backdrop-blur-md border border-white/80 dark:border-slate-700/50 cursor-pointer hover:bg-white/80 dark:hover:bg-slate-800/60 hover:border-indigo-300 transition-all shadow-sm"
          >
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>전체 학생</span>
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">{students.length}명</div>
          </div>

          <div 
            onClick={() => setActiveTab('attendance')}
            className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-800/40 backdrop-blur-md border border-white/80 dark:border-slate-700/50 cursor-pointer hover:bg-white/80 dark:hover:bg-slate-800/60 hover:border-emerald-300 transition-all shadow-sm"
          >
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>오늘 출석률</span>
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">{attendanceRate}%</div>
          </div>

          <div 
            onClick={() => setActiveTab('homework')}
            className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-800/40 backdrop-blur-md border border-white/80 dark:border-slate-700/50 cursor-pointer hover:bg-white/80 dark:hover:bg-slate-800/60 hover:border-blue-300 transition-all shadow-sm"
          >
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <BookOpenCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>진행 숙제</span>
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">{homework.length}개</div>
          </div>

          <div 
            onClick={() => setActiveTab('qa_chat')}
            className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-800/40 backdrop-blur-md border border-white/80 dark:border-slate-700/50 cursor-pointer hover:bg-white/80 dark:hover:bg-slate-800/60 hover:border-amber-300 transition-all shadow-sm"
          >
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>답변 대기</span>
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">{pendingQuestionsCount}건</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Timer & Today Schedule + Calendar Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Center Timer + Today Class + Announcements */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Prominent Timer Widget */}
          <TimerWidget />

          {/* Today's Classes */}
          <div className="p-6 sm:p-8 rounded-[32px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h2 className="font-bold text-base text-slate-900 dark:text-white">오늘의 학원 수업 시간표</h2>
              </div>
              <button 
                onClick={() => setActiveTab('timetable')}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 hover:underline"
              >
                전체 시간표보기 <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {timetable.slice(0, 4).map((slot) => (
                <div 
                  key={slot.id} 
                  className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/40 backdrop-blur-md border border-white/80 dark:border-slate-700/50 flex items-center justify-between shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                      <span>{slot.day}요일</span>
                      <span>{slot.startTime} ~ {slot.endTime}</span>
                    </div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{slot.subject} ({slot.className})</div>
                    <div className="text-xs text-slate-500 mt-0.5">{slot.teacherName} | {slot.room}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-indigo-100/80 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 text-xs font-bold shadow-xs">
                    수강
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Announcements */}
          <div className="p-6 sm:p-8 rounded-[32px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-base text-slate-900 dark:text-white">최신 공지사항</h2>
              </div>
              <button 
                onClick={() => setActiveTab('announcements')}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 hover:underline"
              >
                공지 전체보기 <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {announcements.slice(0, 3).map((ann) => (
                <div 
                  key={ann.id}
                  onClick={() => setActiveTab('announcements')}
                  className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/40 backdrop-blur-md border border-white/80 dark:border-slate-700/50 cursor-pointer hover:bg-white/80 dark:hover:bg-slate-800/60 transition-all flex items-start justify-between gap-3 shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {ann.isPinned && (
                        <span className="px-2 py-0.5 rounded bg-rose-100/80 text-rose-700 text-[10px] font-extrabold shadow-xs">고정</span>
                      )}
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{ann.title}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{ann.content}</p>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {ann.createdAt.split('T')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Column: Calendar & Academy Schedule Panel */}
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-[32px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-indigo-600" />
                <h2 className="font-bold text-base text-slate-900 dark:text-white">학원 캘린더 & 시험 일정</h2>
              </div>
              <button 
                onClick={() => setActiveTab('calendar')}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 hover:underline"
              >
                캘린더 보기 <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List of upcoming events */}
            <div className="space-y-3">
              {calendarEvents.map((ev) => (
                <div key={ev.id} className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-800/40 backdrop-blur-md border border-white/80 dark:border-slate-700/50 shadow-sm">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{ev.date}</span>
                    <span 
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-xs"
                      style={{ backgroundColor: ev.color || '#3b82f6' }}
                    >
                      {ev.type === 'exam' ? '시험' : ev.type === 'holiday' ? '공휴일' : ev.type === 'homework' ? '숙제마감' : '학원일정'}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">{ev.title}</div>
                  {ev.description && (
                    <div className="text-xs text-slate-500 mt-1">{ev.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
