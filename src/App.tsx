import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { StudentManagement } from './components/StudentManagement';
import { AttendanceManagement } from './components/AttendanceManagement';
import { HomeworkManagement } from './components/HomeworkManagement';
import { ProgressManagement } from './components/ProgressManagement';
import { TimetableManagement } from './components/TimetableManagement';
import { ChatTeacher } from './components/ChatTeacher';
import { ChatQA } from './components/ChatQA';
import { Announcements } from './components/Announcements';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { SystemSettings } from './components/SystemSettings';
import { StudentPortal } from './components/StudentPortal';
import { Menu } from 'lucide-react';

function AppContent() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!currentUser) {
    return <Login />;
  }

  // Separate dedicated Student View
  if (currentUser.role === 'student') {
    return <StudentPortal />;
  }

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex relative overflow-x-hidden transition-colors duration-300">
      {/* Frosted Glass Ambient Decorative Orbs */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-300/30 dark:bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-sky-300/30 dark:bg-sky-900/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-[40%] left-[40%] w-[350px] h-[350px] bg-purple-300/20 dark:bg-purple-900/10 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Collapsible Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 z-10">
        
        {/* Mobile Header Trigger & Header */}
        <div className="flex items-center">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-3 lg:hidden text-slate-600 dark:text-slate-300 hover:text-slate-900"
            title="메뉴 열기"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <Header />
        </div>

        {/* Page Content View */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full transition-all">
          {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
          {activeTab === 'students' && <StudentManagement />}
          {activeTab === 'attendance' && <AttendanceManagement />}
          {activeTab === 'homework' && <HomeworkManagement />}
          {activeTab === 'progress' && <ProgressManagement />}
          {activeTab === 'timetable' && <TimetableManagement />}
          {activeTab === 'teacher_chat' && <ChatTeacher />}
          {activeTab === 'qa_chat' && <ChatQA />}
          {activeTab === 'announcements' && <Announcements />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'settings' && <SystemSettings />}
        </main>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
