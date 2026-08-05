import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AttendanceStatus } from '../types';
import { 
  CalendarCheck, QrCode, Search, CheckCircle2, XCircle, Clock, 
  AlertTriangle, Save, BarChart2, UserCheck, Check, Sparkles 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const AttendanceManagement: React.FC = () => {
  const { students, attendance, saveAttendance, role } = useAuth();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [qrInput, setQrInput] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Daily records map for chosen date
  const dateRecords = attendance.filter(a => a.date === selectedDate);

  const filteredStudents = students.filter(s => 
    s.name.includes(searchQuery) || s.school.includes(searchQuery) || s.className.includes(searchQuery)
  );

  const getRecordForStudent = (studentId: string) => {
    return dateRecords.find(r => r.studentId === studentId);
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    const existing = getRecordForStudent(studentId);
    const nowTime = new Date().toTimeString().slice(0, 5);
    saveAttendance(
      studentId, 
      status, 
      existing?.checkInTime || nowTime, 
      existing?.checkOutTime, 
      existing?.note
    );
    triggerSuccess('출결 정보가 저장되었습니다.');
  };

  const handleCheckInChange = (studentId: string, time: string) => {
    const existing = getRecordForStudent(studentId);
    saveAttendance(
      studentId, 
      existing?.status || 'present', 
      time, 
      existing?.checkOutTime, 
      existing?.note
    );
  };

  const handleCheckOutChange = (studentId: string, time: string) => {
    const existing = getRecordForStudent(studentId);
    saveAttendance(
      studentId, 
      existing?.status || 'present', 
      existing?.checkInTime || new Date().toTimeString().slice(0, 5), 
      time, 
      existing?.note
    );
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleSimulateQrScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInput.trim()) return;

    // Match QR code with student
    const found = students.find(s => s.qrCode === qrInput.trim() || s.loginId === qrInput.trim() || s.id === qrInput.trim());
    if (found) {
      const nowTime = new Date().toTimeString().slice(0, 5);
      saveAttendance(found.id, 'present', nowTime, undefined, 'QR 출석 스캔 등원');
      triggerSuccess(`'${found.name}' 학생 등원 완료! (${nowTime})`);
      setQrInput('');
      setShowQrScanner(false);
    } else {
      alert('등록되지 않은 QR 코드 또는 학생 ID입니다.');
    }
  };

  // Stats calculation
  const totalCount = students.length;
  const presentCount = dateRecords.filter(r => r.status === 'present').length;
  const lateCount = dateRecords.filter(r => r.status === 'late').length;
  const absentCount = dateRecords.filter(r => r.status === 'absent').length;

  // Monthly Attendance Chart Data
  const monthlyData = [
    { name: '1주차', 출석: 95, 지각: 3, 결석: 2 },
    { name: '2주차', 출석: 92, 지각: 5, 결석: 3 },
    { name: '3주차', 출석: 98, 지각: 1, 결석: 1 },
    { name: '4주차', 출석: 94, 지각: 4, 결석: 2 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 sm:p-8 rounded-[32px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-emerald-600" /> 학생 출결 관리 센터
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            등원/하원 시간 기록, 스마트 QR 스캔 출석 체크 및 월별 출석률 분석
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3.5 py-2 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/80 dark:border-slate-700 font-bold text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          />

          {/* QR Scan Button */}
          <button
            onClick={() => setShowQrScanner(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>QR 출석 스캔</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/90 backdrop-blur-md text-white font-bold text-xs flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-sm">
          <div className="text-xs text-slate-400 font-semibold mb-1">전체 대상 학생</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalCount}명</div>
        </div>
        <div className="p-4 sm:p-5 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-sm">
          <div className="text-xs text-emerald-600 font-semibold mb-1">오늘 출석</div>
          <div className="text-2xl font-black text-emerald-600">{presentCount}명</div>
        </div>
        <div className="p-4 sm:p-5 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-sm">
          <div className="text-xs text-amber-600 font-semibold mb-1">지각</div>
          <div className="text-2xl font-black text-amber-600">{lateCount}명</div>
        </div>
        <div className="p-4 sm:p-5 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-sm">
          <div className="text-xs text-rose-600 font-semibold mb-1">결석</div>
          <div className="text-2xl font-black text-rose-600">{absentCount}명</div>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="rounded-[32px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="학생 이름 또는 반 검색..."
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono">선택 날짜: {selectedDate}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 font-bold">
                <th className="p-4">학생명 / 반</th>
                <th className="p-4">출석 상태 선택</th>
                <th className="p-4">등원 시간</th>
                <th className="p-4">하원 시간</th>
                <th className="p-4">특이사항 메모</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredStudents.map((student) => {
                const rec = getRecordForStudent(student.id);
                const currentStatus = rec?.status || 'none';

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-4">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{student.name}</div>
                      <div className="text-[11px] text-slate-400">{student.school} | {student.className}</div>
                    </td>

                    {/* Attendance Status Toggle Buttons */}
                    <td className="p-4">
                      <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'present')}
                          className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition-all ${
                            currentStatus === 'present'
                              ? 'bg-emerald-600 text-white shadow'
                              : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                          }`}
                        >
                          출석
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'late')}
                          className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition-all ${
                            currentStatus === 'late'
                              ? 'bg-amber-500 text-white shadow'
                              : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
                          }`}
                        >
                          지각
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'absent')}
                          className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition-all ${
                            currentStatus === 'absent'
                              ? 'bg-rose-600 text-white shadow'
                              : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
                          }`}
                        >
                          결석
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'early_leave')}
                          className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition-all ${
                            currentStatus === 'early_leave'
                              ? 'bg-purple-600 text-white shadow'
                              : 'text-slate-600 dark:text-slate-400 hover:text-purple-600'
                          }`}
                        >
                          조퇴
                        </button>
                      </div>
                    </td>

                    {/* Check In Time */}
                    <td className="p-4">
                      <input
                        type="time"
                        value={rec?.checkInTime || ''}
                        onChange={(e) => handleCheckInChange(student.id, e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs focus:outline-none"
                      />
                    </td>

                    {/* Check Out Time */}
                    <td className="p-4">
                      <input
                        type="time"
                        value={rec?.checkOutTime || ''}
                        onChange={(e) => handleCheckOutChange(student.id, e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs focus:outline-none"
                      />
                    </td>

                    {/* Note */}
                    <td className="p-4">
                      <span className="text-slate-500 text-[11px]">
                        {rec?.note || '특이사항 없음'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Attendance Chart */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-indigo-600" /> 주차별 출석률 주간 추이 그래프
        </h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Bar dataKey="출석" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="지각" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              <Bar dataKey="결석" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* QR Scanner Simulation Modal */}
      {showQrScanner && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-600" /> 출결 QR 스캐너 카메라스캔
              </h3>
              <button onClick={() => setShowQrScanner(false)} className="text-slate-400">✕</button>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900 text-white text-center space-y-3 relative overflow-hidden">
              <div className="w-32 h-32 border-2 border-emerald-400 border-dashed rounded-2xl mx-auto flex items-center justify-center animate-pulse">
                <QrCode className="w-16 h-16 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-300">카메라 레디 - QR 코드를 스캐너에 태그하세요</p>
            </div>

            <form onSubmit={handleSimulateQrScan} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">QR 코드 / 학생 ID 수동 태그 시뮬레이션</label>
                <input
                  type="text"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder="예: STUDENT_QR_S1 또는 student1"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQrScanner(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold shadow"
                >
                  스캔 확인
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
