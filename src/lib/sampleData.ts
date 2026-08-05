import { Student, Teacher, AttendanceRecord, Homework, ProgressItem, TimetableSlot, Announcement, TeacherChatMessage, Question, CalendarEvent, ActivityLog, AcademySettings, UserProfile } from '../types';

export const INITIAL_ACADEMY_SETTINGS: AcademySettings = {
  name: 'RalRalRal Class',
  logoUrl: '',
  address: '서울특별시 강남구 대치동 123 에듀타운 4층',
  phone: '02-555-8209',
  businessNumber: '120-88-99012',
  directorName: '박도현',
  theme: 'light',
  announcementHeader: '학생들의 지혜와 열정을 피우는 든든한 학원'
};

export const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'admin1',
    loginId: 'dohyunpark',
    name: '박도현',
    role: 'admin',
    phone: '010-1234-5678',
    email: 'dohyunpark@eduflow.ac.kr',
    createdAt: '2026-01-01T00:00:00Z',
    isActive: true,
  }
];

export const INITIAL_TEACHERS: Teacher[] = [];

export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

export const INITIAL_PROGRESS: ProgressItem[] = [];

export const INITIAL_HOMEWORK: Homework[] = [];

export const INITIAL_TIMETABLE: TimetableSlot[] = [];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: '📌 2026년 2학기 중간고사 대비 특강 및 클리닉 시간표 안내',
    content: `안녕하세요, RalRalRal Class입니다.
9월 예정된 학교별 2학기 중간고사 대비를 위해 주말 1:1 약점 보완 클리닉이 열립니다.

- 대상: 중 / 고등 전 수강생
- 기간: 8월 18일 ~ 9월 20일
- 문의: 각 담당 선생님 및 상담실`,
    priority: 'urgent',
    isPinned: true,
    authorName: '박도현',
    authorRole: '원장',
    createdAt: '2026-08-01T09:00:00Z',
    viewCount: 12
  }
];

export const INITIAL_TEACHER_CHAT: TeacherChatMessage[] = [];

export const INITIAL_QUESTIONS: Question[] = [];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    userId: 'admin1',
    userName: '박도현',
    userRole: 'admin',
    action: '시스템 가동',
    details: '원장(박도현) 통합 학원 관리 시스템 가동 시작',
    timestamp: '2026-08-05T09:00:00Z'
  }
];
