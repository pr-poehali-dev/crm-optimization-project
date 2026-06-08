import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { DEALS, CLIENTS, USERS, type Deal } from '@/data/mock';

const stages = [
  { id: 'new', label: 'Новые', color: 'hsl(214 84% 56%)', bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
  { id: 'negotiation', label: 'Переговоры', color: 'hsl(38 95% 55%)', bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700' },
  { id: 'proposal', label: 'Предложение', color: 'hsl(244 80% 60%)', bg: 'bg-violet-50', badge: 'bg-violet-100 text-violet-700' },
  { id: 'won', label: 'Выиграны', color: 'hsl(158 64% 45%)', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
  { id: 'lost', label: 'Проиграны', color: 'hsl(350 80% 58%)', bg: 'bg-rose-50', badge: 'bg-rose-100 text-rose-700' },
];

interface DealModalProps {
  deal: Deal;
  onClose: () => void;
}

function DealModal({ deal, onClose }: DealModalProps) {
  const client = CLIENTS.find(c => c.id === deal.clientId);
  const manager = USERS.find(u => u.id === deal.managerId);
  const stage = stages.find(s => s.id === deal.stage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-bold text-foreground text-lg">{deal.title}</h2>
            <p className="text-muted-foreground text-sm mt-0.5">{client?.company}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-5">
          <span className={`status-badge ${stage?.badge}`}>{stage?.label}</span>
          <span className="text-2xl font-bold text-foreground">{deal.amount.toLocaleString('ru-RU')} ₽</span>
        </div>

        <div className="space-y-2.5">
          {[
            { icon: 'User', label: 'Клиент', value: client?.name },
            { icon: 'UserCircle', label: 'Менеджер', value: manager?.name },
            { icon: 'Calendar', label: 'Создана', value: new Date(deal.createdAt).toLocaleDateString('ru-RU') },
            { icon: 'CalendarCheck', label: 'Закрыта', value: deal.closedAt ? new Date(deal.closedAt).toLocaleDateString('ru-RU') : '—' },
          ].map(row => (
            <div key={row.label} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
              <Icon name={row.icon} size={15} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground w-16">{row.label}</span>
              <span className="text-sm font-medium text-foreground">{row.value}</span>
            </div>
          ))}
        </div>

        {deal.notes && (
          <div className="mt-4 p-3 rounded-xl bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Заметки</p>
            <p className="text-sm text-foreground">{deal.notes}</p>
          </div>
        )}

        <div className="flex gap-2 mt-5">
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary/50 transition-colors">
            <Icon name="Receipt" size={15} />
            Выставить счёт
          </button>
          <button className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
            style={{ background: 'hsl(244 80% 60%)' }}>
            Редактировать
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Deals() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [selected, setSelected] = useState<Deal | null>(null);

  const filtered = DEALS.filter(d => {
    const client = CLIENTS.find(c => c.id === d.clientId);
    return d.title.toLowerCase().includes(search.toLowerCase()) ||
      client?.company.toLowerCase().includes(search.toLowerCase()) || false;
  });

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Сделки</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {DEALS.filter(d => !['won', 'lost'].includes(d.stage)).length} активных · {DEALS.filter(d => d.stage === 'won').reduce((s, d) => s + d.amount, 0).toLocaleString('ru-RU')} ₽ выиграно
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white rounded-xl border border-border shadow-sm p-1">
            {([['kanban', 'Kanban', 'LayoutGrid'], ['list', 'Список', 'List']] as const).map(([id, label, icon]) => (
              <button key={id} onClick={() => setView(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === id ? 'text-white shadow-sm' : 'text-muted-foreground'}`}
                style={view === id ? { background: 'hsl(244 80% 60%)' } : {}}>
                <Icon name={icon} size={14} />
                {label}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
            style={{ background: 'hsl(244 80% 60%)' }}>
            <Icon name="Plus" size={16} />
            Новая сделка
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white rounded-xl border border-border shadow-sm w-full max-w-80">
        <Icon name="Search" size={16} className="text-muted-foreground" />
        <input className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-foreground"
          placeholder="Поиск сделок..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {view === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map(stage => {
            const stageDeals = filtered.filter(d => d.stage === stage.id);
            const total = stageDeals.reduce((s, d) => s + d.amount, 0);
            return (
              <div key={stage.id} className="flex-shrink-0 w-64">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
                    <span className="text-sm font-semibold text-foreground">{stage.label}</span>
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{stageDeals.length}</span>
                  </div>
                  {total > 0 && <span className="text-xs text-muted-foreground font-medium">{(total/1000).toFixed(0)}K ₽</span>}
                </div>
                <div className="space-y-2.5">
                  {stageDeals.map(deal => {
                    const client = CLIENTS.find(c => c.id === deal.clientId);
                    const manager = USERS.find(u => u.id === deal.managerId);
                    return (
                      <div key={deal.id} className="bg-white rounded-xl border border-border/60 p-4 card-hover shadow-sm"
                        onClick={() => setSelected(deal)}>
                        <p className="text-sm font-semibold text-foreground mb-1 leading-snug">{deal.title}</p>
                        <p className="text-xs text-muted-foreground mb-3">{client?.company}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-white"
                              style={{ background: 'hsl(244 80% 60%)' }}>
                              {manager?.avatar.slice(0, 1)}
                            </div>
                            <span className="text-xs text-muted-foreground">{manager?.name.split(' ')[0]}</span>
                          </div>
                          <span className="text-sm font-bold text-foreground">{(deal.amount/1000).toFixed(0)}K ₽</span>
                        </div>
                      </div>
                    );
                  })}
                  {stageDeals.length === 0 && (
                    <div className="rounded-xl border-2 border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                      Нет сделок
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                {['Сделка', 'Клиент', 'Менеджер', 'Сумма', 'Этап', 'Дата'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map(deal => {
                const client = CLIENTS.find(c => c.id === deal.clientId);
                const manager = USERS.find(u => u.id === deal.managerId);
                const stage = stages.find(s => s.id === deal.stage);
                return (
                  <tr key={deal.id} className="hover:bg-secondary/30 transition-colors cursor-pointer" onClick={() => setSelected(deal)}>
                    <td className="px-4 py-3.5 text-sm font-semibold text-foreground">{deal.title}</td>
                    <td className="px-4 py-3.5 text-sm text-muted-foreground">{client?.company}</td>
                    <td className="px-4 py-3.5 text-sm text-muted-foreground">{manager?.name.split(' ')[0]}</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-foreground">{deal.amount.toLocaleString('ru-RU')} ₽</td>
                    <td className="px-4 py-3.5"><span className={`status-badge ${stage?.badge}`}>{stage?.label}</span></td>
                    <td className="px-4 py-3.5 text-sm text-muted-foreground">{new Date(deal.createdAt).toLocaleDateString('ru-RU')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && <DealModal deal={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
