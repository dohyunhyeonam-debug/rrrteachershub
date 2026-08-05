import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, Plus, BookOpen, CheckCircle, Clock, 
  History, Sparkles, Filter, X, ChevronRight 
} from 'lucide-react';

export const ProgressManagement: React.FC = () => {
  const { students, progress, addProgress, currentUser } = useAuth();

  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || 's1');
  const [selectedSubject, setSelectedSubject] = useState('수학');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form
  const [textbook, setTextbook] = useState('RPM 3-2');
  const [unit, setUnit] = useState('5단원 삼각비의 활용');
  const [page, setPage] = useState('p.80 ~ p.90');
  const [status, setStatus] = useState<'completed' | 'in_progress'>('completed');
  const [note, setNote] = useState('공식 암기 테스트 완료');

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const studentProgressList = progress.filter(p => p.studentId === selectedStudentId);

  const handleSubmitProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    addProgress({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      subject: selectedSubject,
      textbook,
      unit,
      page,
      status,
      note
    });

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 sm:p-8 rounded-[32px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" /> 학생 교재 및 진도 관리
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            학생별, 과목별 교재 진도 입력, 단원/페이지 기록 및 자동 히스토리 관리
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>진도 입력하기</span>
        </button>
      </div>

      {/* Student Selector Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500">학생 선택:</span>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="px-4 py-2 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/80 dark:border-slate-700 font-bold text-xs text-slate-900 dark:text-white focus:outline-none"
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.school} / {s.grade})</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">과목:</span>
          {['수학', '영어'].map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedSubject === sub
                  ? 'bg-indigo-600 text-white shadow shadow-indigo-200 dark:shadow-none'
                  : 'bg-white/50 dark:bg-slate-800/50 backdrop-blur-md text-slate-600 dark:text-slate-400'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Progress History Timeline */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <span>{selectedStudent?.name} 학생 진도 기록 히스토리</span>
          </h3>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-xl">
            {selectedSubject} 과목
          </span>
        </div>

        <div className="space-y-4 relative before:absolute before:top-3 before:bottom-3 before:left-4 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {studentProgressList
            .filter(p => p.subject === selectedSubject)
            .map((item) => (
              <div key={item.id} className="relative pl-9 space-y-1">
                <div className="absolute left-2 top-1.5 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-950" />
                
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{item.textbook}</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-semibold text-[11px]">
                        {item.unit}
                      </span>
                      <span className="font-mono text-slate-500">{item.page}</span>
                    </div>

                    {item.note && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{item.note}</p>
                    )}
                    <div className="text-[11px] text-slate-400 pt-1">
                      기록자: {item.updatedBy} | {item.date}
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-xl font-bold text-xs ${
                    item.status === 'completed' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {item.status === 'completed' ? '완료 ✓' : '진행중'}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Add Progress Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" /> 진도 기록 추가
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProgress} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">대상 학생</label>
                <input
                  type="text"
                  disabled
                  value={`${selectedStudent?.name} (${selectedStudent?.className})`}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-700 dark:text-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">과목</label>
                  <select
                    value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="수학">수학</option>
                    <option value="영어">영어</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">교재명</label>
                  <input
                    type="text"
                    required
                    value={textbook}
                    onChange={e => setTextbook(e.target.value)}
                    placeholder="RPM 3-2"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">단원명</label>
                <input
                  type="text"
                  required
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  placeholder="5단원 삼각비의 활용"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">페이지 범위</label>
                  <input
                    type="text"
                    required
                    value={page}
                    onChange={e => setPage(e.target.value)}
                    placeholder="p.80 ~ p.90"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">진도 상태</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="completed">완료</option>
                    <option value="in_progress">진행중</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">선생님 코멘트 / 메모</label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="특이사항이나 보완할 점 기록"
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
                  진도 저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
