/**
 * 에듀플로우(EduFlow) 학원 관리 시스템 - 데이터 타입 정의
 */

export type UserRole = 'admin' | 'teacher' | 'student';

export interface UserProfile {
  uid: string;
  loginId: string;
  name: string;
  role: UserRole;
  phone?: string;
  email?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
  // Role specific fields
  teacherId?: string;
  studentId?: string;
}

export interface Student {
  id: string;
  loginId: string;
  name: string;
  phone: string;
  parentPhone: string;
  school: string;
  grade: string; // e.g., '중3', '고1'
  className: string; // e.g., 'A반', '심화반'
  subjects: string[]; // e.g., ['수학', '영어']
  attendanceDays: string[]; // e.g., ['월', '수', '금']
  attendanceTime: string; // e.g., '17:00'
  notes?: string;
  photoUrl?: string;
  qrCode?: string;
  isActive: boolean;
  initialPassword?: string;
  createdAt: string;
}

export interface Teacher {
  id: string;
  loginId: string;
  name: string;
  phone: string;
  subjects: string[];
  assignedClasses: string[];
  initialPassword?: string;
  createdAt: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'early_leave' | 'none';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkInTime?: string; // HH:mm
  checkOutTime?: string; // HH:mm
  note?: string;
  updatedBy: string;
  updatedAt: string;
}

export interface ProgressItem {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  textbook: string;
  unit: string;
  page: string;
  status: 'completed' | 'in_progress' | 'pending';
  note?: string;
  date: string; // YYYY-MM-DD
  updatedBy: string;
}

export interface HomeworkChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Homework {
  id: string;
  title: string;
  subject: string;
  targetType: 'all' | 'class' | 'student';
  targetValue: string; // class name or student id
  targetStudentName?: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  checklists: HomeworkChecklistItem[];
  attachments?: string[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
  // Map of studentId -> status
  studentStatus: Record<string, {
    completed: boolean;
    completedAt?: string;
    studentNote?: string;
  }>;
}

export interface TimetableSlot {
  id: string;
  day: '월' | '화' | '수' | '목' | '금' | '토' | '일';
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  subject: string;
  className: string;
  teacherName: string;
  room?: string;
  targetStudentIds?: string[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'urgent' | 'important' | 'normal';
  isPinned: boolean;
  authorName: string;
  authorRole: string;
  createdAt: string;
  attachments?: string[];
  viewCount: number;
}

export interface TeacherChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderPhoto?: string;
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: 'image' | 'pdf' | 'doc' | 'other';
  createdAt: string;
  isNotice?: boolean;
}

export interface QuestionComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  createdAt: string;
  attachments?: string[];
}

export interface Question {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  title: string;
  content: string; // supports LaTeX / Math formulas e.g. $x^2 + y^2 = r^2$
  attachments?: string[];
  status: 'pending' | 'answered';
  createdAt: string;
  comments: QuestionComment[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  endDate?: string;
  type: 'academy' | 'exam' | 'holiday' | 'homework' | 'birthday';
  description?: string;
  color?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
}

export interface AcademySettings {
  name: string;
  logoUrl?: string;
  address: string;
  phone: string;
  businessNumber?: string;
  directorName: string;
  theme: 'light' | 'dark' | 'system';
  announcementHeader?: string;
}
