import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, Paperclip, Search, Pin, Shield, UserCheck, AlertCircle } from 'lucide-react';

export const ChatTeacher: React.FC = () => {
  const { teacherChat, sendTeacherChatMessage, currentUser, role } = useAuth();
  const [inputMsg, setInputMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNoticeMode, setIsNoticeMode] = useState(false);

  if (role === 'student') {
    return (
      <div className="p-8 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-center text-amber-800 dark:text-amber-300">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-amber-500" />
        <h2 className="text-lg font-bold">선생님 전용 채널</h2>
        <p className="text-xs mt-1">본 채널은 원장님 및 교강사 전용 대화방입니다. 학생은 '학생 질문 채널'을 이용해 주세요.</p>
      </div>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    sendTeacherChatMessage(inputMsg.trim(), undefined, undefined, isNoticeMode);
    setInputMsg('');
    setIsNoticeMode(false);
  };

  const filteredChat = teacherChat.filter(msg => msg.content.includes(searchQuery) || msg.senderName.includes(searchQuery));

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col rounded-[32px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
      
      {/* Top Bar */}
      <div className="p-4 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3 bg-white/30 dark:bg-slate-800/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">선생님 & 원장 전용 교무 채널</h2>
            <p className="text-xs text-slate-500">실시간 대화, 공지 전달 및 파일 공유</p>
          </div>
        </div>

        <div className="relative w-48 sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="메시지 검색..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/80 dark:border-slate-700 text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {filteredChat.map((msg) => {
          const isMe = msg.senderId === currentUser?.uid;

          return (
            <div 
              key={msg.id} 
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400 font-medium">
                <span>{msg.senderName} ({msg.senderRole})</span>
                <span>•</span>
                <span>{msg.createdAt.split('T')[1]?.slice(0, 5) || '방금'}</span>
              </div>

              <div 
                className={`max-w-md p-4 rounded-3xl text-xs leading-relaxed shadow-sm ${
                  msg.isNotice
                    ? 'bg-amber-500 text-slate-950 font-bold border-2 border-amber-400'
                    : isMe
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700'
                }`}
              >
                {msg.isNotice && (
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold mb-1 text-slate-950">
                    <Pin className="w-3.5 h-3.5 fill-current" />
                    <span>중요 교무 공지</span>
                  </div>
                )}
                <p>{msg.content}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsNoticeMode(!isNoticeMode)}
          className={`p-2.5 rounded-2xl border text-xs font-bold transition-all ${
            isNoticeMode ? 'bg-amber-500 text-slate-950 border-amber-400 shadow' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
          }`}
          title="중요 공지 모드"
        >
          <Pin className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputMsg}
          onChange={e => setInputMsg(e.target.value)}
          placeholder={isNoticeMode ? '중요 공지 메시지를 입력하세요...' : '교무 대화 메시지를 입력하세요...'}
          className="flex-1 py-3 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />

        <button
          type="submit"
          className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-500/20 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
