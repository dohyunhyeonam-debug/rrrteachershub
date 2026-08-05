import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, CalendarCheck, BookOpenCheck, TrendingUp, 
  CalendarDays, MessageSquare, HelpCircle, Bell, BarChart3, Settings, 
  GraduationCap, ChevronRight, Sparkles 
} from 'lucide-react';

export type ActiveTab = 
  | 'dashboard' 
  | 'students' 
  | 'attendance' 
  | 'homework' 
  | 'progress' 
  | 'timetable' 
  | 'teacher_chat' 
  | 'qa_chat' 
  | 'announcements' 
  | 'calendar' 
  | 'analytics' 
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isMobileOpen, 
  setIsMobileOpen 
}) => {
  const { role, academySettings } = useAuth();

  const allNavItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student'] },
    { id: 'students' as ActiveTab, label: '학생 관리 Center', icon: Users, roles: ['admin'] },
    { id: 'attendance' as ActiveTab, label: '출결 관리', icon: CalendarCheck, roles: ['admin', 'teacher', 'student'] },
    { id: 'homework' as ActiveTab, label: '숙제 관리', icon: BookOpenCheck, roles: ['admin', 'teacher', 'student'] },
    { id: 'progress' as ActiveTab, label: '진도 관리', icon: TrendingUp, roles: ['admin', 'teacher'] },
    { id: 'timetable' as ActiveTab, label: '시간표', icon: CalendarDays, roles: ['admin', 'teacher', 'student'] },
    { id: 'teacher_chat' as ActiveTab, label: '선생님 채널', icon: MessageSquare, roles: ['admin', 'teacher'] },
    { id: 'qa_chat' as ActiveTab, label: '학생 질문 채널', icon: HelpCircle, roles: ['admin', 'teacher', 'student'] },
    { id: 'announcements' as ActiveTab, label: '공지사항', icon: Bell, roles: ['admin', 'teacher', 'student'] },
    { id: 'calendar' as ActiveTab, label: '캘린더', icon: CalendarDays, roles: ['admin', 'teacher', 'student'] },
    { id: 'analytics' as ActiveTab, label: '통계 분석', icon: BarChart3, roles: ['admin'] },
    { id: 'settings' as ActiveTab, label: '시스템 설정', icon: Settings, roles: ['admin'] },
  ];

  const visibleItems = allNavItems.filter(item => role && item.roles.includes(role));

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white/70 dark:bg-slate-900/75 backdrop-blur-2xl border-r border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between p-4 transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 px-3 py-4 mb-4 border-b border-white/60 dark:border-slate-800">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                {academySettings.name || 'RalRalRal Class'}
              </h2>
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3 h-3" /> EduFlow v2.5
              </span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {visibleItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600/90 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none backdrop-blur-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer info */}
        <div className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-800/40 backdrop-blur-md border border-white/80 dark:border-slate-700/50 text-[11px] text-slate-500 dark:text-slate-400 shadow-sm">
          <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">학원 문의 & 지원</p>
          <p>{academySettings.phone || '02-555-8209'}</p>
          <p className="truncate text-[10px] text-slate-400 mt-1">{academySettings.address}</p>
        </div>
      </aside>
    </>
  );
};
