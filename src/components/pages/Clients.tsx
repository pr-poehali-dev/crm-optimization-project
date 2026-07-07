import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { USERS, type Client } from '@/data/mock';
import { useStore, addClient } from '@/data/store';
import { resolveINN } from '@/lib/inn';

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  lead: 'bg-violet-100 text-violet-700',
  inactive: 'bg-slate-100 text-slate-500',
};
const statusLabels: Record<string, string> = { active: 'Активный', lead: 'Лид', inactive: 'Неактивный' };

interface ClientModalProps {
  client?: Client;
  onClose: () => void;
  onOpenDeal: (dealId: string) => void;
}

function ClientModal({ client, onClose, onOpenDeal }: ClientModalProps) {
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
                <button
                  key={d.id}
                  onClick={() => { onOpenDeal(d.id); onClose(); }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-secondary/50 text-sm hover:bg-secondary transition-colors text-left"
                >
                  <span className="font-medium text-foreground truncate mr-2">{d.title}</span>
                  <span className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-bold text-foreground">{(d.amount / 1000).toFixed(0)}K ₽</span>
                    <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NewClientModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [inn, setInn] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [managerId, setManagerId] = useState(USERS[1].id);
  const [innLoading, setInnLoading] = useState(false);
  const [innFound, setInnFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState('');
  const innTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (inn.length < 10) { setInnFound(false); return; }
    setInnLoading(true);
    clearTimeout(innTimer.current);
    innTimer.current = setTimeout(async () => {
      const found = await resolveINN(inn);
      setInnLoading(false);
      if (found) { setCompany(found); setInnFound(true); } else setInnFound(false);
    }, 300);
  }, [inn]);

  const handleSave = () => {
    if (!name.trim() || !phone.trim()) { setErr('Заполните имя и телефон'); return; }
    setSaving(true);
    setTimeout(() => {
      addClient({
        id: `c${Date.now()}`, name, company: company || 'Не указана', email, phone,
        status: 'lead', managerId, createdAt: new Date().toISOString().split('T')[0],
        tags: ['Новый'], inn: inn || undefined,
      });
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
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'hsl(244 80% 60%)' }}><Icon name="UserPlus" size={16} className="text-white" /></div>
            <h2 className="font-bold text-foreground text-lg">Новый клиент</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><Icon name="X" size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Имя *</label>
              <input value={name} onChange={e => { setName(e.target.value); setErr(''); }} placeholder="Иван Иванов" className="crm-input" autoFocus />
            </div>
            <div>
              <label className="field-label">Телефон *</label>
              <input value={phone} onChange={e => { setPhone(e.target.value); setErr(''); }} placeholder="+7 900 000 00 00" className="crm-input" />
            </div>
          </div>
          <div>
            <label className="field-label">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@mail.ru" className="crm-input" />
          </div>
          <div>
            <label className="field-label">ИНН (опционально)</label>
            <div className="relative">
              <input value={inn} onChange={e => setInn(e.target.value.replace(/\D/g, '').slice(0, 12))} placeholder="Введите ИНН — подтянем компанию" className="crm-input pr-8" />
              {innLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />}
              {innFound && !innLoading && <Icon name="CheckCircle" size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />}
            </div>
            {innFound && <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><Icon name="Building2" size={11} />Найдено: <b>{company}</b></p>}
          </div>
          {!innFound && (
            <div>
              <label className="field-label">Компания</label>
              <input value={company} onChange={e => setCompany(e.target.value)} placeholder="ООО «Компания» или ИП" className="crm-input" />
            </div>
          )}
          <div>
            <label className="field-label">Менеджер</label>
            <select value={managerId} onChange={e => setManagerId(e.target.value)} className="crm-input">
              {USERS.filter(u => u.isActive && ['admin', 'sales'].includes(u.role)).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          {err && <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-600"><Icon name="AlertCircle" size={14} />{err}</div>}
        </div>
        <div className="px-6 pb-5 pt-3 border-t border-border/60 flex-shrink-0">
          <button onClick={handleSave} disabled={saving || success} className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-70 flex items-center justify-center gap-2" style={{ background: success ? 'hsl(158 64% 45%)' : 'hsl(244 80% 60%)' }}>
            {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Сохраняем...</> : success ? <><Icon name="CheckCircle" size={16} />Клиент добавлен!</> : <><Icon name="Plus" size={15} />Добавить клиента</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Clients({ onOpenDeal }: { onOpenDeal?: (dealId: string) => void }) {
  const { clients } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Client | null>(null);
  const [showNew, setShowNew] = useState(false);

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = c.name.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.replace(/\D/g, '').includes(search.replace(/\D/g, '')) && search.replace(/\D/g, '').length > 2 ||
      (c.inn || '').includes(search);
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

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
            <h1 className="text-2xl font-bold text-foreground">Клиенты</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{clients.length} клиентов в базе</p>
          </div>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 hover:shadow-lg"
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
              placeholder="Поиск по имени, компании, email, телефону, ИНН..."
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
                          <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-muted-foreground">{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Icon name="ChevronRight" size={15} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">Клиенты не найдены</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <ClientModal
          client={selected}
          onClose={() => setSelected(null)}
          onOpenDeal={dealId => onOpenDeal?.(dealId)}
        />
      )}
      {showNew && <NewClientModal onClose={() => setShowNew(false)} />}
    </>
  );
}
