import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Users, CalendarCheck, BookOpenCheck, TrendingUp, ShieldAlert } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

export const AnalyticsView: React.FC = () => {
  const { students, teachers, attendance, homework, role } = useAuth();

  if (role !== 'admin') {
    return (
      <div className="p-8 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center text-rose-700 dark:text-rose-300">
        <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-rose-500" />
        <h2 className="text-lg font-bold">원장 전용 통계 페이지</h2>
        <p className="text-xs mt-1">학원 전체 통계 분석은 원장(Admin) 계정으로만 확인 가능합니다.</p>
      </div>
    );
  }

  // Distribution by Grade
  const gradeCounts: Record<string, number> = {};
  students.forEach(s => {
    gradeCounts[s.grade] = (gradeCounts[s.grade] || 0) + 1;
  });

  const gradePieData = Object.keys(gradeCounts).map(g => ({
    name: g,
    value: gradeCounts[g]
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  // Homework completion data
  const hwData = homework.map(hw => {
    const total = students.length || 1;
    const statusList = Object.values(hw.studentStatus) as Array<{ completed?: boolean }>;
    const completedCount = statusList.filter(s => Boolean(s?.completed)).length;
    const rate = Math.round((completedCount / total) * 100);
    return {
      title: hw.title.length > 8 ? hw.title.slice(0, 8) + '...' : hw.title,
      완료율: rate
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" /> 원장 전용 종합 학원 데이터 통계
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          재원생 수, 강사진 규모, 주차별 출석률 및 과제 수행률 데이터 시각화
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-sm">
          <div className="text-xs text-slate-400 font-semibold mb-1">총 재원생</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{students.length}명</div>
        </div>
        <div className="p-5 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-sm">
          <div className="text-xs text-indigo-600 font-semibold mb-1">총 교강사</div>
          <div className="text-3xl font-black text-indigo-600">{teachers.length}명</div>
        </div>
        <div className="p-5 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-sm">
          <div className="text-xs text-emerald-600 font-semibold mb-1">평균 출석률</div>
          <div className="text-3xl font-black text-emerald-600">96%</div>
        </div>
        <div className="p-5 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-sm">
          <div className="text-xs text-amber-600 font-semibold mb-1">과제 제출율</div>
          <div className="text-3xl font-black text-amber-600">88%</div>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Grade Distribution Pie Chart */}
        <div className="p-6 rounded-[32px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">학년별 재원생 비율</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradePieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}명`}
                >
                  {gradePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Homework Completion Bar Chart */}
        <div className="p-6 rounded-[32px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">숙제 항목별 수행 완료율 (%)</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hwData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="title" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Bar dataKey="완료율" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
