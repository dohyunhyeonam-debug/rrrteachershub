import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, Plus, Trash2, Calendar as CalendarIcon, Sparkles, X } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { calendarEvents, addCalendarEvent, deleteCalendarEvent, role } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'academy' | 'exam' | 'holiday' | 'homework' | 'birthday'>('academy');
  const [description, setDescription] = useState('');

  const typeColors = {
    academy: { label: '학원 일정', color: '#3b82f6', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
    exam: { label: '시험 일정', color: '#ef4444', bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
    holiday: { label: '공휴일', color: '#f59e0b', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
    homework: { label: '숙제 마감', color: '#10b981', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
    birthday: { label: '학생 생일', color: '#ec4899', bg: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300' },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    addCalendarEvent({
      title,
      date,
      type,
      description,
      color: typeColors[type].color
    });

    setShowAddModal(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 sm:p-8 rounded-[32px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-600" /> 학원 종합 캘린더
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            시험 일정, 학원 행사, 지정 휴관일, 과제 마감일 및 생일 종합 관리
          </p>
        </div>

        {role === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>일정 추가하기</span>
          </button>
        )}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {calendarEvents.map((ev) => {
          const info = typeColors[ev.type] || typeColors.academy;

          return (
            <div 
              key={ev.id}
              className="p-6 rounded-[32px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${info.bg}`}>
                    {info.label}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-500">{ev.date}</span>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white">{ev.title}</h3>
                {ev.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{ev.description}</p>
                )}
              </div>

              {role === 'admin' && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => deleteCalendarEvent(ev.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                    title="일정 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-indigo-600" /> 신규 일정 추가
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">일정 명칭 *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="예: 2학기 중간고사 대비 모의고사"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">일정 구분</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="academy">학원 일정</option>
                    <option value="exam">시험 일정</option>
                    <option value="holiday">공휴일</option>
                    <option value="homework">숙제 마감</option>
                    <option value="birthday">학생 생일</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">날짜 *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">상세 내용</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="일정 상세 정보를 입력하세요."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow"
                >
                  일정 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
