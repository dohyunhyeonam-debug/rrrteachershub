import { Student } from '../types';

/**
 * 날짜 포맷팅 헬퍼 (예: 2026년 8월 5일 수요일)
 */
export function formatKoreanDate(dateString?: string | Date): { dateStr: string; dayOfWeek: string; timeStr: string } {
  const d = dateString ? new Date(dateString) : new Date();
  
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const dayOfWeek = days[d.getDay()];
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  const dateStr = `${year}년 ${month}월 ${date}일`;
  
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}:${seconds}`;

  return { dateStr, dayOfWeek, timeStr };
}

/**
 * CSV 파일로 학생 목록 내보내기 (Excel 호환 UTF-8 BOM 포함)
 */
export function exportStudentsToCSV(students: Student[], filename = '학생목록_에듀플로우.csv') {
  const headers = ['아이디', '이름', '연락처', '보호자연락처', '학교', '학년', '반', '수강과목', '등원요일', '등원시간', '메모'];
  
  const rows = students.map(s => [
    s.loginId,
    s.name,
    s.phone,
    s.parentPhone,
    s.school,
    s.grade,
    s.className,
    `"${s.subjects.join(', ')}"`,
    `"${s.attendanceDays.join(', ')}"`,
    s.attendanceTime,
    `"${(s.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 랜덤 아이디/비밀번호 생성기
 */
export function generateCredentials(prefix = 'std') {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const loginId = `${prefix}_${randomNum}`;
  const passChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let initialPassword = '';
  for (let i = 0; i < 8; i++) {
    initialPassword += passChars.charAt(Math.floor(Math.random() * passChars.length));
  }
  return { loginId, initialPassword };
}

/**
 * 인쇄용 HTML 프린터 헬퍼 (출결표, 진도표, 계정 전달표)
 */
export function printDocument(title: string, htmlContent: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #1e293b; }
          h1 { font-size: 22px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; font-size: 14px; }
          th { background-color: #f1f5f9; font-weight: 600; }
          .footer { margin-top: 40px; text-align: right; font-size: 12px; color: #64748b; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #e2e8f0; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div>${htmlContent}</div>
        <div class="footer">발행일: ${new Date().toLocaleDateString('ko-KR')} | 에듀플로우(EduFlow) 학원 관리 시스템</div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
