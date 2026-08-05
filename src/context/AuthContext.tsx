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
import { db } from '../firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

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
  // Session persistence: null by default unless logged in on this browser session
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('eduflow_session_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('eduflow_darkmode');
    return saved ? JSON.parse(saved) : false;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('eduflow_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('eduflow_teachers');
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('eduflow_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [progress, setProgress] = useState<ProgressItem[]>(() => {
    const saved = localStorage.getItem('eduflow_progress');
    return saved ? JSON.parse(saved) : INITIAL_PROGRESS;
  });

  const [homework, setHomework] = useState<Homework[]>(() => {
    const saved = localStorage.getItem('eduflow_homework');
    return saved ? JSON.parse(saved) : INITIAL_HOMEWORK;
  });

  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => {
    const saved = localStorage.getItem('eduflow_timetable');
    return saved ? JSON.parse(saved) : INITIAL_TIMETABLE;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('eduflow_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [teacherChat, setTeacherChat] = useState<TeacherChatMessage[]>(() => {
    const saved = localStorage.getItem('eduflow_teacher_chat');
    return saved ? JSON.parse(saved) : INITIAL_TEACHER_CHAT;
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('eduflow_questions');
    return saved ? JSON.parse(saved) : INITIAL_QUESTIONS;
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('eduflow_events');
    return saved ? JSON.parse(saved) : INITIAL_CALENDAR_EVENTS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('eduflow_logs');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  const [academySettings, setAcademySettings] = useState<AcademySettings>(() => {
    const saved = localStorage.getItem('eduflow_settings');
    if (saved) {
      try {
        const parsed: AcademySettings = JSON.parse(saved);
        if (!parsed.name || parsed.name.includes('에듀플로우')) {
          return { ...parsed, name: 'RalRalRal Class' };
        }
        return parsed;
      } catch (e) {
        return INITIAL_ACADEMY_SETTINGS;
      }
    }
    return INITIAL_ACADEMY_SETTINGS;
  });

  // Dark mode effect
  useEffect(() => {
    localStorage.setItem('eduflow_darkmode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Session user storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('eduflow_session_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('eduflow_session_user');
    }
  }, [currentUser]);

  // Local Storage backups
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

  // Real-time Cloud Firestore synchronization across devices
  useEffect(() => {
    const unsubStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
      if (!snapshot.empty) {
        const docs = snapshot.docs.map(d => d.data() as Student);
        setStudents(docs);
      }
    }, (err) => console.warn('Firestore students listener:', err));

    const unsubTeachers = onSnapshot(collection(db, 'teachers'), (snapshot) => {
      if (!snapshot.empty) {
        const docs = snapshot.docs.map(d => d.data() as Teacher);
        setTeachers(docs);
      }
    }, (err) => console.warn('Firestore teachers listener:', err));

    const unsubAttendance = onSnapshot(collection(db, 'attendance'), (snapshot) => {
      if (!snapshot.empty) {
        const docs = snapshot.docs.map(d => d.data() as AttendanceRecord);
        setAttendance(docs);
      }
    }, (err) => console.warn('Firestore attendance listener:', err));

    const unsubProgress = onSnapshot(collection(db, 'progress'), (snapshot) => {
      if (!snapshot.empty) {
        const docs = snapshot.docs.map(d => d.data() as ProgressItem);
        setProgress(docs);
      }
    }, (err) => console.warn('Firestore progress listener:', err));

    const unsubHomework = onSnapshot(collection(db, 'homework'), (snapshot) => {
      if (!snapshot.empty) {
        const docs = snapshot.docs.map(d => d.data() as Homework);
        setHomework(docs);
      }
    }, (err) => console.warn('Firestore homework listener:', err));

    const unsubTimetable = onSnapshot(collection(db, 'timetable'), (snapshot) => {
      if (!snapshot.empty) {
        const docs = snapshot.docs.map(d => d.data() as TimetableSlot);
        setTimetable(docs);
      }
    }, (err) => console.warn('Firestore timetable listener:', err));

    const unsubAnnouncements = onSnapshot(collection(db, 'announcements'), (snapshot) => {
      if (!snapshot.empty) {
        const docs = snapshot.docs.map(d => d.data() as Announcement);
        setAnnouncements(docs);
      }
    }, (err) => console.warn('Firestore announcements listener:', err));

    const unsubTeacherChat = onSnapshot(collection(db, 'teacherChat'), (snapshot) => {
      if (!snapshot.empty) {
        const docs = snapshot.docs.map(d => d.data() as TeacherChatMessage);
        setTeacherChat(docs);
      }
    }, (err) => console.warn('Firestore teacherChat listener:', err));

    const unsubQuestions = onSnapshot(collection(db, 'questions'), (snapshot) => {
      if (!snapshot.empty) {
        const docs = snapshot.docs.map(d => d.data() as Question);
        setQuestions(docs);
      }
    }, (err) => console.warn('Firestore questions listener:', err));

    const unsubCalendarEvents = onSnapshot(collection(db, 'calendarEvents'), (snapshot) => {
      if (!snapshot.empty) {
        const docs = snapshot.docs.map(d => d.data() as CalendarEvent);
        setCalendarEvents(docs);
      }
    }, (err) => console.warn('Firestore calendarEvents listener:', err));

    const unsubActivityLogs = onSnapshot(collection(db, 'activityLogs'), (snapshot) => {
      if (!snapshot.empty) {
        const docs = snapshot.docs.map(d => d.data() as ActivityLog);
        setActivityLogs(docs);
      }
    }, (err) => console.warn('Firestore activityLogs listener:', err));

    const unsubSettings = onSnapshot(doc(db, 'settings', 'academy'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as AcademySettings;
        if (!data.name || data.name.includes('에듀플로우')) {
          data.name = 'RalRalRal Class';
          setDoc(doc(db, 'settings', 'academy'), data).catch(console.error);
        }
        setAcademySettings(data);
      } else {
        setDoc(doc(db, 'settings', 'academy'), INITIAL_ACADEMY_SETTINGS).catch(console.error);
      }
    }, (err) => console.warn('Firestore settings listener:', err));

    return () => {
      unsubStudents();
      unsubTeachers();
      unsubAttendance();
      unsubProgress();
      unsubHomework();
      unsubTimetable();
      unsubAnnouncements();
      unsubTeacherChat();
      unsubQuestions();
      unsubCalendarEvents();
      unsubActivityLogs();
      unsubSettings();
    };
  }, []);

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
    setDoc(doc(db, 'activityLogs', newLog.id), newLog).catch(err => console.error('Firestore log err:', err));
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
    setDoc(doc(db, 'students', id), newStudent).catch(err => console.error('Firestore err:', err));
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
    updateDoc(doc(db, 'students', studentId), updates).catch(err => console.error('Firestore err:', err));
    logActivity('학생 정보 수정', `학생 ID(${studentId}) 정보가 업데이트되었습니다.`);
  };

  const deleteStudent = (studentId: string) => {
    const target = students.find(s => s.id === studentId);
    setStudents(prev => prev.filter(s => s.id !== studentId));
    deleteDoc(doc(db, 'students', studentId)).catch(err => console.error('Firestore err:', err));
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
    updateDoc(doc(db, 'students', studentId), { loginId, initialPassword: randPass }).catch(err => console.error('Firestore err:', err));

    logActivity('학생 계정 생성', `학생 ID(${studentId}) 계정이 생성되었습니다 (${loginId})`);
    return { loginId, initialPassword: randPass };
  };

  const resetStudentPassword = (studentId: string, customPass?: string) => {
    const newPass = customPass || Math.floor(100000 + Math.random() * 900000).toString();
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, initialPassword: newPass } : s));
    updateDoc(doc(db, 'students', studentId), { initialPassword: newPass }).catch(err => console.error('Firestore err:', err));
    logActivity('비밀번호 변경', `학생 ID(${studentId}) 비밀번호가 변경되었습니다.`);
    return newPass;
  };

  const toggleStudentActive = (studentId: string) => {
    const target = students.find(s => s.id === studentId);
    if (target) {
      const nextActive = !target.isActive;
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, isActive: nextActive } : s));
      updateDoc(doc(db, 'students', studentId), { isActive: nextActive }).catch(err => console.error('Firestore err:', err));
    }
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
    setDoc(doc(db, 'teachers', id), newTeacher).catch(err => console.error('Firestore err:', err));
    logActivity('선생님 등록', `'${newTeacher.name}' 선생님 계정 생성 완료 (ID: ${loginId})`);
    return newTeacher;
  };

  const resetTeacherPassword = (teacherId: string, customPass?: string) => {
    const newPass = customPass || Math.floor(100000 + Math.random() * 900000).toString();
    setTeachers(prev => prev.map(t => t.id === teacherId ? { ...t, initialPassword: newPass } : t));
    updateDoc(doc(db, 'teachers', teacherId), { initialPassword: newPass }).catch(err => console.error('Firestore err:', err));
    logActivity('선생님 비밀번호 변경', `선생님 ID(${teacherId}) 비밀번호가 변경되었습니다.`);
    return newPass;
  };

  const deleteTeacher = (teacherId: string) => {
    setTeachers(prev => prev.filter(t => t.id !== teacherId));
    deleteDoc(doc(db, 'teachers', teacherId)).catch(err => console.error('Firestore err:', err));
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

    let targetRecord: AttendanceRecord;
    setAttendance(prev => {
      const existingIdx = prev.findIndex(a => a.studentId === studentId && a.date === today);
      if (existingIdx >= 0) {
        const updated = [...prev];
        targetRecord = {
          ...updated[existingIdx],
          status,
          checkInTime: checkInTime || updated[existingIdx].checkInTime || new Date().toTimeString().slice(0,5),
          checkOutTime: checkOutTime !== undefined ? checkOutTime : updated[existingIdx].checkOutTime,
          note: note !== undefined ? note : updated[existingIdx].note,
          updatedBy: currentUser?.name || '선생님',
          updatedAt: new Date().toISOString()
        };
        updated[existingIdx] = targetRecord;
        return updated;
      } else {
        targetRecord = {
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
        return [targetRecord, ...prev];
      }
    });

    setTimeout(() => {
      if (targetRecord) {
        setDoc(doc(db, 'attendance', targetRecord.id), targetRecord).catch(err => console.error('Firestore err:', err));
      }
    }, 0);

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
    setDoc(doc(db, 'homework', newHw.id), newHw).catch(err => console.error('Firestore err:', err));
    logActivity('숙제 등록', `'${newHw.title}' 숙제 등록 완료`);
  };

  const updateHomework = (hwId: string, updates: Partial<Homework>) => {
    setHomework(prev => prev.map(h => h.id === hwId ? { ...h, ...updates } : h));
    updateDoc(doc(db, 'homework', hwId), updates).catch(err => console.error('Firestore err:', err));
    logActivity('숙제 수정', `숙제(ID: ${hwId}) 내용 수정 완료`);
  };

  const deleteHomework = (hwId: string) => {
    const target = homework.find(h => h.id === hwId);
    setHomework(prev => prev.filter(h => h.id !== hwId));
    deleteDoc(doc(db, 'homework', hwId)).catch(err => console.error('Firestore err:', err));
    logActivity('숙제 삭제', `'${target?.title || hwId}' 숙제 삭제 완료`);
  };

  const toggleHomeworkChecklist = (hwId: string, itemIndex: number) => {
    let updatedChecklists: any = null;
    setHomework(prev => prev.map(h => {
      if (h.id === hwId) {
        const newChecklists = [...h.checklists];
        newChecklists[itemIndex].completed = !newChecklists[itemIndex].completed;
        updatedChecklists = newChecklists;
        return { ...h, checklists: newChecklists };
      }
      return h;
    }));
    if (updatedChecklists) {
      updateDoc(doc(db, 'homework', hwId), { checklists: updatedChecklists }).catch(err => console.error('Firestore err:', err));
    }
  };

  const toggleStudentHomeworkComplete = (hwId: string, studentId: string, note?: string) => {
    let updatedStatus: any = null;
    setHomework(prev => prev.map(h => {
      if (h.id === hwId) {
        const current = h.studentStatus[studentId] || { completed: false };
        const nextCompleted = !current.completed;
        updatedStatus = {
          ...h.studentStatus,
          [studentId]: {
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
            studentNote: note || current.studentNote
          }
        };
        return {
          ...h,
          studentStatus: updatedStatus
        };
      }
      return h;
    }));
    if (updatedStatus) {
      updateDoc(doc(db, 'homework', hwId), { studentStatus: updatedStatus }).catch(err => console.error('Firestore err:', err));
    }
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
    setDoc(doc(db, 'progress', newProgress.id), newProgress).catch(err => console.error('Firestore err:', err));
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
    setDoc(doc(db, 'announcements', newAnn.id), newAnn).catch(err => console.error('Firestore err:', err));
    logActivity('공지사항 작성', `'${newAnn.title}' 공지 등록`);
  };

  const updateAnnouncement = (annId: string, updates: Partial<Omit<Announcement, 'id' | 'createdAt' | 'authorName' | 'authorRole'>>) => {
    setAnnouncements(prev => prev.map(a => a.id === annId ? { ...a, ...updates } : a));
    updateDoc(doc(db, 'announcements', annId), updates).catch(err => console.error('Firestore err:', err));
    logActivity('공지사항 수정', `공지사항(ID: ${annId}) 수정 완료`);
  };

  const deleteAnnouncement = (annId: string) => {
    const target = announcements.find(a => a.id === annId);
    setAnnouncements(prev => prev.filter(a => a.id !== annId));
    deleteDoc(doc(db, 'announcements', annId)).catch(err => console.error('Firestore err:', err));
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
    setDoc(doc(db, 'teacherChat', msg.id), msg).catch(err => console.error('Firestore err:', err));
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
    setDoc(doc(db, 'questions', newQ.id), newQ).catch(err => console.error('Firestore err:', err));
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

    let updatedComments: any = null;
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        updatedComments = [...q.comments, newComment];
        return {
          ...q,
          status: 'answered' as const,
          comments: updatedComments
        };
      }
      return q;
    }));
    if (updatedComments) {
      updateDoc(doc(db, 'questions', questionId), { status: 'answered', comments: updatedComments }).catch(err => console.error('Firestore err:', err));
    }
    logActivity('질문 답변 작성', `질문 ID(${questionId})에 답변이 등록되었습니다.`);
  };

  // Calendar Event Actions
  const addCalendarEvent = (ev: Omit<CalendarEvent, 'id'>) => {
    const newEv: CalendarEvent = {
      ...ev,
      id: `ev_${Date.now()}`
    };
    setCalendarEvents(prev => [...prev, newEv]);
    setDoc(doc(db, 'calendarEvents', newEv.id), newEv).catch(err => console.error('Firestore err:', err));
    logActivity('일정 추가', `'${ev.title}' 일정 등록`);
  };

  const deleteCalendarEvent = (eventId: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== eventId));
    deleteDoc(doc(db, 'calendarEvents', eventId)).catch(err => console.error('Firestore err:', err));
  };

  // Timetable Actions (Only Admin / Director authorized)
  const addTimetableSlot = (slot: Omit<TimetableSlot, 'id'>) => {
    const newSlot: TimetableSlot = {
      ...slot,
      id: `tt_${Date.now()}`
    };
    setTimetable(prev => [...prev, newSlot]);
    setDoc(doc(db, 'timetable', newSlot.id), newSlot).catch(err => console.error('Firestore err:', err));
    logActivity('시간표 추가', `'${slot.day}요일 ${slot.subject}(${slot.className})' 수업 시간표 추가`);
  };

  const updateTimetableSlot = (slotId: string, updates: Partial<TimetableSlot>) => {
    setTimetable(prev => prev.map(s => s.id === slotId ? { ...s, ...updates } : s));
    updateDoc(doc(db, 'timetable', slotId), updates).catch(err => console.error('Firestore err:', err));
    logActivity('시간표 수정', `시간표(ID: ${slotId}) 변경 완료`);
  };

  const deleteTimetableSlot = (slotId: string) => {
    const target = timetable.find(s => s.id === slotId);
    setTimetable(prev => prev.filter(s => s.id !== slotId));
    deleteDoc(doc(db, 'timetable', slotId)).catch(err => console.error('Firestore err:', err));
    logActivity('시간표 삭제', `'${target?.day || ''}요일 ${target?.subject || ''}' 시간표 삭제 완료`);
  };

  const updateAcademySettings = (settings: Partial<AcademySettings>) => {
    const newSettings = { ...academySettings, ...settings };
    setAcademySettings(newSettings);
    setDoc(doc(db, 'settings', 'academy'), newSettings).catch(err => console.error('Firestore err:', err));
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
