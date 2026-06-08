import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { TASKS, USERS, CLIENTS, type Task } from '@/data/mock';

const priorityConfig: Record<string, { label: string; badge: string; dot: string }> = {
  high: { label: 'Высокий', badge: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500' },
  medium: { label: 'Средний', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  low: { label: 'Низкий', badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
};

const statusConfig: Record<string, { label: string; badge: string; icon: string }> = {
  todo: { label: 'К выполнению', badge: 'bg-slate-100 text-slate-600', icon: 'Circle' },
  in_progress: { label: 'В работе', badge: 'bg-blue-100 text-blue-700', icon: 'Clock' },
  done: { label: 'Выполнено', badge: 'bg-emerald-100 text-emerald-700', icon: 'CheckCircle' },
};

const columns = [
  { id: 'todo', label: 'К выполнению', color: 'hsl(220 14% 46%)' },
  { id: 'in_progress', label: 'В работе', color: 'hsl(214 84% 56%)' },
  { id: 'done', label: 'Выполнено', color: 'hsl(158 64% 45%)' },
];

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

function TaskCard({ task, onClick }: TaskCardProps) {
  const assignee = USERS.find(u => u.id === task.assigneeId);
  const client = CLIENTS.find(c => c.id === task.clientId);
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div className="bg-white rounded-xl border border-border/60 p-4 card-hover shadow-sm" onClick={onClick}>
      <div className="flex items-start gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${priorityConfig[task.priority].dot}`} />
        <p className="text-sm font-semibold text-foreground leading-snug flex-1">{task.title}</p>
      </div>
      {client && <p className="text-xs text-muted-foreground mb-3 ml-4">{client.name}</p>}
      <div className="flex items-center justify-between ml-4">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-white"
            style={{ background: 'hsl(244 80% 60%)' }}>
            {assignee?.avatar.slice(0, 1)}
          </div>
          <span className="text-xs text-muted-foreground">{assignee?.name.split(' ')[0]}</span>
        </div>
        <span className={`text-xs font-medium ${isOverdue ? 'text-rose-600' : 'text-muted-foreground'}`}>
          {isOverdue && '⚠ '}до {new Date(task.dueDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
        </span>
      </div>
    </div>
  );
}

function TaskModal({ task, onClose }: { task: Task; onClose: () => void }) {
  const assignee = USERS.find(u => u.id === task.assigneeId);
  const client = CLIENTS.find(c => c.id === task.clientId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-bold text-foreground text-lg pr-4">{task.title}</h2>
            {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground flex-shrink-0">
            <Icon name="X" size={20} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-5">
          <span className={`status-badge ${statusConfig[task.status].badge}`}>{statusConfig[task.status].label}</span>
          <span className={`status-badge ${priorityConfig[task.priority].badge}`}>{priorityConfig[task.priority].label}</span>
        </div>
        <div className="space-y-2.5">
          {[
            { icon: 'User', label: 'Исполнитель', value: assignee?.name },
            { icon: 'Users', label: 'Клиент', value: client?.name || '—' },
            { icon: 'Calendar', label: 'Срок', value: new Date(task.dueDate).toLocaleDateString('ru-RU') },
          ].map(row => (
            <div key={row.label} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
              <Icon name={row.icon} size={15} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground w-20">{row.label}</span>
              <span className="text-sm font-medium text-foreground">{row.value}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-5">
          <button className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary/50 transition-colors" onClick={onClose}>
            Закрыть
          </button>
          <button className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
            style={{ background: 'hsl(158 64% 45%)' }}>
            <Icon name="Check" size={14} className="inline mr-1.5" />
            Выполнено
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Tasks() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Task | null>(null);
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  const filtered = TASKS.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchAssignee = assigneeFilter === 'all' || t.assigneeId === assigneeFilter;
    return matchSearch && matchAssignee;
  });

  const managers = USERS.filter(u => ['sales', 'support'].includes(u.role));

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Задачи</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {TASKS.filter(t => t.status !== 'done').length} открытых · {TASKS.filter(t => t.status === 'done').length} выполнено
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
          style={{ background: 'hsl(244 80% 60%)' }}>
          <Icon name="Plus" size={16} />
          Новая задача
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white rounded-xl border border-border shadow-sm flex-1 min-w-48">
          <Icon name="Search" size={16} className="text-muted-foreground" />
          <input className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-foreground"
            placeholder="Поиск задач..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5 bg-white rounded-xl border border-border shadow-sm p-1">
          <button onClick={() => setAssigneeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${assigneeFilter === 'all' ? 'text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            style={assigneeFilter === 'all' ? { background: 'hsl(244 80% 60%)' } : {}}>
            Все
          </button>
          {managers.map(m => (
            <button key={m.id} onClick={() => setAssigneeFilter(m.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${assigneeFilter === m.id ? 'text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              style={assigneeFilter === m.id ? { background: 'hsl(244 80% 60%)' } : {}}>
              {m.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-3 gap-5">
        {columns.map(col => {
          const colTasks = filtered.filter(t => t.status === col.id);
          return (
            <div key={col.id}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                <span className="text-sm font-semibold text-foreground">{col.label}</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground ml-auto">{colTasks.length}</span>
              </div>
              <div className="space-y-2.5">
                {colTasks.map(task => (
                  <TaskCard key={task.id} task={task} onClick={() => setSelected(task)} />
                ))}
                {colTasks.length === 0 && (
                  <div className="rounded-xl border-2 border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                    Нет задач
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selected && <TaskModal task={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
