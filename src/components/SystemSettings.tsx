import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Teacher } from '../types';
import { 
  Settings, Building, UserCheck, Shield, Key, Plus, 
  Trash2, Download, Upload, History, Smartphone, Save, AlertCircle, X, Check, Eye, EyeOff 
} from 'lucide-react';

export const SystemSettings: React.FC = () => {
  const { 
    academySettings, 
    updateAcademySettings, 
    teachers, 
    addTeacher, 
    resetTeacherPassword,
    deleteTeacher, 
    activityLogs, 
    exportBackupJSON, 
    importBackupJSON,
    role
  } = useAuth();

  // Academy Form
  const [name, setName] = useState(academySettings.name);
  const [phone, setPhone] = useState(academySettings.phone);
  const [address, setAddress] = useState(academySettings.address);
  const [businessNumber, setBusinessNumber] = useState(academySettings.businessNumber || '');
  const [directorName, setDirectorName] = useState(academySettings.directorName);
  const [savedMsg, setSavedMsg] = useState('');

  // Teacher Form & Modals
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [tName, setTName] = useState('');
  const [tPhone, setTPhone] = useState('');
  const [tSubjects, setTSubjects] = useState('수학');
  const [tClasses, setTClasses] = useState('중3 심화반');
  const [tLoginId, setTLoginId] = useState('');
  const [tPassword, setTPassword] = useState('');

  // Password visibility & edit modal for teachers
  const [visibleTeacherPasswords, setVisibleTeacherPasswords] = useState<Record<string, boolean>>({});
  const [changeTeacherPassModal, setChangeTeacherPassModal] = useState<Teacher | null>(null);
  const [customTeacherPass, setCustomTeacherPass] = useState('');

  const [createdTeacherCredentials, setCreatedTeacherCredentials] = useState<{ name: string; loginId: string; initialPassword: string } | null>(null);

  if (role !== 'admin') {
    return (
      <div className="p-8 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center text-rose-700 dark:text-rose-300">
        <Shield className="w-12 h-12 mx-auto mb-3 text-rose-500" />
        <h2 className="text-lg font-bold">원장 전용 시스템 설정</h2>
        <p className="text-xs mt-1">시스템 정보 수정 및 교강사 계정 관리는 원장(Admin) 전용입니다.</p>
      </div>
    );
  }

  const handleSaveAcademy = (e: React.FormEvent) => {
    e.preventDefault();
    updateAcademySettings({
      name,
      phone,
      address,
      businessNumber,
      directorName
    });
    setSavedMsg('학원 정보가 성공적으로 저장되었습니다.');
    setTimeout(() => setSavedMsg(''), 2500);
  };

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tName.trim() || !tPhone.trim()) return;

    const newT = addTeacher({
      loginId: tLoginId.trim() || undefined,
      name: tName.trim(),
      phone: tPhone.trim(),
      subjects: tSubjects.split(',').map(s => s.trim()).filter(Boolean),
      assignedClasses: tClasses.split(',').map(c => c.trim()).filter(Boolean)
    }, tPassword.trim() || undefined);

    setShowTeacherModal(false);
    setCreatedTeacherCredentials({
      name: newT.name,
      loginId: newT.loginId,
      initialPassword: newT.initialPassword || '123456'
    });

    setTName('');
    setTPhone('');
    setTLoginId('');
    setTPassword('');
  };

  const handleChangeTeacherPassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeTeacherPassModal || !customTeacherPass.trim()) return;

    resetTeacherPassword(changeTeacherPassModal.id, customTeacherPass.trim());
    alert(`'${changeTeacherPassModal.name}' 선생님의 비밀번호가 [ ${customTeacherPass.trim()} ] 로 변경되었습니다.`);
    setChangeTeacherPassModal(null);
    setCustomTeacherPass('');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = importBackupJSON(content);
      if (ok) {
        alert('백업 데이터 복원이 완료되었습니다!');
      } else {
        alert('올바르지 않은 JSON 파일입니다.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" /> 학원 시스템 종합 설정 & 백업
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          학원 기본 프로필 관리, 교강사 계정 발급, 시스템 감사 로그 및 전체 데이터 백업/복원
        </p>
      </div>

      {savedMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/90 backdrop-blur-md text-white font-bold text-xs flex items-center gap-2 shadow-lg">
          <Check className="w-4 h-4" />
          <span>{savedMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Academy Info Editor */}
        <div className="p-6 rounded-[32px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-4">
          <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-3">
            <Building className="w-5 h-5 text-indigo-600" /> 학원 기본 정보 관리
          </h2>

          <form onSubmit={handleSaveAcademy} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1">학원명 *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold mb-1">원장 성명</label>
                <input
                  type="text"
                  value={directorName}
                  onChange={e => setDirectorName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">대표 연락처 *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">학원 도로명 주소</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">사업자 등록번호</label>
              <input
                type="text"
                value={businessNumber}
                onChange={e => setBusinessNumber(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20"
            >
              학원 정보 변경 저장
            </button>
          </form>
        </div>

        {/* Right Column: Teacher Account Management */}
        <div className="p-6 rounded-[32px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
            <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600" /> 선생님 계정 관리 Center
            </h2>
            <button
              onClick={() => setShowTeacherModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>선생님 계정 생성</span>
            </button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {teachers.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">등록된 선생님 계정이 없습니다.</p>
            ) : (
              teachers.map(t => (
                <div key={t.id} className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{t.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-normal">
                        {t.subjects.join(', ')}
                      </span>
                    </div>

                    {/* Login ID and Password view */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">ID: {t.loginId}</span>
                      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                        <span>PW:</span>
                        <span className="font-bold">
                          {visibleTeacherPasswords[t.id] ? (t.initialPassword || '미설정') : '••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setVisibleTeacherPasswords(prev => ({ ...prev, [t.id]: !prev[t.id] }))}
                          className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                          title={visibleTeacherPasswords[t.id] ? "비밀번호 가리기" : "비밀번호 조회"}
                        >
                          {visibleTeacherPasswords[t.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setChangeTeacherPassModal(t);
                        setCustomTeacherPass(t.initialPassword || '');
                      }}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                      title="비밀번호 설정/변경"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`'${t.name}' 선생님 계정을 삭제하시겠습니까?`)) {
                          deleteTeacher(t.id);
                        }
                      }}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="선생님 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Backup & Audit Logs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Data Backup & Restore */}
        <div className="p-6 rounded-[32px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-4">
          <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-3">
            <Download className="w-5 h-5 text-indigo-600" /> 시스템 데이터 백업 & 오프라인 동기화
          </h2>

          <p className="text-xs text-slate-500">
            학원의 모든 학생, 출결, 숙제, 질문 데이터를 한 클릭으로 안전하게 JSON 백업 파일로 저장하고 언제든 복원할 수 있습니다.
          </p>

          <div className="flex gap-3">
            <button
              onClick={exportBackupJSON}
              className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow"
            >
              <Download className="w-4 h-4" />
              <span>전체 백업 다운로드</span>
            </button>

            <label className="flex-1 py-3 rounded-2xl bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm border border-slate-200/80 dark:border-slate-700">
              <Upload className="w-4 h-4" />
              <span>백업 파일 복원</span>
              <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
            </label>
          </div>
        </div>

        {/* Audit Log */}
        <div className="p-6 rounded-[32px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-4">
          <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <History className="w-5 h-5 text-indigo-600" /> 시스템 활동 기록 Audit Log
          </h2>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {activityLogs.map(log => (
              <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px] space-y-0.5">
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                  <span>{log.userName} ({log.action})</span>
                  <span className="font-mono text-slate-400">{log.timestamp.split('T')[1]?.slice(0,8)}</span>
                </div>
                <div className="text-slate-500">{log.details}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Add Teacher Modal */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-600" /> 선생님 계정 생성
              </h2>
              <button onClick={() => setShowTeacherModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">선생님 성명 *</label>
                <input
                  type="text"
                  required
                  value={tName}
                  onChange={e => setTName(e.target.value)}
                  placeholder="예: 김수학 선생님"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">연락처 *</label>
                <input
                  type="text"
                  required
                  value={tPhone}
                  onChange={e => setTPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">담당 과목</label>
                  <input
                    type="text"
                    value={tSubjects}
                    onChange={e => setTSubjects(e.target.value)}
                    placeholder="수학"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">담당 학급</label>
                  <input
                    type="text"
                    value={tClasses}
                    onChange={e => setTClasses(e.target.value)}
                    placeholder="중3 심화반"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              {/* Login ID & Password Custom Inputs */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 space-y-2">
                <div className="font-bold text-indigo-900 dark:text-indigo-200 text-xs flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  <span>로그인 계정 설정 (선택)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300 text-[11px]">
                      아이디 (ID)
                    </label>
                    <input
                      type="text"
                      value={tLoginId}
                      onChange={e => setTLoginId(e.target.value)}
                      placeholder="미입력 시 자동 생성"
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300 text-[11px]">
                      초기 비밀번호
                    </label>
                    <input
                      type="text"
                      value={tPassword}
                      onChange={e => setTPassword(e.target.value)}
                      placeholder="미입력 시 자동 생성"
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTeacherModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow cursor-pointer"
                >
                  계정 생성 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Custom Teacher Password Modal */}
      {changeTeacherPassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-600" /> 선생님 비밀번호 변경
              </h2>
              <button onClick={() => setChangeTeacherPassModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangeTeacherPassSubmit} className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                <b className="text-slate-900 dark:text-white">{changeTeacherPassModal.name}</b> 선생님 (아이디: <span className="font-mono text-indigo-600">{changeTeacherPassModal.loginId}</span>)
              </p>

              <div>
                <label className="block font-semibold mb-1">새 비밀번호 입력 *</label>
                <input
                  type="text"
                  required
                  value={customTeacherPass}
                  onChange={e => setCustomTeacherPass(e.target.value)}
                  placeholder="예: teacher123"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setChangeTeacherPassModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm cursor-pointer"
                >
                  비밀번호 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Created Popup */}
      {createdTeacherCredentials && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto font-bold">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">선생님 계정 발급 완료</h3>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-mono text-xs text-left space-y-1">
              <div>선생님: <b>{createdTeacherCredentials.name}</b></div>
              <div>아이디: <b className="text-indigo-600">{createdTeacherCredentials.loginId}</b></div>
              <div>초기 비밀번호: <b className="text-rose-600">{createdTeacherCredentials.initialPassword}</b></div>
            </div>
            <button
              onClick={() => setCreatedTeacherCredentials(null)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
            >
              확인 닫기
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
