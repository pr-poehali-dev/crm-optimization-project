import { useState, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { USERS, type Task } from '@/data/mock';
import { useStore, addTask, addComment, updateTaskStatus, renameTaskStatus, type TaskStatusId } from '@/data/store';
import CommentsPanel from '@/components/CommentsPanel';
import ClientPicker from '@/components/ClientPicker';

const priorityConfig: Record<string, { label: string; badge: string; dot: string }> = {
  high: { label: 'Высокий', badge: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500' },
  medium: { label: 'Средний', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  low: { label: 'Низкий', badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
};
const statusBadgeCls: Record<TaskStatusId, string> = {
  todo: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-100 text-blue-700',
  done: 'bg-emerald-100 text-emerald-700',
};
const columnVisuals: { id: TaskStatusId; color: string }[] = [
  { id: 'todo', color: 'hsl(220 14% 46%)' },
  { id: 'in_progress', color: 'hsl(214 84% 56%)' },
  { id: 'done', color: 'hsl(158 64% 45%)' },
];
const priorityOpts = [
  { id: 'low' as Task['priority'], label: 'Низкий', cls: 'bg-slate-100 text-slate-600' },
  { id: 'medium' as Task['priority'], label: 'Средний', cls: 'bg-amber-100 text-amber-700' },
  { id: 'high' as Task['priority'], label: 'Высокий', cls: 'bg-rose-100 text-rose-700' },
];

// ── New Task Modal ────────────────────────────────────────────────────────────
function NewTaskModal({ onClose }: { onClose: () => void }) {
  const { clients } = useStore();
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [assigneeId, setAssigneeId] = useState(USERS[1].id);
  const [clientId, setClientId] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDate, setDueDate] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState('');

  const handleClientChange = (id: string) => {
    setClientId(id);
    const c = clients.find(c => c.id === id);
    if (c) { setPhone(c.phone || ''); setEmail(c.email || ''); }
  };

  const handleSave = () => {
    if (!title.trim()) { setErr('Введите название задачи'); return; }
    setSaving(true);
    setTimeout(() => {
      addTask({ id: `t${Date.now()}`, title, description: comment || undefined, assigneeId, clientId: clientId || undefined, priority, status: 'todo', dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], createdAt: new Date().toISOString().split('T')[0] });
      setSaving(false); setSuccess(true);
      setTimeout(onClose, 700);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in flex flex-col" style={{ maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-5 pb-4 border-b border-border/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'hsl(244 80% 60%)' }}><Icon name="CheckSquare" size={16} className="text-white" /></div>
            <h2 className="font-bold text-foreground text-lg">Новая задача</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><Icon name="X" size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
          <div>
            <label className="field-label">Задача *</label>
            <input value={title} onChange={e => { setTitle(e.target.value); setErr(''); }} placeholder="Позвонить, отправить КП, провести встречу..." className={`crm-input ${err ? 'border-rose-400' : ''}`} autoFocus />
            {err && <p className="text-xs text-rose-500 mt-1">{err}</p>}
          </div>

          <div>
            <label className="field-label">Комментарий</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Детали, что важно учесть..." rows={2} className="crm-input resize-none" />
          </div>

          <div>
            <label className="field-label">Клиент</label>
            <ClientPicker clientId={clientId} onChange={handleClientChange} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Ответственный</label>
              <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} className="crm-input">
                {USERS.filter(u => u.isActive).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Срок</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="crm-input" />
            </div>
          </div>

          <div>
            <label className="field-label">Приоритет</label>
            <div className="flex gap-2">
              {priorityOpts.map(p => <button key={p.id} type="button" onClick={() => setPriority(p.id)} className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${priority === p.id ? `${p.cls} border-current` : 'border-transparent bg-secondary text-muted-foreground hover:bg-secondary/70'}`}>{p.label}</button>)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className="field-label">Телефон</label><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 900 000 00 00" className="crm-input" /></div>
            <div><label className="field-label">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@mail.ru" className="crm-input" /></div>
          </div>
        </div>

        <div className="px-6 pb-5 pt-3 border-t border-border/60 flex-shrink-0">
          <button onClick={handleSave} disabled={saving || success} className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-70 flex items-center justify-center gap-2" style={{ background: success ? 'hsl(158 64% 45%)' : 'hsl(244 80% 60%)' }}>
            {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Сохраняем...</> : success ? <><Icon name="CheckCircle" size={16} />Задача создана!</> : <><Icon name="Plus" size={15} />Создать задачу</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Task detail modal with side comments panel ──────────────────────────────
function TaskDetailModal({ task, onClose }: { task: Task; onClose: () => void }) {
  const { clients, comments, taskStatusLabels } = useStore();
  const assignee = USERS.find(u => u.id === task.assigneeId);
  const client = clients.find(c => c.id === task.clientId);
  const taskComments = comments.filter(c => c.entityId === task.id);
  const currentUser = USERS[0];

  const markDone = () => {
    updateTaskStatus(task.id, 'done');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col animate-scale-in" style={{ height: '600px', maxHeight: '88vh' }} onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-5 pb-4 border-b border-border/60 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <h2 className="font-bold text-foreground text-lg leading-snug">{task.title}</h2>
              {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground flex-shrink-0"><Icon name="X" size={20} /></button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`status-badge ${statusBadgeCls[task.status]}`}>{taskStatusLabels[task.status]}</span>
            <span className={`status-badge ${priorityConfig[task.priority].badge}`}>{priorityConfig[task.priority].label}</span>
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 border-r border-border/60 min-w-0">
            {[
              { icon: 'User', label: 'Исполнитель', value: assignee?.name },
              { icon: 'Users', label: 'Клиент', value: client?.name },
              { icon: 'Phone', label: 'Телефон', value: client?.phone },
              { icon: 'Calendar', label: 'Срок', value: new Date(task.dueDate).toLocaleDateString('ru-RU') },
            ].filter(r => r.value).map(row => (
              <div key={row.label} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/50">
                <Icon name={row.icon} size={14} className="text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground w-20">{row.label}</span>
                <span className="text-sm font-medium text-foreground">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="w-72 flex-shrink-0 px-4 py-4 min-h-0">
            <CommentsPanel comments={taskComments} onSend={text => addComment(task.id, text, currentUser.id)} />
          </div>
        </div>

        <div className="px-6 pb-5 pt-3 border-t border-border/60 flex gap-2 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary/50 transition-colors">Закрыть</button>
          {task.status !== 'done' && (
            <button onClick={markDone} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90" style={{ background: 'hsl(158 64% 45%)' }}>
              <Icon name="Check" size={14} />Выполнено
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const { clients, comments } = useStore();
  const assignee = USERS.find(u => u.id === task.assigneeId);
  const client = clients.find(c => c.id === task.clientId);
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'done';
  const cmtCount = comments.filter(c => c.entityId === task.id).length;

  return (
    <div className="bg-white rounded-xl border border-border/60 p-4 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-0.5 transition-all" onClick={onClick}>
      <div className="flex items-start gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${priorityConfig[task.priority].dot}`} />
        <p className="text-sm font-semibold text-foreground leading-snug flex-1">{task.title}</p>
      </div>
      {client && <p className="text-xs text-muted-foreground mb-3 ml-4">{client.name}</p>}
      <div className="flex items-center justify-between ml-4">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-white" style={{ background: 'hsl(244 80% 60%)' }}>{assignee?.avatar.slice(0, 1)}</div>
          <span className="text-xs text-muted-foreground">{assignee?.name.split(' ')[0]}</span>
          {cmtCount > 0 && <span className="flex items-center gap-0.5 text-xs text-muted-foreground"><Icon name="MessageCircle" size={11} />{cmtCount}</span>}
        </div>
        <span className={`text-xs font-medium ${isOverdue ? 'text-rose-600' : 'text-muted-foreground'}`}>
          {isOverdue && '⚠ '}до {new Date(task.dueDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
        </span>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Tasks({ isAdmin }: { isAdmin?: boolean } = {}) {
  const { tasks, taskStatusLabels } = useStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Task | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [editingStatus, setEditingStatus] = useState<TaskStatusId | null>(null);
  const [editStatusValue, setEditStatusValue] = useState('');
  const dragId = useRef<string | null>(null);

  const startEditStatus = (statusId: TaskStatusId, current: string) => {
    setEditingStatus(statusId);
    setEditStatusValue(current);
  };
  const saveEditStatus = () => {
    if (editingStatus && editStatusValue.trim()) {
      renameTaskStatus(editingStatus, editStatusValue.trim());
    }
    setEditingStatus(null);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    dragId.current = taskId;
    e.dataTransfer.effectAllowed = 'move';
    (e.currentTarget as HTMLElement).style.opacity = '0.5';
  };
  const handleDragEnd = (e: React.DragEvent) => { (e.currentTarget as HTMLElement).style.opacity = '1'; };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (dragId.current) { updateTaskStatus(dragId.current, status as Task['status']); dragId.current = null; }
  };

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchAssignee = assigneeFilter === 'all' || t.assigneeId === assigneeFilter;
    return matchSearch && matchAssignee;
  });

  const managers = USERS.filter(u => u.isActive);

  return (
    <>
      <style>{`
        .field-label{display:block;font-size:0.7rem;font-weight:600;color:hsl(var(--muted-foreground));text-transform:uppercase;letter-spacing:0.04em;margin-bottom:0.3rem;}
        .crm-input{width:100%;padding:0.55rem 0.75rem;border-radius:0.75rem;border:1.5px solid hsl(var(--border));font-size:0.875rem;outline:none;transition:all 0.15s;background:white;color:hsl(var(--foreground));font-family:inherit;}
        .crm-input:focus{border-color:hsl(244 80% 60%);box-shadow:0 0 0 3px hsl(244 80% 60% / 0.12);}
        select.crm-input{cursor:pointer;}
      `}</style>

      <div className="p-6 space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Задачи</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{tasks.filter(t => t.status !== 'done').length} открытых · {tasks.filter(t => t.status === 'done').length} выполнено</p>
          </div>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all" style={{ background: 'hsl(244 80% 60%)', boxShadow: '0 4px 14px hsl(244 80% 60% / 0.3)' }}>
            <Icon name="Plus" size={16} />Новая задача
          </button>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white rounded-xl border border-border shadow-sm flex-1 min-w-48">
            <Icon name="Search" size={16} className="text-muted-foreground" />
            <input className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-foreground" placeholder="Поиск задач..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1.5 bg-white rounded-xl border border-border shadow-sm p-1">
            <button onClick={() => setAssigneeFilter('all')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${assigneeFilter === 'all' ? 'text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`} style={assigneeFilter === 'all' ? { background: 'hsl(244 80% 60%)' } : {}}>Все</button>
            {managers.slice(0, 4).map(m => (
              <button key={m.id} onClick={() => setAssigneeFilter(m.id)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${assigneeFilter === m.id ? 'text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`} style={assigneeFilter === m.id ? { background: 'hsl(244 80% 60%)' } : {}}>{m.name.split(' ')[0]}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {columnVisuals.map(col => {
            const colTasks = filtered.filter(t => t.status === col.id);
            const label = taskStatusLabels[col.id];
            return (
              <div key={col.id} onDragOver={handleDragOver} onDrop={e => handleDrop(e, col.id)}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col.color }} />
                  {editingStatus === col.id ? (
                    <input
                      autoFocus
                      value={editStatusValue}
                      onChange={e => setEditStatusValue(e.target.value)}
                      onBlur={saveEditStatus}
                      onKeyDown={e => { if (e.key === 'Enter') saveEditStatus(); if (e.key === 'Escape') setEditingStatus(null); }}
                      className="text-sm font-semibold text-foreground bg-white border border-primary rounded-md px-1.5 py-0.5 outline-none min-w-0 flex-1"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-foreground truncate">{label}</span>
                  )}
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground flex-shrink-0">{colTasks.length}</span>
                  {isAdmin && editingStatus !== col.id && (
                    <button onClick={() => startEditStatus(col.id, label)} className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0 ml-auto">
                      <Icon name="Pencil" size={12} />
                    </button>
                  )}
                </div>
                <div className="space-y-2.5 min-h-[60px] rounded-xl p-1 transition-colors">
                  {colTasks.map(task => (
                    <div key={task.id} draggable onDragStart={e => handleDragStart(e, task.id)} onDragEnd={handleDragEnd}>
                      <TaskCard task={task} onClick={() => setSelected(task)} />
                    </div>
                  ))}
                  <button onClick={() => setShowNew(true)} className="w-full rounded-xl border-2 border-dashed border-border p-3 text-center text-xs text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-1.5">
                    <Icon name="Plus" size={13} />Добавить задачу
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selected && <TaskDetailModal task={selected} onClose={() => setSelected(null)} />}
      {showNew && <NewTaskModal onClose={() => setShowNew(false)} />}
    </>
  );
}