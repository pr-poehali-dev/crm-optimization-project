import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { USERS } from '@/data/mock';
import { type Comment } from '@/data/store';

export default function CommentsPanel({
  comments,
  onSend,
}: {
  comments: Comment[];
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState('');

  const send = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2 flex-shrink-0 px-0.5">
        Комментарии {comments.length > 0 && `(${comments.length})`}
      </p>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
        {comments.length === 0 && (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
            Пока нет комментариев
          </div>
        )}
        {comments.map(c => {
          const author = USERS.find(u => u.id === c.authorId);
          return (
            <div key={c.id} className="flex gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5" style={{ background: 'hsl(244 80% 60%)' }}>
                {author?.avatar.slice(0, 1)}
              </div>
              <div className="flex-1 bg-secondary/60 rounded-xl p-2.5 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-foreground">{author?.name.split(' ')[0]}</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-sm text-foreground break-words">{c.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 mt-2 flex-shrink-0">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Написать комментарий..."
          className="crm-input flex-1"
        />
        <button onClick={send} disabled={!text.trim()} className="px-3 py-2 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90 disabled:opacity-30 flex-shrink-0" style={{ background: 'hsl(244 80% 60%)' }}>
          <Icon name="Send" size={15} />
        </button>
      </div>
    </div>
  );
}
