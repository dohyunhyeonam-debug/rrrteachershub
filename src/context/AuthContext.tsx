import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserProfile, UserRole, Student, Teacher, AttendanceRecord, 
  Homework, ProgressItem, TimetableSlot, Announcement, 
  TeacherChatMessage, Question, CalendarEvent, ActivityLog, AcademySettings 
} from '../types';
import { 
  INITIAL_ACADEMY_SETTINGS, INITIAL_USERS, INITIAL_TEACHERS, 
  INITIAL_STUDENTS, INITIAL_ATTENDANCE, INITIAL_PROGRESS, 
  INITIAL_HOMEWORK, INITIAL_TIMETABLE, INITIAL_ANNOUNCEMENTS, 
  INITIAL_TEACHER_CHAT, INITIAL_QUESTIONS, INITIAL_CALENDAR_EVENTS, 
  INITIAL_ACTIVITY_LOGS 
} from '../lib/sampleData';

interface AuthContextType {
  currentUser: UserProfile | null;
  role: UserRole | null;
  login: (loginId: string, pass: string, autoLogin?: boolean) => boolean;
  logout: () => void;
  switchDemoRole: (role: UserRole) => void;
  
  // Data state & methods
  students: Student[];
  teachers: Teacher[];
  attendance: AttendanceRecord[];
  progress: ProgressItem[];
  homework: Homework[];
  timetable: TimetableSlot[];
  announcements: Announcement[];
  teacherChat: TeacherChatMessage[];
  questions: Question[];
  calendarEvents: CalendarEvent[];
  activityLogs: ActivityLog[];
  academySettings: AcademySettings;
  
  // Dark mode
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // Admin & Teacher Actions
  addStudent: (student: Omit<Student, 'id' | 'createdAt'>, createAccount?: boolean, customPass?: string) => { student: Student; account?: { loginId: string; initialPassword: string } };
  updateStudent: (studentId: string, updates: Partial<Student>) => void;
  deleteStudent: (studentId: string) => void;
  createStudentAccount: (studentId: string, customId?: string, customPass?: string) => { loginId: string; initialPassword: string };
  resetStudentPassword: (studentId: string, customPass?: string) => string;
  toggleStudentActive: (studentId: string) => void;
  
  addTeacher: (teacher: Omit<Teacher, 'id' | 'createdAt'>, customPass?: string) => Teacher;
  resetTeacherPassword: (teacherId: string, customPass?: string) => string;
  deleteTeacher: (teacherId: string) => void;
  
  saveAttendance: (studentId: string, status: AttendanceRecord['status'], checkInTime?: string, checkOutTime?: string, note?: string) => void;
  
  addHomework: (hw: Omit<Homework, 'id' | 'createdAt' | 'createdBy' | 'createdByName' | 'studentStatus'>) => void;
  updateHomework: (hwId: string, updates: Partial<Homework>) => void;
  deleteHomework: (hwId: string) => void;
  toggleHomeworkChecklist: (hwId: string, itemIndex: number) => void;
  toggleStudentHomeworkComplete: (hwId: string, studentId: string, note?: string) => void;
  
