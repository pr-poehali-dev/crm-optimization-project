import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { USERS, type Client } from '@/data/mock';
import { useStore } from '@/data/store';

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  lead: 'bg-violet-100 text-violet-700',
  inactive: 'bg-slate-100 text-slate-500',
};
const statusLabels: Record<string, string> = { active: 'Активный', lead: 'Лид', inactive: 'Неактивный' };

interface ClientModalProps {
  client?: Client;
  onClose: () => void;
}

function ClientModal({ client, onClose }: ClientModalProps) {
  const { deals } = useStore();
  const clientDeals = deals.filter(d => d.clientId === client?.id);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ background: 'hsl(244 80% 60%)' }}>
              {client?.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h2 className="font-bold text-foreground text-lg">{client?.name}</h2>
              <p className="text-muted-foreground text-sm">{client?.company}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {[
            { icon: 'Mail', label: 'Email', value: client?.email },
            { icon: 'Phone', label: 'Телефон', value: client?.phone },
            { icon: 'Hash', label: 'ИНН', value: client?.inn || '—' },
          ].map(row => (
            <div key={row.label} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
              <Icon name={row.icon} size={16} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground w-16">{row.label}</span>
              <span className="text-sm font-medium text-foreground">{row.value}</span>
            </div>
          ))}
        </div>

        {client?.tags && (
          <div className="flex flex-wrap gap-2 mt-4">
            {client.tags.map(tag => (
              <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700">{tag}</span>
            ))}
          </div>
        )}

        {clientDeals.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Сделки</p>
            <div className="space-y-2">
              {clientDeals.map(d => (
                <div key={d.id} className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/50 text-sm">
                  <span className="font-medium text-foreground truncate mr-2">{d.title}</span>
                  <span className="font-bold text-foreground flex-shrink-0">{(d.amount / 1000).toFixed(0)}K ₽</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Clients() {
  const { clients } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Client | null>(null);

  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Клиенты</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{clients.length} клиентов в базе</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 hover:shadow-lg"
          style={{ background: 'hsl(244 80% 60%)' }}>
          <Icon name="Plus" size={16} />
          Добавить клиента
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white rounded-xl border border-border shadow-sm flex-1 min-w-48">
          <Icon name="Search" size={16} className="text-muted-foreground flex-shrink-0" />
          <input
            className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-foreground"
            placeholder="Поиск по имени, компании, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')}><Icon name="X" size={14} className="text-muted-foreground" /></button>
          )}
        </div>
        <div className="flex gap-1.5 bg-white rounded-xl border border-border shadow-sm p-1">
          {[['all', 'Все'], ['active', 'Активные'], ['lead', 'Лиды'], ['inactive', 'Неактивные']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setStatusFilter(val)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${statusFilter === val ? 'text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              style={statusFilter === val ? { background: 'hsl(244 80% 60%)' } : {}}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              {['Клиент', 'Компания', 'Контакт', 'Менеджер', 'Статус', 'Теги', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {filtered.map(client => {
              const manager = USERS.find(u => u.id === client.managerId);
              return (
                <tr key={client.id} className="hover:bg-secondary/30 transition-colors cursor-pointer group" onClick={() => setSelected(client)}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: 'hsl(244 80% 60%)' }}>
                        {client.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <span className="text-sm font-semibold text-foreground">{client.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-muted-foreground">{client.company}</td>
                  <td className="px-4 py-3.5">
                    <div className="text-xs text-muted-foreground">{client.email}</div>
                    <div className="text-xs text-muted-foreground">{client.phone}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: 'hsl(188 85% 45%)' }}>
                        {manager?.avatar.slice(0, 1)}
                      </div>
                      <span className="text-xs text-muted-foreground">{manager?.name.split(' ')[0]}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`status-badge ${statusColors[client.status]}`}>{statusLabels[client.status]}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {client.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-secondary text-muted-foreground">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Icon name="ChevronRight" size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">Клиенты не найдены</div>
        )}
      </div>

      {selected && <ClientModal client={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}