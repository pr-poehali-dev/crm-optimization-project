import Icon from '@/components/ui/icon';
import { CLIENTS, DEALS, TASKS, INVOICES, USERS } from '@/data/mock';

const stageColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  negotiation: 'bg-amber-100 text-amber-700',
  proposal: 'bg-violet-100 text-violet-700',
  won: 'bg-emerald-100 text-emerald-700',
  lost: 'bg-rose-100 text-rose-700',
};
const stageLabels: Record<string, string> = {
  new: 'Новая', negotiation: 'Переговоры', proposal: 'Предложение', won: 'Выиграна', lost: 'Проиграна',
};

const priorityColor: Record<string, string> = {
  high: 'bg-rose-100 text-rose-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
};
const priorityLabel: Record<string, string> = { high: 'Высокий', medium: 'Средний', low: 'Низкий' };

export default function Dashboard() {
  const totalRevenue = INVOICES.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const activeDeals = DEALS.filter(d => !['won', 'lost'].includes(d.stage)).length;
  const openTasks = TASKS.filter(t => t.status !== 'done').length;
  const activeClients = CLIENTS.filter(c => c.status === 'active').length;

  const recentDeals = DEALS.slice(0, 4);
  const pendingTasks = TASKS.filter(t => t.status !== 'done').slice(0, 5);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Главная</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Обзор активности системы</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Выручка', value: `${(totalRevenue / 1000).toFixed(0)} тыс ₽`, icon: 'TrendingUp', color: 'hsl(158 64% 45%)', bg: 'bg-emerald-50' },
          { label: 'Активных сделок', value: activeDeals, icon: 'Handshake', color: 'hsl(244 80% 60%)', bg: 'bg-violet-50' },
          { label: 'Открытых задач', value: openTasks, icon: 'CheckSquare', color: 'hsl(38 95% 55%)', bg: 'bg-amber-50' },
          { label: 'Клиентов', value: activeClients, icon: 'Users', color: 'hsl(188 85% 45%)', bg: 'bg-cyan-50' },
        ].map((m, i) => (
          <div key={i} className="metric-card card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-xs font-medium mb-1">{m.label}</p>
                <p className="text-2xl font-bold text-foreground">{m.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center`}>
                <Icon name={m.icon} size={20} style={{ color: m.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Deals */}
        <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-border/50">
            <h2 className="font-semibold text-foreground">Последние сделки</h2>
            <Icon name="Handshake" size={16} className="text-muted-foreground" />
          </div>
          <div className="divide-y divide-border/40">
            {recentDeals.map(deal => {
              const client = CLIENTS.find(c => c.id === deal.clientId);
              return (
                <div key={deal.id} className="px-5 py-3.5 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{deal.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{client?.company}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`status-badge ${stageColors[deal.stage]}`}>{stageLabels[deal.stage]}</span>
                      <span className="text-sm font-bold text-foreground">{(deal.amount / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-border/50">
            <h2 className="font-semibold text-foreground">Активные задачи</h2>
            <Icon name="CheckSquare" size={16} className="text-muted-foreground" />
          </div>
          <div className="divide-y divide-border/40">
            {pendingTasks.map(task => {
              const assignee = USERS.find(u => u.id === task.assigneeId);
              return (
                <div key={task.id} className="px-5 py-3.5 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: 'hsl(244 80% 60%)' }}
                    >
                      {assignee?.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">до {new Date(task.dueDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</p>
                    </div>
                    <span className={`status-badge ${priorityColor[task.priority]} flex-shrink-0`}>
                      {priorityLabel[task.priority]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-5">
        <h2 className="font-semibold text-foreground mb-4">Воронка продаж</h2>
        <div className="flex gap-2">
          {Object.entries(stageLabels).map(([stage, label]) => {
            const count = DEALS.filter(d => d.stage === stage).length;
            const sum = DEALS.filter(d => d.stage === stage).reduce((s, d) => s + d.amount, 0);
            return (
              <div key={stage} className="flex-1 text-center">
                <div className={`rounded-xl p-3 mb-2 ${stageColors[stage]}`}>
                  <div className="text-2xl font-bold">{count}</div>
                </div>
                <div className="text-xs font-medium text-muted-foreground">{label}</div>
                <div className="text-xs font-semibold text-foreground mt-0.5">{sum > 0 ? `${(sum/1000).toFixed(0)}K ₽` : '—'}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