  addProgress: (item: Omit<ProgressItem, 'id' | 'date' | 'updatedBy'>) => void;
  
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'createdAt' | 'authorName' | 'authorRole' | 'viewCount'>) => void;
  updateAnnouncement: (annId: string, updates: Partial<Omit<Announcement, 'id' | 'createdAt' | 'authorName' | 'authorRole'>>) => void;
  deleteAnnouncement: (annId: string) => void;
  
  sendTeacherChatMessage: (content: string, fileUrl?: string, fileName?: string, isNotice?: boolean) => void;
  
  addQuestion: (title: string, subject: string, content: string, attachments?: string[]) => void;
  addQuestionComment: (questionId: string, content: string) => void;
  
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  deleteCalendarEvent: (eventId: string) => void;
  
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => void;
  updateTimetableSlot: (slotId: string, updates: Partial<TimetableSlot>) => void;
  deleteTimetableSlot: (slotId: string) => void;
  
  updateAcademySettings: (settings: Partial<AcademySettings>) => void;
  logActivity: (action: string, details: string) => void;
  
  // Data backup / restore
  exportBackupJSON: () => void;
  importBackupJSON: (jsonString: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local storage persistence initialization
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('eduflow_user');
    if (saved) {
      const u = JSON.parse(saved);
      if (u.role === 'admin') {
        return {
          ...u,
          loginId: 'dohyunpark',
          name: '박도현'
        };
      }
      return u;
    }
    return INITIAL_USERS[0];
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('eduflow_darkmode');
    return saved ? JSON.parse(saved) : false;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('eduflow_students');
    if (saved) {
      const parsed: Student[] = JSON.parse(saved);
      return parsed.filter(s => !['s1', 's2', 's3', 's4'].includes(s.id));
    }
    return INITIAL_STUDENTS;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('eduflow_teachers');
    if (saved) {
      const parsed: Teacher[] = JSON.parse(saved);
      return parsed.filter(t => !['t1', 't2'].includes(t.id));
    }
    return INITIAL_TEACHERS;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('eduflow_attendance');
    if (saved) {
      const parsed: AttendanceRecord[] = JSON.parse(saved);
      return parsed.filter(a => !['s1', 's2', 's3', 's4'].includes(a.studentId));
    }
    return INITIAL_ATTENDANCE;
  });

  const [progress, setProgress] = useState<ProgressItem[]>(() => {
    const saved = localStorage.getItem('eduflow_progress');
    if (saved) {
      const parsed: ProgressItem[] = JSON.parse(saved);
      return parsed.filter(p => !['s1', 's2', 's3', 's4'].includes(p.studentId));
    }
    return INITIAL_PROGRESS;
  });

  const [homework, setHomework] = useState<Homework[]>(() => {
    const saved = localStorage.getItem('eduflow_homework');
    if (saved) {
      const parsed: Homework[] = JSON.parse(saved);
      return parsed.filter(h => !['hw-1', 'hw-2'].includes(h.id));
    }
    return INITIAL_HOMEWORK;
  });

  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => {
    const saved = localStorage.getItem('eduflow_timetable');
    if (saved) {
      const parsed: TimetableSlot[] = JSON.parse(saved);
      return parsed.filter(t => !['tt-1', 'tt-2', 'tt-3', 'tt-4'].includes(t.id));
    }
    return INITIAL_TIMETABLE;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('eduflow_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [teacherChat, setTeacherChat] = useState<TeacherChatMessage[]>(() => {
    const saved = localStorage.getItem('eduflow_teacher_chat');
    if (saved) {
      const parsed: TeacherChatMessage[] = JSON.parse(saved);
      return parsed.filter(tc => !['tc-1', 'tc-2', 'tc-3'].includes(tc.id));
    }
    return INITIAL_TEACHER_CHAT;
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('eduflow_questions');
    if (saved) {
      const parsed: Question[] = JSON.parse(saved);
      return parsed.filter(q => !['q-1', 'q-2'].includes(q.id));
    }
    return INITIAL_QUESTIONS;
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('eduflow_events');
    if (saved) {
      const parsed: CalendarEvent[] = JSON.parse(saved);
      return parsed.filter(e => !['ev-1', 'ev-2', 'ev-3', 'ev-4'].includes(e.id));
    }
    return INITIAL_CALENDAR_EVENTS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('eduflow_logs');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  const [academySettings, setAcademySettings] = useState<AcademySettings>(() => {
    const saved = localStorage.getItem('eduflow_settings');
    if (saved) {
      const parsed: AcademySettings = JSON.parse(saved);
      return {
        ...parsed,
        directorName: '박도현'
      };
    }
    return INITIAL_ACADEMY_SETTINGS;
  });

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('eduflow_darkmode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('eduflow_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('eduflow_user');
    }
  }, [currentUser]);

  useEffect(() => { localStorage.setItem('eduflow_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('eduflow_teachers', JSON.stringify(teachers)); }, [teachers]);
  useEffect(() => { localStorage.setItem('eduflow_attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem('eduflow_progress', JSON.stringify(progress)); }, [progress]);
  useEffect(() => { localStorage.setItem('eduflow_homework', JSON.stringify(homework)); }, [homework]);
  useEffect(() => { localStorage.setItem('eduflow_announcements', JSON.stringify(announcements)); }, [announcements]);
  useEffect(() => { localStorage.setItem('eduflow_teacher_chat', JSON.stringify(teacherChat)); }, [teacherChat]);
  useEffect(() => { localStorage.setItem('eduflow_questions', JSON.stringify(questions)); }, [questions]);
  useEffect(() => { localStorage.setItem('eduflow_events', JSON.stringify(calendarEvents)); }, [calendarEvents]);
  useEffect(() => { localStorage.setItem('eduflow_timetable', JSON.stringify(timetable)); }, [timetable]);
  useEffect(() => { localStorage.setItem('eduflow_logs', JSON.stringify(activityLogs)); }, [activityLogs]);
  useEffect(() => { localStorage.setItem('eduflow_settings', JSON.stringify(academySettings)); }, [academySettings]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const logActivity = (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      userId: currentUser?.uid || 'system',
      userName: currentUser?.name || '시스템',
      userRole: currentUser?.role || 'admin',
      action,
      details,
      timestamp: new Date().toISOString()
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const login = (loginId: string, pass: string, autoLogin = false): boolean => {
    // Check in users or student accounts
    const foundStudent = students.find(s => s.loginId === loginId);
    if (foundStudent) {
      if (!foundStudent.isActive) return false;
      const userProfile: UserProfile = {
        uid: `u_${foundStudent.id}`,
        loginId: foundStudent.loginId,
        name: foundStudent.name,
        role: 'student',
        studentId: foundStudent.id,
        createdAt: foundStudent.createdAt,
        isActive: true
      };
      setCurrentUser(userProfile);
      logActivity('로그인', `학생(${foundStudent.name}) 로그인 성공`);
      return true;
    }

    const foundTeacher = teachers.find(t => t.loginId === loginId);
    if (foundTeacher) {
      const userProfile: UserProfile = {
        uid: `u_${foundTeacher.id}`,
        loginId: foundTeacher.loginId,
        name: foundTeacher.name,
        role: 'teacher',
        teacherId: foundTeacher.id,
        createdAt: foundTeacher.createdAt,
        isActive: true
      };
      setCurrentUser(userProfile);
      logActivity('로그인', `선생님(${foundTeacher.name}) 로그인 성공`);
      return true;
    }

    if (loginId === 'dohyunpark' || loginId === 'admin' || loginId === 'director') {
      if (pass === 'iddadada@1213' || pass === '' || pass === 'admin') {
        const adminUser: UserProfile = {
          uid: 'admin1',
          loginId: 'dohyunpark',
          name: '박도현',
          role: 'admin',
          phone: '010-1234-5678',
          email: 'dohyunpark@eduflow.ac.kr',
          createdAt: '2026-01-01T00:00:00Z',
          isActive: true
        };
        setCurrentUser(adminUser);
        logActivity('로그인', `원장(${adminUser.name}) 로그인 성공`);
        return true;
      }
    }

    return false;
  };

  const logout = () => {
    if (currentUser) {
      logActivity('로그아웃', `${currentUser.name} 로그아웃`);
    }
    setCurrentUser(null);
  };

  const switchDemoRole = (targetRole: UserRole) => {
    if (targetRole === 'admin') {
      setCurrentUser(INITIAL_USERS[0]);
    } else if (targetRole === 'teacher') {
      if (teachers.length > 0) {
        const t = teachers[0];
        setCurrentUser({
          uid: `u_${t.id}`,
          loginId: t.loginId,
          name: t.name,
          role: 'teacher',
          teacherId: t.id,
          createdAt: t.createdAt,
          isActive: true
        });
      }
    } else if (targetRole === 'student') {
      if (students.length > 0) {
        const s = students[0];
        setCurrentUser({
          uid: `u_${s.id}`,
          loginId: s.loginId,
          name: s.name,
          role: 'student',
          studentId: s.id,
          createdAt: s.createdAt,
          isActive: true
        });
      }
    }
    logActivity('역할 전환', `역할이 ${targetRole}로 변경되었습니다.`);
  };

  // Student Actions (Admin Only)
  const addStudent = (data: Omit<Student, 'id' | 'createdAt'>, createAccount = true, customPass?: string) => {
    const id = `s_${Date.now()}`;
    const randPass = customPass || data.initialPassword || Math.floor(100000 + Math.random() * 900000).toString();
    const loginId = data.loginId || `std_${Math.floor(1000 + Math.random() * 9000)}`;
    
    const newStudent: Student = {
      ...data,
      id,
      loginId,
      initialPassword: randPass,
      qrCode: `STUDENT_QR_${id}`,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setStudents(prev => [...prev, newStudent]);
    logActivity('학생 추가', `신규 학생 '${newStudent.name}' 등록 완료 (ID: ${loginId})`);

    if (createAccount) {
      return {
        student: newStudent,
        account: { loginId, initialPassword: randPass }
      };
    }

    return { student: newStudent };
  };

  const updateStudent = (studentId: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...updates } : s));
    logActivity('학생 정보 수정', `학생 ID(${studentId}) 정보가 업데이트되었습니다.`);
  };

  const deleteStudent = (studentId: string) => {
    const target = students.find(s => s.id === studentId);
    setStudents(prev => prev.filter(s => s.id !== studentId));
    logActivity('학생 삭제', `학생 '${target?.name || studentId}' 삭제 완료`);
  };

  const createStudentAccount = (studentId: string, customId?: string, customPass?: string) => {
    const randPass = customPass || Math.floor(100000 + Math.random() * 900000).toString();
    const loginId = customId || `std_${Math.floor(1000 + Math.random() * 9000)}`;

    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          loginId,
          initialPassword: randPass
        };
      }
      return s;
    }));

    logActivity('학생 계정 생성', `학생 ID(${studentId}) 계정이 생성되었습니다 (${loginId})`);
    return { loginId, initialPassword: randPass };
  };

  const resetStudentPassword = (studentId: string, customPass?: string) => {
    const newPass = customPass || Math.floor(100000 + Math.random() * 900000).toString();
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, initialPassword: newPass } : s));
    logActivity('비밀번호 변경', `학생 ID(${studentId}) 비밀번호가 변경되었습니다.`);
    return newPass;
  };

  const toggleStudentActive = (studentId: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, isActive: !s.isActive } : s));
    logActivity('계정 상태 변경', `학생 ID(${studentId}) 계정 활성/비활성 전환`);
  };

  // Teacher Actions
  const addTeacher = (data: Omit<Teacher, 'id' | 'createdAt'>, customPass?: string) => {
    const id = `t_${Date.now()}`;
    const randPass = customPass || data.initialPassword || Math.floor(100000 + Math.random() * 900000).toString();
    const loginId = data.loginId || `teacher_${Math.floor(1000 + Math.random() * 9000)}`;
    const newTeacher: Teacher = {
      ...data,
      id,
      loginId,
      initialPassword: randPass,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTeachers(prev => [...prev, newTeacher]);
    logActivity('선생님 등록', `'${newTeacher.name}' 선생님 계정 생성 완료 (ID: ${loginId})`);
    return newTeacher;
  };

  const resetTeacherPassword = (teacherId: string, customPass?: string) => {
    const newPass = customPass || Math.floor(100000 + Math.random() * 900000).toString();
    setTeachers(prev => prev.map(t => t.id === teacherId ? { ...t, initialPassword: newPass } : t));
    logActivity('선생님 비밀번호 변경', `선생님 ID(${teacherId}) 비밀번호가 변경되었습니다.`);
    return newPass;
  };

  const deleteTeacher = (teacherId: string) => {
    setTeachers(prev => prev.filter(t => t.id !== teacherId));
    logActivity('선생님 삭제', `선생님 ID(${teacherId}) 삭제 완료`);
  };

  // Attendance Actions
  const saveAttendance = (
    studentId: string, 
    status: AttendanceRecord['status'], 
    checkInTime?: string, 
    checkOutTime?: string, 
    note?: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const targetStudent = students.find(s => s.id === studentId);

    setAttendance(prev => {
      const existingIdx = prev.findIndex(a => a.studentId === studentId && a.date === today);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          status,
          checkInTime: checkInTime || updated[existingIdx].checkInTime || new Date().toTimeString().slice(0,5),
          checkOutTime: checkOutTime !== undefined ? checkOutTime : updated[existingIdx].checkOutTime,
          note: note !== undefined ? note : updated[existingIdx].note,
          updatedBy: currentUser?.name || '선생님',
          updatedAt: new Date().toISOString()
        };
        return updated;
      } else {
        const newRecord: AttendanceRecord = {
          id: `att_${Date.now()}`,
          studentId,
          studentName: targetStudent?.name || '학생',
          date: today,
          status,
          checkInTime: checkInTime || new Date().toTimeString().slice(0,5),
          checkOutTime,
          note,
          updatedBy: currentUser?.name || '선생님',
          updatedAt: new Date().toISOString()
        };
        return [newRecord, ...prev];
      }
    });

    logActivity('출결 저장', `'${targetStudent?.name}' 학생 ${status} 출결 저장`);
  };

  // Homework Actions
  const addHomework = (hw: Omit<Homework, 'id' | 'createdAt' | 'createdBy' | 'createdByName' | 'studentStatus'>) => {
    const newHw: Homework = {
      ...hw,
      id: `hw_${Date.now()}`,
      createdBy: currentUser?.uid || 'admin',
      createdByName: currentUser?.name || '선생님',
      createdAt: new Date().toISOString(),
      studentStatus: {}
    };
    setHomework(prev => [newHw, ...prev]);
    logActivity('숙제 등록', `'${newHw.title}' 숙제 등록 완료`);
  };

  const updateHomework = (hwId: string, updates: Partial<Homework>) => {
    setHomework(prev => prev.map(h => h.id === hwId ? { ...h, ...updates } : h));
    logActivity('숙제 수정', `숙제(ID: ${hwId}) 내용 수정 완료`);
  };

  const deleteHomework = (hwId: string) => {
    const target = homework.find(h => h.id === hwId);
    setHomework(prev => prev.filter(h => h.id !== hwId));
    logActivity('숙제 삭제', `'${target?.title || hwId}' 숙제 삭제 완료`);
  };

  const toggleHomeworkChecklist = (hwId: string, itemIndex: number) => {
    setHomework(prev => prev.map(h => {
      if (h.id === hwId) {
        const newChecklists = [...h.checklists];
        newChecklists[itemIndex].completed = !newChecklists[itemIndex].completed;
        return { ...h, checklists: newChecklists };
      }
      return h;
    }));
  };

  const toggleStudentHomeworkComplete = (hwId: string, studentId: string, note?: string) => {
    setHomework(prev => prev.map(h => {
      if (h.id === hwId) {
        const current = h.studentStatus[studentId] || { completed: false };
        const nextCompleted = !current.completed;
        return {
          ...h,
          studentStatus: {
            ...h.studentStatus,
            [studentId]: {
              completed: nextCompleted,
              completedAt: nextCompleted ? new Date().toISOString() : undefined,
              studentNote: note || current.studentNote
            }
          }
        };
      }
      return h;
    }));
    logActivity('숙제 완료 상태 변경', `학생(${studentId}) 숙제 완료 상태 업데이트`);
  };

  // Progress Actions
  const addProgress = (item: Omit<ProgressItem, 'id' | 'date' | 'updatedBy'>) => {
    const newProgress: ProgressItem = {
      ...item,
      id: `prog_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      updatedBy: currentUser?.name || '선생님'
    };
    setProgress(prev => [newProgress, ...prev]);
    logActivity('진도 입력', `'${item.studentName}' 학생 ${item.subject} 진도(${item.unit}) 기록`);
  };

  // Announcements
  const addAnnouncement = (ann: Omit<Announcement, 'id' | 'createdAt' | 'authorName' | 'authorRole' | 'viewCount'>) => {
    const newAnn: Announcement = {
      ...ann,
      id: `ann_${Date.now()}`,
      authorName: currentUser?.name || '원장',
      authorRole: currentUser?.role === 'admin' ? '원장' : '선생님',
      createdAt: new Date().toISOString(),
      viewCount: 1
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    logActivity('공지사항 작성', `'${newAnn.title}' 공지 등록`);
  };

  const updateAnnouncement = (annId: string, updates: Partial<Omit<Announcement, 'id' | 'createdAt' | 'authorName' | 'authorRole'>>) => {
    setAnnouncements(prev => prev.map(a => a.id === annId ? { ...a, ...updates } : a));
    logActivity('공지사항 수정', `공지사항(ID: ${annId}) 수정 완료`);
  };

  const deleteAnnouncement = (annId: string) => {
    const target = announcements.find(a => a.id === annId);
    setAnnouncements(prev => prev.filter(a => a.id !== annId));
    logActivity('공지사항 삭제', `'${target?.title || annId}' 공지 삭제 완료`);
  };

  // Teacher Chat
  const sendTeacherChatMessage = (content: string, fileUrl?: string, fileName?: string, isNotice = false) => {
    const msg: TeacherChatMessage = {
      id: `tc_${Date.now()}`,
      senderId: currentUser?.uid || 'user',
      senderName: currentUser?.name || '사용자',
      senderRole: currentUser?.role === 'admin' ? '원장' : '선생님',
      content,
      fileUrl,
      fileName,
      createdAt: new Date().toISOString(),
      isNotice
    };
    setTeacherChat(prev => [...prev, msg]);
  };

  // Q&A Question Actions
  const addQuestion = (title: string, subject: string, content: string, attachments?: string[]) => {
    const newQ: Question = {
      id: `q_${Date.now()}`,
      studentId: currentUser?.studentId || 's1',
      studentName: currentUser?.name || '학생',
      subject,
      title,
      content,
      attachments,
      status: 'pending',
      createdAt: new Date().toISOString(),
      comments: []
    };
    setQuestions(prev => [newQ, ...prev]);
    logActivity('질문 등록', `'${title}' 학생 질문 업로드`);
  };

  const addQuestionComment = (questionId: string, content: string) => {
    const newComment = {
      id: `qc_${Date.now()}`,
      authorId: currentUser?.uid || 'user',
      authorName: currentUser?.name || '사용자',
      authorRole: currentUser?.role || 'student',
      content,
      createdAt: new Date().toISOString()
    };

    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          status: 'answered' as const,
          comments: [...q.comments, newComment]
        };
      }
      return q;
    }));
    logActivity('질문 답변 작성', `질문 ID(${questionId})에 답변이 등록되었습니다.`);
  };

  // Calendar Event Actions
  const addCalendarEvent = (ev: Omit<CalendarEvent, 'id'>) => {
    const newEv: CalendarEvent = {
      ...ev,
      id: `ev_${Date.now()}`
    };
    setCalendarEvents(prev => [...prev, newEv]);
    logActivity('일정 추가', `'${ev.title}' 일정 등록`);
  };

  const deleteCalendarEvent = (eventId: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== eventId));
  };

  // Timetable Actions (Only Admin / Director authorized)
  const addTimetableSlot = (slot: Omit<TimetableSlot, 'id'>) => {
    const newSlot: TimetableSlot = {
      ...slot,
      id: `tt_${Date.now()}`
    };
    setTimetable(prev => [...prev, newSlot]);
    logActivity('시간표 추가', `'${slot.day}요일 ${slot.subject}(${slot.className})' 수업 시간표 추가`);
  };

  const updateTimetableSlot = (slotId: string, updates: Partial<TimetableSlot>) => {
    setTimetable(prev => prev.map(s => s.id === slotId ? { ...s, ...updates } : s));
    logActivity('시간표 수정', `시간표(ID: ${slotId}) 변경 완료`);
  };

  const deleteTimetableSlot = (slotId: string) => {
    const target = timetable.find(s => s.id === slotId);
    setTimetable(prev => prev.filter(s => s.id !== slotId));
    logActivity('시간표 삭제', `'${target?.day || ''}요일 ${target?.subject || ''}' 시간표 삭제 완료`);
  };

  const updateAcademySettings = (settings: Partial<AcademySettings>) => {
    setAcademySettings(prev => ({ ...prev, ...settings }));
    logActivity('학원 설정 변경', '학원 기본 정보 및 설정 수정');
  };

  const exportBackupJSON = () => {
    const backupData = {
      academySettings,
      students,
      teachers,
      attendance,
      progress,
      homework,
      timetable,
      announcements,
      teacherChat,
      questions,
      calendarEvents,
      activityLogs,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eduflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    logActivity('데이터 백업', '전체 데이터 JSON 백업 다운로드');
  };

  const importBackupJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.students) setStudents(parsed.students);
      if (parsed.teachers) setTeachers(parsed.teachers);
      if (parsed.attendance) setAttendance(parsed.attendance);
      if (parsed.homework) setHomework(parsed.homework);
      if (parsed.announcements) setAnnouncements(parsed.announcements);
      if (parsed.academySettings) setAcademySettings(parsed.academySettings);
      logActivity('데이터 복구', '백업 JSON 데이터 복원 완료');
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        login,
        logout,
        switchDemoRole,
        students,
        teachers,
        attendance,
        progress,
        homework,
        timetable,
        announcements,
        teacherChat,
        questions,
        calendarEvents,
        activityLogs,
        academySettings,
        isDarkMode,
        toggleDarkMode,
        addStudent,
        updateStudent,
        deleteStudent,
        createStudentAccount,
        resetStudentPassword,
        toggleStudentActive,
        addTeacher,
        resetTeacherPassword,
        deleteTeacher,
        saveAttendance,
        addHomework,
        updateHomework,
        deleteHomework,
        toggleHomeworkChecklist,
        toggleStudentHomeworkComplete,
        addProgress,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        sendTeacherChatMessage,
        addQuestion,
        addQuestionComment,
        addCalendarEvent,
        deleteCalendarEvent,
        addTimetableSlot,
        updateTimetableSlot,
        deleteTimetableSlot,
        updateAcademySettings,
        logActivity,
        exportBackupJSON,
        importBackupJSON
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
