import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Student } from '../types';
import { exportStudentsToCSV, printDocument } from '../lib/utils';
import { 
  UserPlus, Search, Download, Upload, Trash2, Edit3, Key, 
  Printer, QrCode, ShieldAlert, CheckCircle, XCircle, FileSpreadsheet, 
  Phone, School, BookOpen, Clock, Calendar, Check, X, Shield, Lock, Eye, EyeOff, Copy
} from 'lucide-react';

export const StudentManagement: React.FC = () => {
  const { 
    students, 
    addStudent, 
    updateStudent, 
    deleteStudent, 
    createStudentAccount, 
    resetStudentPassword, 
    toggleStudentActive,
    role
  } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('전체');
  const [selectedSubject, setSelectedSubject] = useState('전체');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Password visibility map
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [detailPassVisible, setDetailPassVisible] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCredentialPrint, setShowCredentialPrint] = useState<{ studentName: string; loginId: string; initialPassword: string } | null>(null);

  // Custom password edit modal state
  const [changePassModalStudent, setChangePassModalStudent] = useState<Student | null>(null);
  const [customNewPass, setCustomNewPass] = useState('');

  // Add Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    parentPhone: '',
    school: '',
    grade: '중3',
    className: '중3 심화반',
    subjects: '수학, 영어',
    attendanceDays: '월, 수, 금',
    attendanceTime: '18:00',
    notes: '',
    createAccountNow: true,
    loginId: '',
    initialPassword: ''
  });

  if (role !== 'admin') {
    return (
      <div className="p-8 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center text-rose-700 dark:text-rose-300">
        <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-rose-500" />
        <h2 className="text-lg font-bold">원장 전용 관리 화면</h2>
        <p className="text-xs mt-1">학생 생성, 삭제, 계정관리는 원장(Admin) 권한으로만 가능합니다.</p>
      </div>
    );
  }

  // Filter & Search
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.includes(searchQuery) || s.loginId.includes(searchQuery) || s.school.includes(searchQuery) || s.phone.includes(searchQuery);
    const matchesGrade = selectedGrade === '전체' || s.grade === selectedGrade;
    const matchesSubject = selectedSubject === '전체' || s.subjects.includes(selectedSubject);
    return matchesSearch && matchesGrade && matchesSubject;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('이름과 전화번호를 입력하세요.');
      return;
    }

    const res = addStudent({
      name: formData.name,
      phone: formData.phone,
      parentPhone: formData.parentPhone,
      school: formData.school,
      grade: formData.grade,
      className: formData.className,
      subjects: formData.subjects.split(',').map(s => s.trim()).filter(Boolean),
      attendanceDays: formData.attendanceDays.split(',').map(s => s.trim()).filter(Boolean),
      attendanceTime: formData.attendanceTime,
      notes: formData.notes,
      isActive: true,
      loginId: formData.loginId.trim() || undefined
    }, formData.createAccountNow, formData.initialPassword.trim() || undefined);

    setShowAddModal(false);

    if (res.account) {
      setShowCredentialPrint({
        studentName: res.student.name,
        loginId: res.account.loginId,
        initialPassword: res.account.initialPassword
      });
    }

    // Reset Form
    setFormData({
      name: '', phone: '', parentPhone: '', school: '', grade: '중3',
      className: '중3 심화반', subjects: '수학, 영어', attendanceDays: '월, 수, 금',
      attendanceTime: '18:00', notes: '', createAccountNow: true, loginId: '', initialPassword: ''
    });
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changePassModalStudent || !customNewPass.trim()) return;

    resetStudentPassword(changePassModalStudent.id, customNewPass.trim());
    alert(`'${changePassModalStudent.name}' 학생의 비밀번호가 [ ${customNewPass.trim()} ] 로 변경되었습니다.`);
    setChangePassModalStudent(null);
    setCustomNewPass('');
  };

  const handlePrintCredentials = (name: string, loginId: string, pass: string) => {
    printDocument(`[에듀플로우] ${name} 학생 계정 및 서비스 안내장`, `
      <div style="border: 2px solid #3b82f6; padding: 20px; border-radius: 12px; background: #f8fafc;">
        <h2 style="color: #1e3a8a; margin-top:0;">🎓 에듀플로우 통합 학생 계정 안내</h2>
        <p>반갑습니다! ${name} 학생의 학원 전용 시스템 접근 계정이 생성되었습니다.</p>
        <table style="width:100%; margin: 20px 0; border-collapse: collapse;">
          <tr><th style="padding:10px; background:#e2e8f0; width:30%;">학생 성명</th><td style="padding:10px;"><b>${name}</b></td></tr>
          <tr><th style="padding:10px; background:#e2e8f0;">로그인 아이디</th><td style="padding:10px; font-family:monospace; font-size:16px; color:#2563eb;"><b>${loginId}</b></td></tr>
          <tr><th style="padding:10px; background:#e2e8f0;">초기 비밀번호</th><td style="padding:10px; font-family:monospace; font-size:16px; color:#dc2626;"><b>${pass}</b></td></tr>
        </table>
        <p style="font-size:12px; color:#64748b;">* 본 안내장을 학생 및 보호자분께 전달하여 주시기 바랍니다. 첫 로그인 후 비밀번호 변경을 권장합니다.</p>
      </div>
    `);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 sm:p-8 rounded-[32px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" /> 학생 관리 Center (원장 전용)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            원장 권한으로 학생 정보를 등록/수정/삭제하고 아이디 및 비밀번호를 직접 설정/조회합니다.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportStudentsToCSV(students)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel 내보내기</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>학생 추가</span>
          </button>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="학생 이름, 학교, 연락처, 아이디 검색..."
            className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 backdrop-blur-md"
          />
        </div>

        {/* Grade Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">학년:</span>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3 py-1.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs font-semibold focus:outline-none"
          >
            <option value="전체">전체 학년</option>
            <option value="중1">중1</option>
            <option value="중2">중2</option>
            <option value="중3">중3</option>
            <option value="고1">고1</option>
            <option value="고2">고2</option>
            <option value="고3">고3</option>
          </select>
        </div>

        {/* Subject Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">과목:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs font-semibold focus:outline-none"
          >
            <option value="전체">전체 과목</option>
            <option value="수학">수학</option>
            <option value="영어">영어</option>
          </select>
        </div>
      </div>

      {/* Student Table Roster */}
      <div className="rounded-[32px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                <th className="p-4">학생명 / 아이디</th>
                <th className="p-4">비밀번호 (조회)</th>
                <th className="p-4">학교 / 학년</th>
                <th className="p-4">수강 반</th>
                <th className="p-4">수강 과목</th>
                <th className="p-4">등원 시간</th>
                <th className="p-4">계정 상태</th>
                <th className="p-4 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    등록된 학생 정보가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr 
                    key={s.id} 
                    onClick={() => {
                      setSelectedStudent(s);
                      setDetailPassVisible(false);
                    }}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-all"
                  >
                    <td className="p-4">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{s.name}</div>
                      <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono font-semibold">ID: {s.loginId}</div>
                    </td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {visiblePasswords[s.id] ? (s.initialPassword || '미설정') : '••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setVisiblePasswords(prev => ({ ...prev, [s.id]: !prev[s.id] }))}
                          className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          title={visiblePasswords[s.id] ? "비밀번호 가리기" : "비밀번호 조회"}
                        >
                          {visiblePasswords[s.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{s.school}</div>
                      <div className="text-slate-400">{s.grade}</div>
                    </td>
                    <td className="p-4 font-medium text-slate-700 dark:text-slate-300">{s.className}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {s.subjects.map((sub, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-600 dark:text-slate-400">
                      {s.attendanceDays.join(',')} ({s.attendanceTime})
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        s.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {s.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{s.isActive ? '활성' : '비활성'}</span>
                      </span>
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setChangePassModalStudent(s);
                            setCustomNewPass(s.initialPassword || '');
                          }}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                          title="비밀번호 직접 설정/변경"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`'${s.name}' 학생을 정말 삭제하시겠습니까?`)) {
                              deleteStudent(s.id);
                            }
                          }}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="학생 삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" /> 신규 학생 등록 및 계정 발급
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">학생 성명 *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="홍길동"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">학교 *</label>
                  <input
                    type="text"
                    required
                    value={formData.school}
                    onChange={e => setFormData({ ...formData, school: e.target.value })}
                    placeholder="대치중학교"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">학생 연락처 *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="010-1234-5678"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">보호자 연락처</label>
                  <input
                    type="text"
                    value={formData.parentPhone}
                    onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                    placeholder="010-9876-5432"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">학년</label>
                  <select
                    value={formData.grade}
                    onChange={e => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  >
                    <option value="중1">중1</option>
                    <option value="중2">중2</option>
                    <option value="중3">중3</option>
                    <option value="고1">고1</option>
                    <option value="고2">고2</option>
                    <option value="고3">고3</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">반 명칭</label>
                  <input
                    type="text"
                    value={formData.className}
                    onChange={e => setFormData({ ...formData, className: e.target.value })}
                    placeholder="중3 심화반"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">수강 과목 (쉼표 구분)</label>
                  <input
                    type="text"
                    value={formData.subjects}
                    onChange={e => setFormData({ ...formData, subjects: e.target.value })}
                    placeholder="수학, 영어"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">등원 요일 / 시간</label>
                  <input
                    type="text"
                    value={formData.attendanceDays}
                    onChange={e => setFormData({ ...formData, attendanceDays: e.target.value })}
                    placeholder="월, 수, 금"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              {/* Custom Login ID & Password Option */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 space-y-3">
                <label className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.createAccountNow}
                    onChange={e => setFormData({ ...formData, createAccountNow: e.target.checked })}
                    className="rounded text-indigo-600 w-4 h-4"
                  />
                  <span>학생 서비스 로그인 계정 설정</span>
                </label>

                {formData.createAccountNow && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                        로그인 아이디 (ID)
                      </label>
                      <input
                        type="text"
                        value={formData.loginId}
                        onChange={e => setFormData({ ...formData, loginId: e.target.value })}
                        placeholder="미입력 시 자동 생성 (예: std_1024)"
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                        초기 비밀번호
                      </label>
                      <input
                        type="text"
                        value={formData.initialPassword}
                        onChange={e => setFormData({ ...formData, initialPassword: e.target.value })}
                        placeholder="미입력 시 6자리 숫자 자동 생성"
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                )}
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
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20"
                >
                  학생 등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Custom Password Modal */}
      {changePassModalStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-600" /> 비밀번호 직접 설정
              </h2>
              <button onClick={() => setChangePassModalStudent(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                <b className="text-slate-900 dark:text-white">{changePassModalStudent.name}</b> (아이디: <span className="font-mono text-indigo-600">{changePassModalStudent.loginId}</span>)
              </p>

              <div>
                <label className="block font-semibold mb-1">새 비밀번호 입력 *</label>
                <input
                  type="text"
                  required
                  value={customNewPass}
                  onChange={e => setCustomNewPass(e.target.value)}
                  placeholder="예: pass1234"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setChangePassModalStudent(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm"
                >
                  비밀번호 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credential Generated Print Modal */}
      {showCredentialPrint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">학생 계정 발급 완료!</h2>
            <p className="text-xs text-slate-500">
              <span className="font-bold text-slate-800 dark:text-slate-200">{showCredentialPrint.studentName}</span> 학생의 접속 계정이 아래와 같이 생성되었습니다.
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">아이디:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{showCredentialPrint.loginId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">초기 비밀번호:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{showCredentialPrint.initialPassword}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handlePrintCredentials(showCredentialPrint.studentName, showCredentialPrint.loginId, showCredentialPrint.initialPassword)}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20"
              >
                <Printer className="w-4 h-4" />
                <span>안내장 출력</span>
              </button>
              <button
                onClick={() => setShowCredentialPrint(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 font-bold flex items-center justify-center text-base">
                  {selectedStudent.name[0]}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">{selectedStudent.name} 학생 상세</h2>
                  <span className="text-xs text-indigo-600 font-mono">ID: {selectedStudent.loginId}</span>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Credential Lookup Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-2 text-xs">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Key className="w-4 h-4 text-indigo-600" />
                <span>로그인 계정 및 비밀번호 조회</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1 font-mono">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">아이디 (ID)</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedStudent.loginId}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">비밀번호</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {detailPassVisible ? (selectedStudent.initialPassword || '미설정') : '••••••'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDetailPassVisible(!detailPassVisible)}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600"
                    title={detailPassVisible ? "비밀번호 가리기" : "비밀번호 보기"}
                  >
                    {detailPassVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block mb-1">학교 / 학년</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStudent.school} ({selectedStudent.grade})</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block mb-1">반 명칭</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStudent.className}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block mb-1">학생 연락처</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStudent.phone}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block mb-1">보호자 연락처</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStudent.parentPhone || '미등록'}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs">
              <span className="text-slate-400 block mb-1">학생 담당 메모</span>
              <p className="text-slate-700 dark:text-slate-300">{selectedStudent.notes || '작성된 메모가 없습니다.'}</p>
            </div>

            {/* QR Code generator preview */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <QrCode className="w-10 h-10 text-indigo-600" />
                <div>
                  <h4 className="font-bold text-xs text-indigo-950 dark:text-indigo-200">출결 전용 QR 코드</h4>
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-400">{selectedStudent.qrCode}</p>
                </div>
              </div>
              <button
                onClick={() => printDocument(`${selectedStudent.name} 학생 QR 출석증`, `<div style="text-align:center; padding:30px;"><h2 style="font-size:24px;">${selectedStudent.name} 학생 출석 QR</h2><p style="font-size:32px; font-family:monospace; color:#2563eb; letter-spacing:4px;">${selectedStudent.qrCode}</p><p>태블릿 스캐너에 위 문구를 조준하세요.</p></div>`)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow"
              >
                QR 출석표 인쇄
              </button>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => toggleStudentActive(selectedStudent.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  selectedStudent.isActive ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {selectedStudent.isActive ? '계정 비활성화' : '계정 활성화'}
              </button>
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                확인 닫기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

