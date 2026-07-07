import Icon from '@/components/ui/icon';
import { USERS } from '@/data/mock';
import { useStore } from '@/data/store';

export default function Analytics() {
  const { deals, clients, tasks, invoices, dealStageLabels } = useStore();
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const totalPipeline = deals.filter(d => !['won', 'lost'].includes(d.stage)).reduce((s, d) => s + d.amount, 0);
  const wonDeals = deals.filter(d => d.stage === 'won');
  const conversionRate = deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0;
  const avgDeal = wonDeals.length > 0 ? Math.round(wonDeals.reduce((s, d) => s + d.amount, 0) / wonDeals.length) : 0;

  const managerStats = USERS.filter(u => u.role === 'sales').map(u => {
    const myDeals = deals.filter(d => d.managerId === u.id);
    const myWon = myDeals.filter(d => d.stage === 'won');
    const myRevenue = invoices.filter(i => i.managerId === u.id && i.status === 'paid').reduce((s, i) => s + i.amount, 0);
    return {
      user: u,
      deals: myDeals.length,
      won: myWon.length,
      revenue: myRevenue,
      clients: clients.filter(c => c.managerId === u.id).length,
      tasks: tasks.filter(t => t.assigneeId === u.id).length,
    };
  });

  const maxRevenue = Math.max(...managerStats.map(m => m.revenue), 1);

  const stageColorMap: Record<string, string> = {
    new: 'hsl(214 84% 56%)', negotiation: 'hsl(38 95% 55%)', proposal: 'hsl(244 80% 60%)', won: 'hsl(158 64% 45%)', lost: 'hsl(350 80% 58%)',
  };
  const stageData = Object.entries(dealStageLabels).map(([stage, label]) => {
    const count = deals.filter(d => d.stage === stage).length;
    return { label, count, color: stageColorMap[stage] || 'hsl(220 14% 46%)', pct: deals.length > 0 ? Math.round((count / deals.length) * 100) : 0 };
  });

  const invoiceStats = [
    { label: 'Оплачено', count: invoices.filter(i => i.status === 'paid').length, color: 'hsl(158 64% 45%)' },
    { label: 'Отправлено', count: invoices.filter(i => i.status === 'sent').length, color: 'hsl(214 84% 56%)' },
    { label: 'Просрочено', count: invoices.filter(i => i.status === 'overdue').length, color: 'hsl(350 80% 58%)' },
    { label: 'Черновики', count: invoices.filter(i => i.status === 'draft').length, color: 'hsl(220 14% 46%)' },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Аналитика</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Сводная статистика по всем показателям</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Выручка (оплачено)', value: `${(totalRevenue/1000).toFixed(0)} тыс ₽`, sub: 'по оплаченным счетам', icon: 'CircleDollarSign', color: 'hsl(158 64% 45%)', bg: 'bg-emerald-50' },
          { label: 'Воронка (pipeline)', value: `${(totalPipeline/1000).toFixed(0)} тыс ₽`, sub: 'активные сделки', icon: 'TrendingUp', color: 'hsl(244 80% 60%)', bg: 'bg-violet-50' },
          { label: 'Конверсия', value: `${conversionRate}%`, sub: `${wonDeals.length} из ${deals.length} сделок`, icon: 'Target', color: 'hsl(38 95% 55%)', bg: 'bg-amber-50' },
          { label: 'Средняя сделка', value: `${(avgDeal/1000).toFixed(0)} тыс ₽`, sub: 'по выигранным', icon: 'Award', color: 'hsl(188 85% 45%)', bg: 'bg-cyan-50' },
        ].map((m, i) => (
          <div key={i} className="metric-card card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center`}>
                <Icon name={m.icon} size={20} style={{ color: m.color }} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{m.label}</p>
            <p className="text-2xl font-bold text-foreground mt-0.5">{m.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Funnel */}
        <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-5">
          <h2 className="font-semibold text-foreground mb-4">Воронка продаж</h2>
          <div className="space-y-3">
            {stageData.map(stage => (
              <div key={stage.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{stage.label}</span>
                  <span className="text-sm font-bold text-foreground">{stage.count} · {stage.pct}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(stage.pct, stage.count > 0 ? 5 : 0)}%`, background: stage.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoices chart */}
        <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-5">
          <h2 className="font-semibold text-foreground mb-4">Статусы счетов</h2>
          <div className="flex items-end gap-4 h-40 mb-4">
            {invoiceStats.map(s => (
              <div key={s.label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-lg font-bold text-foreground">{s.count}</span>
                <div
                  className="w-full rounded-xl transition-all duration-700"
                  style={{
                    height: `${Math.max((s.count / (invoices.length || 1)) * 120, s.count > 0 ? 20 : 4)}px`,
                    background: s.color,
                    opacity: 0.85,
                  }}
                />
                <span className="text-xs text-muted-foreground text-center leading-tight">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manager leaderboard */}
      <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <h2 className="font-semibold text-foreground">Результаты менеджеров</h2>
        </div>
        <div className="divide-y divide-border/40">
          {managerStats.sort((a, b) => b.revenue - a.revenue).map((m, idx) => (
            <div key={m.user.id} className="px-5 py-4">
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-lg font-bold text-muted-foreground w-5">{idx + 1}</span>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: 'hsl(244 80% 60%)' }}>
                    {m.user.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{m.user.name}</p>
                    <p className="text-xs text-muted-foreground">{m.clients} клиентов · {m.tasks} задач</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-foreground">{(m.revenue/1000).toFixed(0)} тыс ₽</p>
                  <p className="text-xs text-muted-foreground">{m.won}/{m.deals} сделок</p>
                </div>
              </div>
              <div className="w-full bg-secondary rounded-full h-1.5">
                <div className="h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${(m.revenue / maxRevenue) * 100}%`, background: 'hsl(244 80% 60%)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Client stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Активных клиентов', value: clients.filter(c => c.status === 'active').length, icon: 'UserCheck', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Лидов', value: clients.filter(c => c.status === 'lead').length, icon: 'UserPlus', color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Неактивных', value: clients.filter(c => c.status === 'inactive').length, icon: 'UserMinus', color: 'text-slate-500', bg: 'bg-slate-50' },
        ].map(m => (
          <div key={m.label} className="metric-card">
            <div className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center mb-3`}>
              <Icon name={m.icon} size={20} className={m.color} />
            </div>
            <p className="text-3xl font-bold text-foreground">{m.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}