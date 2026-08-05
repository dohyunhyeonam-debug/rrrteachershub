import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Announcement } from '../types';
import { Bell, Plus, Pin, Eye, Search, X, Pencil, Trash2 } from 'lucide-react';

export const Announcements: React.FC = () => {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement, role } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Add Form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'urgent' | 'important' | 'normal'>('important');
  const [isPinned, setIsPinned] = useState(false);

  // Edit Form
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editPriority, setEditPriority] = useState<'urgent' | 'important' | 'normal'>('important');
  const [editIsPinned, setEditIsPinned] = useState(false);

  const filteredAnnouncements = announcements.filter(a => a.title.includes(searchQuery) || a.content.includes(searchQuery));

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    addAnnouncement({
      title,
      content,
      priority,
      isPinned
    });

    setShowAddModal(false);
    setTitle('');
    setContent('');
    setPriority('important');
    setIsPinned(false);
  };

  const handleStartEdit = (ann: Announcement) => {
    setEditingAnnId(ann.id);
    setEditTitle(ann.title);
    setEditContent(ann.content);
    setEditPriority(ann.priority);
    setEditIsPinned(ann.isPinned);
    setShowEditModal(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnId || !editTitle.trim() || !editContent.trim()) return;

    updateAnnouncement(editingAnnId, {
      title: editTitle,
      content: editContent,
      priority: editPriority,
      isPinned: editIsPinned
    });

    setShowEditModal(false);
    setEditingAnnId(null);
  };

  const handleDelete = (ann: Announcement) => {
    if (window.confirm(`'${ann.title}' 공지사항을 삭제하시겠습니까?`)) {
      deleteAnnouncement(ann.id);
    }
  };

  const isStaff = role === 'admin' || role === 'teacher';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 sm:p-8 rounded-[32px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" /> 학원 공지사항 게시판
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            특강, 휴관일, 시험 대비 일정 및 중요 수강 안내
          </p>
        </div>

        {isStaff && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>공지 작성하기</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="공지사항 제목 또는 내용 검색..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/80 dark:border-slate-700 text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            등록된 공지사항이 없습니다.
          </div>
        ) : (
          filteredAnnouncements.map((ann) => (
            <div 
              key={ann.id}
              className={`p-6 rounded-[32px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border shadow-xl shadow-slate-200/40 dark:shadow-none space-y-3 transition-all ${
                ann.isPinned ? 'border-amber-400/80 ring-1 ring-amber-400/30' : 'border-white/80 dark:border-slate-800/80'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {ann.isPinned && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-extrabold text-[11px]">
                      <Pin className="w-3 h-3 fill-current" /> 고정 공지
                    </span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold text-white ${
                    ann.priority === 'urgent' ? 'bg-rose-600' : ann.priority === 'important' ? 'bg-indigo-600' : 'bg-slate-500'
                  }`}>
                    {ann.priority === 'urgent' ? '긴급' : ann.priority === 'important' ? '중요' : '일반'}
                  </span>
                  <span className="text-xs text-slate-400">
                    작성자: <span className="font-bold text-slate-700 dark:text-slate-300">{ann.authorName} ({ann.authorRole})</span>
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span>{ann.createdAt.split('T')[0]}</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{ann.viewCount}</span>
                  </span>

                  {/* Staff Edit & Delete Buttons */}
                  {isStaff && (
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => handleStartEdit(ann)}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
                        title="공지 수정"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(ann)}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                        title="공지 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <h2 className="text-base font-bold text-slate-900 dark:text-white">{ann.title}</h2>
              <div className="whitespace-pre-wrap text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                {ann.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" /> 신규 공지사항 작성
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">공지 제목 *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="예: 2학기 중간고사 대비 특강 안내"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">공지 중요도</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold focus:outline-none"
                  >
                    <option value="urgent">긴급 (Urgent)</option>
                    <option value="important">중요 (Important)</option>
                    <option value="normal">일반 (Normal)</option>
                  </select>
                </div>

                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold select-none">
                    <input
                      type="checkbox"
                      checked={isPinned}
                      onChange={e => setIsPinned(e.target.checked)}
                      className="rounded text-indigo-600 w-4 h-4"
                    />
                    <span>상단 고정 공지</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">공지 상세 내용 *</label>
                <textarea
                  rows={5}
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="상세 내용을 입력하세요..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm transition-all"
                >
                  공지 등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Pencil className="w-5 h-5 text-indigo-600" /> 공지사항 수정
              </h2>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">공지 제목 *</label>
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
                  <label className="block font-semibold mb-1">공지 중요도</label>
                  <select
                    value={editPriority}
                    onChange={e => setEditPriority(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold focus:outline-none"
                  >
                    <option value="urgent">긴급 (Urgent)</option>
                    <option value="important">중요 (Important)</option>
                    <option value="normal">일반 (Normal)</option>
                  </select>
                </div>

                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold select-none">
                    <input
                      type="checkbox"
                      checked={editIsPinned}
                      onChange={e => setEditIsPinned(e.target.checked)}
                      className="rounded text-indigo-600 w-4 h-4"
                    />
                    <span>상단 고정 공지</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">공지 상세 내용 *</label>
                <textarea
                  rows={5}
                  required
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm transition-all"
                >
                  수정 저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

