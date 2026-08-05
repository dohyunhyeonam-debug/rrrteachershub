import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MathFormula } from './MathFormula';
import { 
  HelpCircle, Plus, MessageSquare, CheckCircle, Clock, 
  Send, Search, Sparkles, X, User 
} from 'lucide-react';

export const ChatQA: React.FC = () => {
  const { questions, addQuestion, addQuestionComment, currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'answered'>('all');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Question Form
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('수학');
  const [content, setContent] = useState('');

  // Comment input
  const [replyContent, setReplyContent] = useState('');

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.title.includes(searchQuery) || q.content.includes(searchQuery) || q.studentName.includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || q.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const selectedQuestion = questions.find(q => q.id === selectedQuestionId) || filteredQuestions[0];

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    addQuestion(title.trim(), subject, content.trim());
    setShowAddModal(false);
    setTitle('');
    setContent('');
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion || !replyContent.trim()) return;

    addQuestionComment(selectedQuestion.id, replyContent.trim());
    setReplyContent('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      
      {/* Left Column: Questions List */}
      <div className="lg:col-span-1 rounded-[32px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200/60 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" /> 질문게시판 (Q&A)
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow"
            >
              질문하기
            </button>
          </div>

          {/* Search & Status Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="질문 검색..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/80 dark:border-slate-700 text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60">
              <button
                onClick={() => setFilterStatus('all')}
                className={`flex-1 py-1 rounded-lg text-[11px] font-bold ${
                  filterStatus === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`flex-1 py-1 rounded-lg text-[11px] font-bold ${
                  filterStatus === 'pending' ? 'bg-amber-500 text-white shadow' : 'text-slate-500'
                }`}
              >
                답변대기
              </button>
              <button
                onClick={() => setFilterStatus('answered')}
                className={`flex-1 py-1 rounded-lg text-[11px] font-bold ${
                  filterStatus === 'answered' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500'
                }`}
              >
                답변완료
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Questions List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {filteredQuestions.map((q) => {
            const isSelected = selectedQuestion?.id === q.id;

            return (
              <div
                key={q.id}
                onClick={() => setSelectedQuestionId(q.id)}
                className={`p-4 cursor-pointer transition-all ${
                  isSelected ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-l-4 border-indigo-600' : 'hover:bg-white/40 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">[{q.subject}] {q.studentName}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    q.status === 'answered' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {q.status === 'answered' ? '답변 완료' : '답변 대기'}
                  </span>
                </div>

                <h3 className="font-bold text-xs text-slate-900 dark:text-white truncate">{q.title}</h3>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{q.content}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Selected Question Detail & Solution Discussion */}
      <div className="lg:col-span-2 rounded-[32px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col overflow-hidden">
        {selectedQuestion ? (
          <>
            {/* Question Detail Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-bold text-xs">
                  {selectedQuestion.subject} 질문
                </span>
                <span className="text-xs text-slate-400">
                  작성자: <span className="font-bold text-slate-700 dark:text-slate-300">{selectedQuestion.studentName}</span> | {selectedQuestion.createdAt.split('T')[0]}
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedQuestion.title}</h2>
            </div>

            {/* Content & Replies Scroll Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              
              {/* Question Body */}
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="text-xs font-bold text-indigo-600 mb-1">📐 질문 내용 및 수학 수식:</div>
                <MathFormula content={selectedQuestion.content} className="text-sm text-slate-800 dark:text-slate-200" />
              </div>

              {/* Answers & Comments List */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>선생님 답변 및 해설 ({selectedQuestion.comments.length})</span>
                </h3>

                {selectedQuestion.comments.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    선생님의 답변을 기다리고 있습니다.
                  </div>
                ) : (
                  selectedQuestion.comments.map((comment) => (
                    <div key={comment.id} className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300">
                          {comment.authorName} ({comment.authorRole === 'teacher' ? '선생님' : '원장님'})
                        </span>
                        <span className="text-[10px] text-slate-400">{comment.createdAt.split('T')[0]}</span>
                      </div>
                      <MathFormula content={comment.content} className="text-xs text-slate-800 dark:text-slate-200" />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Solution Reply Form */}
            <form onSubmit={handleReplySubmit} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center gap-3">
              <input
                type="text"
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                placeholder="답변 및 단계별 풀이 작성 (LaTeX $x^2$ 예시 가능)..."
                className="flex-1 py-3 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow"
              >
                답변 등록
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
            질문을 선택하세요.
          </div>
        )}
      </div>

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" /> 질문 작성하기
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">질문 제목</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="예: 삼각비 높이 구하기 문제 질문"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">과목</label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  <option value="수학">수학</option>
                  <option value="영어">영어</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">질문 내용 (수학 공식 지원: $...$)</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="질문내용 작성. 수학 공식 예시: $ax^2 + bx + c = 0$"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
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
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow"
                >
                  질문 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
