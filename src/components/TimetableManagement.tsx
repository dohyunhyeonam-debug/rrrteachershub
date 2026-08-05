import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TimetableSlot } from '../types';
import { 
  CalendarDays, Clock, User, Plus, Pencil, Trash2, 
  Lock, Shield, X, Check, BookOpen 
} from 'lucide-react';

export const TimetableManagement: React.FC = () => {
  const { 
    timetable, 
    currentUser, 
    addTimetableSlot, 
    updateTimetableSlot, 
    deleteTimetableSlot,
    teachers 
  } = useAuth();

  const [filterDay, setFilterDay] = useState<'전체' | '월' | '화' | '수' | '목' | '금' | '토' | '일'>('전체');
  const daysList: ('월' | '화' | '수' | '목' | '금' | '토' | '일')[] = ['월', '화', '수', '목', '금', '토', '일'];

  const isAdmin = currentUser?.role === 'admin';

  // Add Slot Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [day, setDay] = useState<'월' | '화' | '수' | '목' | '금' | '토' | '일'>('월');
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('18:00');
  const [subject, setSubject] = useState('수학');
  const [className, setClassName] = useState('중3 심화반');
  const [teacherName, setTeacherName] = useState('박도현');
  const [room, setRoom] = useState('301호');

  // Edit Slot Modal State
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [editDay, setEditDay] = useState<'월' | '화' | '수' | '목' | '금' | '토' | '일'>('월');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editClassName, setEditClassName] = useState('');
  const [editTeacherName, setEditTeacherName] = useState('');
  const [editRoom, setEditRoom] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('주간 수업 시간표 수정 및 등록 권한은 원장 전용입니다.');
      return;
    }
    if (!subject.trim() || !className.trim()) {
      alert('과목명과 반 이름을 입력하세요.');
      return;
    }

    addTimetableSlot({
      day,
      startTime,
      endTime,
      subject: subject.trim(),
      className: className.trim(),
      teacherName: teacherName.trim(),
      room: room.trim()
    });

    setShowAddModal(false);
    alert(`${day}요일 ${subject}(${className}) 수업 시간표가 등록되었습니다.`);
  };

  const openEditModal = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setEditDay(slot.day);
    setEditStartTime(slot.startTime);
    setEditEndTime(slot.endTime);
    setEditSubject(slot.subject);
    setEditClassName(slot.className);
    setEditTeacherName(slot.teacherName);
    setEditRoom(slot.room || '');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !editingSlot) return;

    updateTimetableSlot(editingSlot.id, {
      day: editDay,
      startTime: editStartTime,
      endTime: editEndTime,
      subject: editSubject.trim(),
      className: editClassName.trim(),
      teacherName: editTeacherName.trim(),
      room: editRoom.trim()
    });

    setEditingSlot(null);
    alert('시간표 정보가 성공적으로 수정되었습니다.');
  };

  const handleDeleteSlot = (slot: TimetableSlot) => {
    if (!isAdmin) {
      alert('주간 수업 시간표 삭제 권한은 원장 전용입니다.');
      return;
    }
    if (window.confirm(`'${slot.day}요일 ${slot.subject}(${slot.className})' 시간표 항목을 삭제하시겠습니까?`)) {
      deleteTimetableSlot(slot.id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 sm:p-8 rounded-[32px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-600" /> 주간 학원 수업 시간표
            </h1>
            {isAdmin ? (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-300 flex items-center gap-1">
                <Shield className="w-3 h-3" /> 원장 전용 수정 가능
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-xs border border-slate-300 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" /> 원장 전용 수정 (조회 전용)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAdmin 
              ? '원장 전용: 학원 전체 요일별 강의 시간, 과목, 강사진 및 강의실 배치 등록/수정/삭제'
              : '주간 학원 수업 시간표는 원장 계정에서만 변경 및 관리가 가능합니다.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Day Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/60">
            <button
              onClick={() => setFilterDay('전체')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                filterDay === '전체' ? 'bg-indigo-600 text-white shadow shadow-indigo-200 dark:shadow-none' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              전체
            </button>
            {daysList.map(d => (
              <button
                key={d}
                onClick={() => setFilterDay(d)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  filterDay === d ? 'bg-indigo-600 text-white shadow shadow-indigo-200 dark:shadow-none' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Director Only Add Timetable Button */}
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>시간표 등록</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid view by Day */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(filterDay === '전체' ? daysList : [filterDay]).map((day) => {
          const daySlots = timetable.filter(s => s.day === day);

          return (
            <div key={day} className="p-6 rounded-[32px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
                <span className="font-extrabold text-base text-indigo-600 dark:text-indigo-400">{day}요일 수업</span>
                <span className="text-xs text-slate-400 font-semibold">{daySlots.length}개 강좌</span>
              </div>

              {daySlots.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  해당 요일에 예정된 수업이 없습니다.
                </div>
              ) : (
                <div className="space-y-3">
                  {daySlots.map(slot => (
                    <div 
                      key={slot.id} 
                      className="p-4 rounded-2xl bg-white/50 dark:bg-indigo-950/40 backdrop-blur-md border border-white/80 dark:border-indigo-900/50 space-y-2 shadow-xs group relative"
                    >
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          {slot.startTime} ~ {slot.endTime}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100 text-[10px] font-bold">
                            {slot.room || '강의실'}
                          </span>

                          {/* Director Only Edit & Delete Controls */}
                          {isAdmin && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditModal(slot)}
                                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded cursor-pointer"
                                title="시간표 수정"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteSlot(slot)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded cursor-pointer"
                                title="시간표 삭제"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {slot.subject} ({slot.className})
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        <span>담당: {slot.teacherName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Slot Modal (Director Only) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" /> 신규 수업 시간표 추가 (원장 전용)
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">요일 *</label>
                  <select
                    value={day}
                    onChange={e => setDay(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold focus:outline-none"
                  >
                    {daysList.map(d => (
                      <option key={d} value={d}>{d}요일</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">과목 *</label>
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold focus:outline-none"
                  >
                    <option value="수학">수학</option>
                    <option value="영어">영어</option>
                    <option value="국어">국어</option>
                    <option value="과학">과학</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">시작 시간</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">종료 시간</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">학급 / 반 이름 *</label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={e => setClassName(e.target.value)}
                  placeholder="예: 중3 심화반, 고1 정시반"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">담당 교사</label>
                  <input
                    type="text"
                    required
                    value={teacherName}
                    onChange={e => setTeacherName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">배정 강의실</label>
                  <input
                    type="text"
                    value={room}
                    onChange={e => setRoom(e.target.value)}
                    placeholder="301호"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow cursor-pointer"
                >
                  시간표 등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Slot Modal (Director Only) */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Pencil className="w-5 h-5 text-indigo-600" /> 시간표 내용 수정 (원장 전용)
              </h2>
              <button onClick={() => setEditingSlot(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">요일 *</label>
                  <select
                    value={editDay}
                    onChange={e => setEditDay(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold focus:outline-none"
                  >
                    {daysList.map(d => (
                      <option key={d} value={d}>{d}요일</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">과목 *</label>
                  <select
                    value={editSubject}
                    onChange={e => setEditSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold focus:outline-none"
                  >
                    <option value="수학">수학</option>
                    <option value="영어">영어</option>
                    <option value="국어">국어</option>
                    <option value="과학">과학</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">시작 시간</label>
                  <input
                    type="time"
                    required
                    value={editStartTime}
                    onChange={e => setEditStartTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">종료 시간</label>
                  <input
                    type="time"
                    required
                    value={editEndTime}
                    onChange={e => setEditEndTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">학급 / 반 이름 *</label>
                <input
                  type="text"
                  required
                  value={editClassName}
                  onChange={e => setEditClassName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">담당 교사</label>
                  <input
                    type="text"
                    required
                    value={editTeacherName}
                    onChange={e => setEditTeacherName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">배정 강의실</label>
                  <input
                    type="text"
                    value={editRoom}
                    onChange={e => setEditRoom(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow cursor-pointer"
                >
                  변경사항 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
