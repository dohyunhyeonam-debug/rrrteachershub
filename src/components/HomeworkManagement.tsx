import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Homework } from '../types';
import { 
  BookOpenCheck, Plus, CheckSquare, Square, Calendar, 
  FileText, Check, AlertCircle, Sparkles, User, Filter, X,
  Pencil, Trash2, ShieldCheck, UserCheck
} from 'lucide-react';

export const HomeworkManagement: React.FC = () => {
  const { 
    homework, 
    addHomework, 
    updateHomework,
    deleteHomework,
    toggleHomeworkChecklist, 
    toggleStudentHomeworkComplete, 
    currentUser, 
    students 
  } = useAuth();

  const [filterSubject, setFilterSubject] = useState('전체');
  const [filterTarget, setFilterTarget] = useState<'all' | 'class' | 'student' | 'everything'>('everything');
  
  // Create Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('수학');
  const [targetType, setTargetType] = useState<'all' | 'class' | 'student'>('class');
  const [targetValue, setTargetValue] = useState('중3 심화반');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [checklistsText, setChecklistsText] = useState('오답노트 작성\n개념 요약 제출');

  // Edit Modal
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editTargetType, setEditTargetType] = useState<'all' | 'class' | 'student'>('class');
  const [editTargetValue, setEditTargetValue] = useState('');
  const [editSelectedStudentId, setEditSelectedStudentId] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editChecklistsText, setEditChecklistsText] = useState('');

  const isAdmin = currentUser?.role === 'admin';
  const isStudent = currentUser?.role === 'student';
  const myStudentId = currentUser?.studentId || 's1';

  // Filter logic
  const filteredHomework = homework.filter(h => {
    if (filterSubject !== '전체' && h.subject !== filterSubject) return false;
    if (filterTarget !== 'everything' && h.targetType !== filterTarget) return false;

    // If student, filter for relevant homework only
    if (isStudent) {
      const myStudentObj = students.find(s => s.id === myStudentId || s.loginId === currentUser?.loginId);
      const studentClass = myStudentObj?.className || '중3 심화반';
      const studentName = myStudentObj?.name || currentUser?.name;

      if (h.targetType === 'all') return true;
      if (h.targetType === 'class' && (h.targetValue === studentClass || h.targetValue === '전체')) return true;
      if (h.targetType === 'student' && (h.targetValue === myStudentId || h.targetStudentName === studentName || h.targetValue === studentName)) return true;
      return false;
    }

    return true;
  });

  const handleSubmitNewHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      alert('숙제 제목과 마감일을 입력하세요.');
      return;
    }

    let finalTargetVal = targetValue;
    let targetStudentName: string | undefined = undefined;

    if (targetType === 'student') {
      const targetStudent = students.find(s => s.id === selectedStudentId);
      if (targetStudent) {
        finalTargetVal = targetStudent.name;
        targetStudentName = targetStudent.name;
      } else if (!selectedStudentId && students.length > 0) {
        finalTargetVal = students[0].name;
        targetStudentName = students[0].name;
      }
    } else if (targetType === 'all') {
      finalTargetVal = '전체 학생';
    }

    const checklists = checklistsText
      .split('\n')
      .map((text, idx) => ({ id: `chk_${Date.now()}_${idx}`, text: text.trim(), completed: false }))
      .filter(item => item.text.length > 0);

    addHomework({
      title: title.trim(),
      subject,
      targetType,
      targetValue: finalTargetVal,
      targetStudentName,
      description: description.trim(),
      dueDate,
      checklists
    });

    setShowAddModal(false);
    setTitle('');
    setDescription('');
  };

  const openEditModal = (hw: Homework) => {
    setEditingHomework(hw);
    setEditTitle(hw.title);
    setEditSubject(hw.subject);
    setEditTargetType(hw.targetType);
    setEditTargetValue(hw.targetValue);
    setEditDescription(hw.description);
    setEditDueDate(hw.dueDate);
    setEditChecklistsText(hw.checklists.map(c => c.text).join('\n'));

    const matchStudent = students.find(s => s.name === hw.targetValue || s.id === hw.targetValue);
    setEditSelectedStudentId(matchStudent ? matchStudent.id : (students[0]?.id || ''));
  };

  const handleUpdateHomeworkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHomework || !editTitle.trim() || !editDueDate) return;

    let finalTargetVal = editTargetValue;
    let targetStudentName: string | undefined = undefined;

    if (editTargetType === 'student') {
      const targetStudent = students.find(s => s.id === editSelectedStudentId);
      if (targetStudent) {
        finalTargetVal = targetStudent.name;
        targetStudentName = targetStudent.name;
      }
    } else if (editTargetType === 'all') {
      finalTargetVal = '전체 학생';
    }

    const checklists = editChecklistsText
      .split('\n')
      .map((text, idx) => ({ id: `chk_${Date.now()}_${idx}`, text: text.trim(), completed: false }))
      .filter(item => item.text.length > 0);

    updateHomework(editingHomework.id, {
      title: editTitle.trim(),
      subject: editSubject,
      targetType: editTargetType,
      targetValue: finalTargetVal,
      targetStudentName,
      description: editDescription.trim(),
      dueDate: editDueDate,
      checklists
    });

    setEditingHomework(null);
    alert('숙제가 성공적으로 수정되었습니다.');
  };

  const handleDeleteHomework = (hw: Homework) => {
    if (window.confirm(`'${hw.title}' 숙제를 삭제하시겠습니까?`)) {
      deleteHomework(hw.id);
    }
  };

  // Director Complete & Immediate Delete Action
  const handleDirectorCompleteClick = (hw: Homework) => {
    if (window.confirm(`[원장 확인] '${hw.title}' 숙제를 모든 학생들이 완료한 것으로 검수 처리하고 바로 삭제하시겠습니까?`)) {
      deleteHomework(hw.id);
      alert(`'${hw.title}' 숙제가 원장 검수 완료되어 자동 삭제되었습니다.`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 sm:p-8 rounded-[32px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpenCheck className="w-5 h-5 text-indigo-600" /> 과제 및 숙제 관리
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAdmin 
              ? '원장 계정: 학생 개별/반별 맞춤 숙제 부여, 수정, 삭제 및 완료 시 자동 삭제 기능'
              : '과목별/반별 및 학생 개인별 맞춤 숙제 부여, 마감일 및 제출 현황 관리'}
          </p>
        </div>

        {!isStudent && (
          <button
            onClick={() => {
              setShowAddModal(true);
              if (students.length > 0) setSelectedStudentId(students[0].id);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>신규 숙제 등록</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">과목:</span>
          {['전체', '수학', '영어'].map(sub => (
            <button
              key={sub}
              onClick={() => setFilterSubject(sub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterSubject === sub
                  ? 'bg-indigo-600 text-white shadow shadow-indigo-200 dark:shadow-none'
                  : 'bg-white/50 dark:bg-slate-800/50 backdrop-blur-md text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              {sub}
            </button>
          ))}

          {!isStudent && (
            <>
              <span className="text-slate-300 dark:text-slate-700 mx-1">|</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">부여 대상:</span>
              {[
                { id: 'everything', label: '전체 보기' },
                { id: 'student', label: '👤 학생 개인' },
                { id: 'class', label: '🏫 학급/반' },
                { id: 'all', label: '🌐 전체 대상' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setFilterTarget(t.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterTarget === t.id
                      ? 'bg-indigo-600 text-white shadow shadow-indigo-200 dark:shadow-none'
                      : 'bg-white/50 dark:bg-slate-800/50 backdrop-blur-md text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </>
          )}
        </div>

        <div className="text-xs text-slate-400 font-medium">
          총 <span className="font-bold text-indigo-600 dark:text-indigo-400">{filteredHomework.length}</span>개의 숙제
        </div>
      </div>

      {/* Homework Cards Grid */}
      {filteredHomework.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800">
          <BookOpenCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-500">등록되었거나 조건에 맞는 숙제가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredHomework.map((hw) => {
            const studentStat = hw.studentStatus[myStudentId] || { completed: false };

            return (
              <div 
                key={hw.id}
                className="p-6 rounded-[32px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-4 flex flex-col justify-between relative group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50/80 dark:bg-indigo-950 backdrop-blur-md text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                        {hw.subject}
                      </span>
                      
                      {/* Target Type Badge */}
                      {hw.targetType === 'student' ? (
                        <span className="px-2.5 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold text-[11px] border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                          <User className="w-3 h-3" /> 개인: {hw.targetValue}
                        </span>
                      ) : hw.targetType === 'class' ? (
                        <span className="px-2.5 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 font-semibold text-[11px] border border-sky-200 dark:border-sky-800">
                          반: {hw.targetValue}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] border border-emerald-200 dark:border-emerald-800">
                          전체 학생
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-500 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-rose-500" />
                        <span>마감: {hw.dueDate}</span>
                      </div>

                      {/* Edit / Delete Buttons for Admin & Teacher */}
                      {!isStudent && (
                        <div className="flex items-center gap-1 pl-1">
                          <button
                            onClick={() => openEditModal(hw)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                            title="숙제 수정"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteHomework(hw)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="숙제 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{hw.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{hw.description}</p>

                  {/* Checklist */}
                  {hw.checklists.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-800/40 backdrop-blur-md border border-white/80 dark:border-slate-700/50 space-y-2 text-xs shadow-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">체크리스트:</span>
                      {hw.checklists.map((chk, idx) => (
                        <div 
                          key={chk.id} 
                          onClick={() => toggleHomeworkChecklist(hw.id, idx)}
                          className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300 hover:text-indigo-600"
                        >
                          {chk.completed ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <span className={chk.completed ? 'line-through text-slate-400' : ''}>{chk.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Bar Action */}
                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400">
                    작성: <span className="font-semibold text-slate-700 dark:text-slate-300">{hw.createdByName}</span>
                  </div>

                  {isAdmin ? (
                    /* Director Complete & Auto-Delete Button */
                    <button
                      type="button"
                      onClick={() => handleDirectorCompleteClick(hw)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all cursor-pointer"
                      title="원장 검수 완료 클릭 시 완료 처리 및 데이터가 즉시 자동 삭제됩니다."
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>완료 체크 (자동 삭제)</span>
                    </button>
                  ) : (
                    /* Regular Student / Teacher Completion Toggle */
                    <button
                      type="button"
                      onClick={() => toggleStudentHomeworkComplete(hw.id, myStudentId)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                        studentStat.completed
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                          : 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>{studentStat.completed ? '숙제 완료됨 ✓' : '완료 체크하기'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Homework Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpenCheck className="w-5 h-5 text-indigo-600" /> 신규 과제 출제
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewHomework} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">숙제 제목 *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="예: 삼각비 C단계 오답노트 작성"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">과목</label>
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  >
                    <option value="수학">수학</option>
                    <option value="영어">영어</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">제출 마감일</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              {/* Target Type Selector */}
              <div>
                <label className="block font-semibold mb-1">숙제 부여 방식</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setTargetType('student')}
                    className={`py-1.5 rounded-xl font-bold transition-all ${
                      targetType === 'student' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    👤 학생 개인
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetType('class')}
                    className={`py-1.5 rounded-xl font-bold transition-all ${
                      targetType === 'class' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    🏫 반별
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetType('all')}
                    className={`py-1.5 rounded-xl font-bold transition-all ${
                      targetType === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    🌐 전체 학생
                  </button>
                </div>
              </div>

              {/* Target Value Input or Student Selection */}
              {targetType === 'student' ? (
                <div>
                  <label className="block font-semibold mb-1">대상 학생 선택 *</label>
                  <select
                    value={selectedStudentId}
                    onChange={e => setSelectedStudentId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold focus:outline-none"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.grade} | {s.className})
                      </option>
                    ))}
                  </select>
                </div>
              ) : targetType === 'class' ? (
                <div>
                  <label className="block font-semibold mb-1">대상 학급 / 반 이름</label>
                  <input
                    type="text"
                    value={targetValue}
                    onChange={e => setTargetValue(e.target.value)}
                    placeholder="중3 심화반"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
              ) : null}

              <div>
                <label className="block font-semibold mb-1">숙제 상세 안내</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="풀이과정을 명확하게 적고 틀린 이유를 기록하세요."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">체크리스트 항목 (줄바꿈 구분)</label>
                <textarea
                  rows={2}
                  value={checklistsText}
                  onChange={e => setChecklistsText(e.target.value)}
                  placeholder="항목1&#10;항목2"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow cursor-pointer"
                >
                  숙제 출제하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Homework Modal */}
      {editingHomework && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Pencil className="w-5 h-5 text-indigo-600" /> 숙제 내용 수정
              </h2>
              <button onClick={() => setEditingHomework(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateHomeworkSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">숙제 제목 *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">과목</label>
                  <select
                    value={editSubject}
                    onChange={e => setEditSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  >
                    <option value="수학">수학</option>
                    <option value="영어">영어</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">제출 마감일</label>
                  <input
                    type="date"
                    required
                    value={editDueDate}
                    onChange={e => setEditDueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              {/* Edit Target Type */}
              <div>
                <label className="block font-semibold mb-1">부여 방식</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditTargetType('student')}
                    className={`py-1.5 rounded-xl font-bold transition-all ${
                      editTargetType === 'student' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    👤 학생 개인
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditTargetType('class')}
                    className={`py-1.5 rounded-xl font-bold transition-all ${
                      editTargetType === 'class' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    🏫 반별
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditTargetType('all')}
                    className={`py-1.5 rounded-xl font-bold transition-all ${
                      editTargetType === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    🌐 전체 학생
                  </button>
                </div>
              </div>

              {editTargetType === 'student' ? (
                <div>
                  <label className="block font-semibold mb-1">대상 학생 선택 *</label>
                  <select
                    value={editSelectedStudentId}
                    onChange={e => setEditSelectedStudentId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold focus:outline-none"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.grade} | {s.className})
                      </option>
                    ))}
                  </select>
                </div>
              ) : editTargetType === 'class' ? (
                <div>
                  <label className="block font-semibold mb-1">대상 반 이름</label>
                  <input
                    type="text"
                    value={editTargetValue}
                    onChange={e => setEditTargetValue(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
              ) : null}

              <div>
                <label className="block font-semibold mb-1">숙제 상세 안내</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">체크리스트 항목 (줄바꿈 구분)</label>
                <textarea
                  rows={2}
                  value={editChecklistsText}
                  onChange={e => setEditChecklistsText(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingHomework(null)}
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
