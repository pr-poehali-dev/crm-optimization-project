import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { INVOICES, CLIENTS, USERS, DEALS, type Invoice, SELF_EMPLOYED_DEFAULT, type SelfEmployedInfo } from '@/data/mock';

const statusConfig: Record<string, { label: string; badge: string }> = {
  draft: { label: 'Черновик', badge: 'bg-slate-100 text-slate-600' },
  sent: { label: 'Отправлен', badge: 'bg-blue-100 text-blue-700' },
  paid: { label: 'Оплачен', badge: 'bg-emerald-100 text-emerald-700' },
  overdue: { label: 'Просрочен', badge: 'bg-rose-100 text-rose-700' },
};

function InvoicePreview({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const client = CLIENTS.find(c => c.id === invoice.clientId);
  const deal = DEALS.find(d => d.id === invoice.dealId);
  const se = invoice.selfEmployed;
  const total = invoice.items.reduce((s, i) => s + i.qty * i.price, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-scale-in overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Invoice header */}
        <div className="px-8 py-6 flex items-start justify-between"
          style={{ background: 'hsl(220 25% 10%)' }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'hsl(244 80% 60%)' }}>
                <Icon name="Zap" size={14} className="text-white" />
              </div>
              <span className="text-white font-bold text-sm">CRM Pro</span>
            </div>
            <p className="text-white/50 text-xs mt-2">Счёт на оплату</p>
            <p className="text-white font-bold text-2xl mt-0.5">№ {invoice.number}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors mt-1">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="px-8 py-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Parties */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-secondary/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Исполнитель</p>
              <p className="font-bold text-foreground text-sm">{se.fullName}</p>
              <p className="text-xs text-muted-foreground mt-1">ИНН: {se.inn}</p>
              <p className="text-xs text-muted-foreground">Самозанятый</p>
              <p className="text-xs text-muted-foreground mt-1">{se.phone}</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Заказчик</p>
              <p className="font-bold text-foreground text-sm">{client?.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{client?.company}</p>
              {client?.inn && <p className="text-xs text-muted-foreground">ИНН: {client.inn}</p>}
              <p className="text-xs text-muted-foreground">{client?.email}</p>
            </div>
          </div>

          {/* Deal */}
          {deal && (
            <div className="p-3 rounded-xl border border-border/60 flex items-center gap-2 text-sm">
              <Icon name="Handshake" size={15} className="text-muted-foreground" />
              <span className="text-muted-foreground">Сделка:</span>
              <span className="font-medium text-foreground">{deal.title}</span>
            </div>
          )}

          {/* Items */}
          <div className="rounded-xl overflow-hidden border border-border/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/60">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Услуга / Товар</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-muted-foreground">Кол-во</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground">Цена</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground">Сумма</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {invoice.items.map(item => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-medium text-foreground">{item.name}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{item.qty}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{item.price.toLocaleString('ru-RU')} ₽</td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">{(item.qty * item.price).toLocaleString('ru-RU')} ₽</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-secondary/40">
                  <td colSpan={3} className="px-4 py-3 text-right font-bold text-foreground">Итого:</td>
                  <td className="px-4 py-3 text-right font-bold text-foreground text-base">{total.toLocaleString('ru-RU')} ₽</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Bank */}
          <div className="p-4 rounded-xl bg-secondary/50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Банковские реквизиты</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              {[
                ['Банк', se.bankName], ['БИК', se.bik],
                ['Р/счёт', se.account], ['К/счёт', se.corrAccount],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start gap-2">
                  <span className="text-muted-foreground w-14 flex-shrink-0">{label}:</span>
                  <span className="font-medium text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Дата выставления: <b className="text-foreground">{new Date(invoice.createdAt).toLocaleDateString('ru-RU')}</b></span>
            <span>Оплатить до: <b className="text-foreground">{new Date(invoice.dueDate).toLocaleDateString('ru-RU')}</b></span>
          </div>

          <div className="flex gap-2 pt-2">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary/50 transition-colors">
              <Icon name="Printer" size={15} />
              Печать
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary/50 transition-colors">
              <Icon name="Download" size={15} />
              Скачать PDF
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all"
              style={{ background: 'hsl(244 80% 60%)' }}>
              <Icon name="Send" size={15} />
              Отправить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewInvoiceModal({ onClose }: { onClose: () => void }) {
  const [se, setSe] = useState<SelfEmployedInfo>(SELF_EMPLOYED_DEFAULT);
  const [items, setItems] = useState([{ id: '1', name: '', qty: 1, price: 0 }]);
  const [clientId, setClientId] = useState('');
  const [dealId, setDealId] = useState('');

  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  const addItem = () => setItems(prev => [...prev, { id: Date.now().toString(), name: '', qty: 1, price: 0 }]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-scale-in overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-foreground text-lg">Новый счёт</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <Icon name="X" size={20} />
          </button>
        </div>
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Клиент</label>
              <select value={clientId} onChange={e => setClientId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Выберите клиента</option>
                {CLIENTS.map(c => <option key={c.id} value={c.id}>{c.name} — {c.company}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Сделка</label>
              <select value={dealId} onChange={e => setDealId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Выберите сделку</option>
                {DEALS.filter(d => !clientId || d.clientId === clientId).map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-2">Реквизиты самозанятого</label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { key: 'fullName', label: 'ФИО' },
                { key: 'inn', label: 'ИНН' },
                { key: 'bankName', label: 'Банк' },
                { key: 'bik', label: 'БИК' },
                { key: 'account', label: 'Расч. счёт' },
                { key: 'corrAccount', label: 'Корр. счёт' },
              ].map(f => (
                <input key={f.key}
                  value={se[f.key as keyof SelfEmployedInfo]}
                  onChange={e => setSe(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.label}
                  className="px-3 py-2.5 rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-muted-foreground">Позиции</label>
              <button onClick={addItem} className="text-xs text-primary font-semibold flex items-center gap-1 hover:opacity-75 transition-opacity">
                <Icon name="Plus" size={13} />
                Добавить
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={item.id} className="flex gap-2">
                  <input placeholder="Название" value={item.name}
                    onChange={e => setItems(prev => prev.map((p, i) => i === idx ? { ...p, name: e.target.value } : p))}
                    className="flex-1 px-3 py-2.5 rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                  <input type="number" placeholder="Кол." value={item.qty}
                    onChange={e => setItems(prev => prev.map((p, i) => i === idx ? { ...p, qty: +e.target.value } : p))}
                    className="w-16 px-2.5 py-2.5 rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 text-center" />
                  <input type="number" placeholder="Цена ₽" value={item.price}
                    onChange={e => setItems(prev => prev.map((p, i) => i === idx ? { ...p, price: +e.target.value } : p))}
                    className="w-28 px-3 py-2.5 rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                  {items.length > 1 && (
                    <button onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))} className="text-muted-foreground hover:text-rose-500 transition-colors">
                      <Icon name="Trash2" size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-end">
              <span className="text-sm font-bold text-foreground">Итого: {total.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary/50 transition-colors">
              Отмена
            </button>
            <button className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
              style={{ background: 'hsl(244 80% 60%)' }}>
              Создать счёт
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Invoices() {
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = INVOICES.filter(inv => {
    const client = CLIENTS.find(c => c.id === inv.clientId);
    const matchSearch = client?.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.number.includes(search);
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPaid = INVOICES.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const totalPending = INVOICES.filter(i => i.status === 'sent').reduce((s, i) => s + i.amount, 0);
  const totalOverdue = INVOICES.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Счета</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{INVOICES.length} счётов</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
          style={{ background: 'hsl(244 80% 60%)' }}>
          <Icon name="Plus" size={16} />
          Новый счёт
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Оплачено', value: totalPaid, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: 'CheckCircle' },
          { label: 'Ожидается', value: totalPending, color: 'text-blue-600', bg: 'bg-blue-50', icon: 'Clock' },
          { label: 'Просрочено', value: totalOverdue, color: 'text-rose-600', bg: 'bg-rose-50', icon: 'AlertCircle' },
        ].map(m => (
          <div key={m.label} className="metric-card">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center`}>
                <Icon name={m.icon} size={20} className={m.color} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-lg font-bold text-foreground">{(m.value / 1000).toFixed(0)} тыс ₽</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white rounded-xl border border-border shadow-sm flex-1 min-w-48">
          <Icon name="Search" size={16} className="text-muted-foreground" />
          <input className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-foreground"
            placeholder="Поиск по номеру, клиенту..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5 bg-white rounded-xl border border-border shadow-sm p-1">
          {[['all', 'Все'], ['draft', 'Черновики'], ['sent', 'Отправлены'], ['paid', 'Оплачены'], ['overdue', 'Просрочены']].map(([val, label]) => (
            <button key={val} onClick={() => setStatusFilter(val)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${statusFilter === val ? 'text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              style={statusFilter === val ? { background: 'hsl(244 80% 60%)' } : {}}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              {['Номер', 'Клиент', 'Сделка', 'Сумма', 'Статус', 'Срок', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {filtered.map(inv => {
              const client = CLIENTS.find(c => c.id === inv.clientId);
              const deal = DEALS.find(d => d.id === inv.dealId);
              return (
                <tr key={inv.id} className="hover:bg-secondary/30 transition-colors cursor-pointer group" onClick={() => setSelected(inv)}>
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-bold text-foreground">№ {inv.number}</span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-foreground">{client?.name}</td>
                  <td className="px-4 py-3.5 text-sm text-muted-foreground truncate max-w-40">{deal?.title}</td>
                  <td className="px-4 py-3.5 text-sm font-bold text-foreground">{inv.amount.toLocaleString('ru-RU')} ₽</td>
                  <td className="px-4 py-3.5">
                    <span className={`status-badge ${statusConfig[inv.status].badge}`}>{statusConfig[inv.status].label}</span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-muted-foreground">{new Date(inv.dueDate).toLocaleDateString('ru-RU')}</td>
                  <td className="px-4 py-3.5">
                    <Icon name="Eye" size={15} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && <InvoicePreview invoice={selected} onClose={() => setSelected(null)} />}
      {showNew && <NewInvoiceModal onClose={() => setShowNew(false)} />}
    </div>
  );
}
