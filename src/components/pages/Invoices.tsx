import React, { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { CLIENTS, USERS, type Invoice, type InvoiceItem, type Client } from '@/data/mock';
import { useStore, addInvoice, addClient } from '@/data/store';
import ClientPicker from '@/components/ClientPicker';
import { resolveINN } from '@/lib/inn';

const statusConfig: Record<string, { label: string; badge: string }> = {
  draft: { label: 'Черновик', badge: 'bg-slate-100 text-slate-600' },
  sent: { label: 'Отправлен', badge: 'bg-blue-100 text-blue-700' },
  paid: { label: 'Оплачен', badge: 'bg-emerald-100 text-emerald-700' },
  overdue: { label: 'Просрочен', badge: 'bg-rose-100 text-rose-700' },
};

// ── Strict business invoice template ─────────────────────────────────────────
function InvoiceTemplate({ invoice, client, deal }: { invoice: Invoice; client: ReturnType<typeof CLIENTS.find>; deal: string }) {
  const se = invoice.selfEmployed;
  const total = invoice.items.reduce((s, i) => s + i.qty * i.price, 0);
  const S = {
    page: { fontFamily: 'Arial, sans-serif', background: '#fff', color: '#000', padding: '32px 40px', fontSize: 12, lineHeight: 1.4 } as React.CSSProperties,
    title: { fontSize: 18, fontWeight: 700, letterSpacing: 0, marginBottom: 2, color: '#000' } as React.CSSProperties,
    sub: { fontSize: 12, color: '#555', marginBottom: 0 } as React.CSSProperties,
    divider: { borderTop: '2px solid #000', margin: '16px 0' } as React.CSSProperties,
    thinDivider: { borderTop: '1px solid #ccc', margin: '10px 0' } as React.CSSProperties,
    label: { fontSize: 10, textTransform: 'uppercase' as const, letterSpacing: 1, color: '#777', marginBottom: 3 },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32 } as React.CSSProperties,
    block: { flex: 1 } as React.CSSProperties,
    name: { fontWeight: 700, fontSize: 13, marginBottom: 4 } as React.CSSProperties,
    detail: { fontSize: 11, color: '#444', lineHeight: 1.65 } as React.CSSProperties,
    tableWrap: { border: '1px solid #000', marginBottom: 0 } as React.CSSProperties,
    th: { padding: '7px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 0.5, borderBottom: '1px solid #000', background: '#f5f5f5', textAlign: 'left' as const } as React.CSSProperties,
    thR: { padding: '7px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, borderBottom: '1px solid #000', background: '#f5f5f5', textAlign: 'right' as const } as React.CSSProperties,
    td: { padding: '8px 10px', fontSize: 12, borderBottom: '1px solid #e5e5e5', verticalAlign: 'top' as const } as React.CSSProperties,
    tdR: { padding: '8px 10px', fontSize: 12, borderBottom: '1px solid #e5e5e5', textAlign: 'right' as const, verticalAlign: 'top' as const } as React.CSSProperties,
  };

  return (
    <div id="invoice-print" style={S.page}>
      {/* Header */}
      <div style={S.row}>
        <div>
          <div style={S.title}>СЧЁТ НА ОПЛАТУ № {invoice.number}</div>
          <div style={S.sub}>от {new Date(invoice.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#555', marginBottom: 2 }}>Срок оплаты</div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{new Date(invoice.dueDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
      </div>

      <div style={S.divider} />

      {/* Parties */}
      <div style={S.row}>
        <div style={S.block}>
          <div style={S.label}>Исполнитель</div>
          <div style={S.name}>{se.fullName}</div>
          <div style={S.detail}>
            <div>ИНН: {se.inn}</div>
            <div>Плательщик НПД (самозанятый)</div>
            <div>{se.phone}</div>
          </div>
        </div>
        <div style={{ width: 1, background: '#ddd', alignSelf: 'stretch', margin: '0 8px' }} />
        <div style={S.block}>
          <div style={S.label}>Заказчик</div>
          <div style={S.name}>{client?.name}</div>
          <div style={S.detail}>
            <div>{client?.company}</div>
            {client?.inn && <div>ИНН: {client.inn}</div>}
            {client?.phone && <div>{client.phone}</div>}
            {client?.email && <div>{client.email}</div>}
          </div>
        </div>
      </div>

      <div style={S.divider} />

      {/* Bank requisites — placed prominently up front so payer can pay right away */}
      <div style={{ marginBottom: 16, background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 6, padding: '12px 16px' }}>
        <div style={{ ...S.label, marginBottom: 8 }}>Банковские реквизиты для оплаты</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto 1fr', gap: '5px 20px', fontSize: 12 }}>
          {[['Банк', se.bankName], ['БИК', se.bik], ['Расч. счёт', se.account], ['Корр. счёт', se.corrAccount]].map(([l, v]) => (
            <React.Fragment key={l}>
              <span style={{ color: '#666', whiteSpace: 'nowrap' }}>{l}:</span>
              <span style={{ fontWeight: 600 }}>{v}</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={S.thinDivider} />

      {/* Basis */}
      {deal && (
        <div style={{ marginBottom: 16, fontSize: 12 }}>
          <span style={{ fontWeight: 700 }}>Основание: </span>{deal}
        </div>
      )}

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: 0 }}>
        <thead>
          <tr>
            <th style={{ ...S.th, width: 32 }}>№</th>
            <th style={S.th}>Наименование услуг / работ</th>
            <th style={{ ...S.thR, width: 52 }}>Кол.</th>
            <th style={{ ...S.thR, width: 56 }}>Ед.</th>
            <th style={{ ...S.thR, width: 110 }}>Цена, ₽</th>
            <th style={{ ...S.thR, width: 120, borderRight: 'none' }}>Сумма, ₽</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, i) => (
            <tr key={item.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
              <td style={{ ...S.td, textAlign: 'center', color: '#777' }}>{i + 1}</td>
              <td style={S.td}>{item.name}</td>
              <td style={S.tdR}>{item.qty}</td>
              <td style={{ ...S.tdR, color: '#555' }}>{item.unit || 'шт.'}</td>
              <td style={S.tdR}>{item.price.toLocaleString('ru-RU')}</td>
              <td style={{ ...S.tdR, fontWeight: 600 }}>{(item.qty * item.price).toLocaleString('ru-RU')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total block */}
      <div style={{ border: '1px solid #000', borderTop: 'none', padding: '0' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid #ddd' }}>
          <div style={{ padding: '7px 10px', fontSize: 11, color: '#555', borderRight: '1px solid #ddd', minWidth: 200, textAlign: 'right' }}>Итого без налога (НДС):</div>
          <div style={{ padding: '7px 10px', fontSize: 11, minWidth: 120, textAlign: 'right' }}>—</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid #ddd' }}>
          <div style={{ padding: '7px 10px', fontSize: 11, color: '#555', borderRight: '1px solid #ddd', minWidth: 200, textAlign: 'right' }}>НДС:</div>
          <div style={{ padding: '7px 10px', fontSize: 11, minWidth: 120, textAlign: 'right' }}>Не облагается</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', background: '#f5f5f5' }}>
          <div style={{ padding: '10px 10px', fontSize: 13, fontWeight: 700, borderRight: '1px solid #ddd', minWidth: 200, textAlign: 'right' }}>ИТОГО К ОПЛАТЕ:</div>
          <div style={{ padding: '10px 10px', fontSize: 14, fontWeight: 700, minWidth: 120, textAlign: 'right' }}>{total.toLocaleString('ru-RU')} ₽</div>
        </div>
      </div>

      {/* Amount in words */}
      <div style={{ marginTop: 10, fontSize: 11, color: '#333' }}>
        Всего наименований {invoice.items.length}, на сумму <b>{total.toLocaleString('ru-RU')} руб.</b>
        &nbsp;НДС не облагается (применяется специальный налоговый режим «Налог на профессиональный доход»).
      </div>

      {/* Signature */}
      <div style={S.thinDivider} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 16 }}>
        <div>
          <div style={{ color: '#555', marginBottom: 24 }}>Исполнитель</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ borderBottom: '1px solid #000', width: 180 }} />
            <span style={{ fontSize: 11, color: '#555' }}>/ {se.fullName.split(' ').map((w, i) => i === 0 ? w : w[0] + '.').join(' ')} /</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#555', marginBottom: 24 }}>М.П.</div>
          <div style={{ width: 72, height: 72, border: '1px dashed #bbb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 10, marginLeft: 'auto' }}>Печать</div>
        </div>
      </div>
    </div>
  );
}

// ── Invoice preview modal ────────────────────────────────────────────────────
function InvoicePreview({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const { clients, deals } = useStore();
  const client = clients.find(c => c.id === invoice.clientId);
  const deal = deals.find(d => d.id === invoice.dealId);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head>
      <meta charset="utf-8">
      <title>Счёт № ${invoice.number}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
      <style>
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Golos Text',sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
        @page{margin:0;size:A4;}
        @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
      </style>
      </head><body>${content}</body></html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl animate-scale-in flex flex-col" style={{ maxHeight: '92vh' }} onClick={e => e.stopPropagation()}>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <Icon name="FileText" size={18} className="text-muted-foreground" />
            <span className="font-semibold text-foreground">Счёт № {invoice.number}</span>
            <span className={`status-badge ${statusConfig[invoice.status].badge} ml-1`}>{statusConfig[invoice.status].label}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border text-sm font-medium hover:bg-secondary/50 transition-colors">
              <Icon name="Printer" size={15} />Печать / PDF
            </button>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground ml-1"><Icon name="X" size={20} /></button>
          </div>
        </div>
        {/* Preview */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden" ref={printRef}>
            <InvoiceTemplate invoice={invoice} client={client} deal={deal?.title || ''} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Nomenclature combobox for a line item ────────────────────────────────────
function NomenclatureCombobox({ value, onChange, onPick }: { value: string; onChange: (name: string) => void; onPick: (name: string, price: number, unit: string) => void }) {
  const { nomenclature } = useStore();
  const [open, setOpen] = useState(false);

  const results = value.trim()
    ? nomenclature.filter(n => n.name.toLowerCase().includes(value.toLowerCase())).slice(0, 6)
    : nomenclature.slice(0, 6);

  return (
    <div className="relative flex-1">
      <input
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Название позиции (из номенклатуры или вручную)"
        className="crm-input"
      />
      {open && results.length > 0 && (
        <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {results.map(n => (
            <button
              key={n.id}
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => { onPick(n.name, n.price, n.unit); setOpen(false); }}
              className="w-full text-left px-3 py-2 hover:bg-secondary/60 transition-colors border-b border-border/40 last:border-0 flex items-center justify-between gap-2"
            >
              <span className="text-sm text-foreground truncate">{n.name}</span>
              <span className="text-xs text-muted-foreground flex-shrink-0">{n.price.toLocaleString('ru-RU')} ₽/{n.unit}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Quick "new client by INN" inline form ────────────────────────────────────
function NewClientByInn({ onCreated }: { onCreated: (clientId: string) => void }) {
  const [open, setOpen] = useState(false);
  const [inn, setInn] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [innLoading, setInnLoading] = useState(false);
  const [innFound, setInnFound] = useState(false);
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

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs text-primary font-semibold flex items-center gap-1 hover:opacity-75">
        <Icon name="UserPlus" size={13} />Не нашли клиента? Добавить по ИНН
      </button>
    );
  }

  const handleCreate = () => {
    if (!name.trim() || !phone.trim()) { setErr('Укажите имя и телефон'); return; }
    const newId = `c${Date.now()}`;
    addClient({ id: newId, name, company: company || 'Не указана', email: '', phone, status: 'lead', managerId: USERS[1].id, createdAt: new Date().toISOString().split('T')[0], tags: ['Новый'], inn: inn || undefined } as Client);
    onCreated(newId);
  };

  return (
    <div className="border border-dashed border-primary/40 rounded-xl p-3 space-y-2 bg-primary/5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Новый клиент по ИНН</span>
        <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground"><Icon name="X" size={14} /></button>
      </div>
      <div className="relative">
        <input value={inn} onChange={e => setInn(e.target.value.replace(/\D/g, '').slice(0, 12))} placeholder="ИНН — подтянем компанию" className="crm-input pr-8" />
        {innLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />}
        {innFound && !innLoading && <Icon name="CheckCircle" size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />}
      </div>
      {innFound && <p className="text-xs text-emerald-600 flex items-center gap-1"><Icon name="Building2" size={11} />Найдено: <b>{company}</b></p>}
      {!innFound && <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Компания" className="crm-input" />}
      <div className="grid grid-cols-2 gap-2">
        <input value={name} onChange={e => { setName(e.target.value); setErr(''); }} placeholder="Имя *" className="crm-input" />
        <input value={phone} onChange={e => { setPhone(e.target.value); setErr(''); }} placeholder="Телефон *" className="crm-input" />
      </div>
      {err && <p className="text-xs text-rose-500">{err}</p>}
      <button type="button" onClick={handleCreate} className="w-full py-2 rounded-xl text-white text-xs font-semibold hover:opacity-90 transition-all" style={{ background: 'hsl(244 80% 60%)' }}>
        Создать и выбрать клиента
      </button>
    </div>
  );
}

// ── Invoice form modal ────────────────────────────────────────────────────────
export function InvoiceFormModal({ onClose, prefillDealId, prefillClientId }: { onClose: () => void; prefillDealId?: string; prefillClientId?: string }) {
  const { deals, invoices, selfEmployed } = useStore();
  const [clientId, setClientId] = useState(prefillClientId ?? '');
  const [dealId, setDealId] = useState(prefillDealId ?? '');
  const [items, setItems] = useState<InvoiceItem[]>([{ id: '1', name: '', qty: 1, price: 0, unit: 'шт.' }]);
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);

  const total = items.reduce((s, i) => s + i.qty * i.price, 0);
  const nextNum = String(invoices.length + 1).padStart(3, '0');

  const addItem = () => setItems(p => [...p, { id: `i${Date.now()}`, name: '', qty: 1, price: 0, unit: 'шт.' }]);

  const handleSave = () => {
    if (!clientId) return;
    setSaving(true);
    setTimeout(() => {
      const inv: Invoice = {
        id: `inv${Date.now()}`, number: nextNum, clientId, dealId: dealId || '',
        managerId: USERS[1].id, amount: total, status: 'draft',
        createdAt: new Date().toISOString().split('T')[0],
        dueDate: dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        items, selfEmployed,
      };
      addInvoice(inv);
      setSaving(false); setSaved(true);
      setCreatedInvoice(inv);
    }, 500);
  };

  if (createdInvoice) {
    return <InvoicePreview invoice={createdInvoice} onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-scale-in flex flex-col" style={{ maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-5 pb-4 border-b border-border/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'hsl(244 80% 60%)' }}><Icon name="Receipt" size={16} className="text-white" /></div>
            <h2 className="font-bold text-foreground text-lg">Выставить счёт</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><Icon name="X" size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Client & Deal */}
          <div>
            <label className="field-label">Клиент * — поиск по имени, компании, телефону или ИНН</label>
            <ClientPicker clientId={clientId} onChange={setClientId} placeholder="Введите ИНН, телефон, имя или компанию..." />
            {!clientId && (
              <div className="mt-2">
                <NewClientByInn onCreated={id => setClientId(id)} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Сделка</label>
              <select value={dealId} onChange={e => setDealId(e.target.value)} className="crm-input">
                <option value="">— Без сделки —</option>
                {deals.filter(d => !clientId || d.clientId === clientId).map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
              </select>
            </div>
            <div><label className="field-label">Срок оплаты</label><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="crm-input" /></div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50 text-xs text-muted-foreground">
            <Icon name="Landmark" size={14} className="flex-shrink-0" />
            Реквизиты <b className="text-foreground">{selfEmployed.fullName}</b> подставятся в счёт автоматически. Изменить их можно в разделе «Роли и права».
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><div className="w-1 h-4 rounded-full" style={{ background: 'hsl(38 95% 55%)' }} /><span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Позиции</span></div>
              <button onClick={addItem} className="text-xs text-primary font-semibold flex items-center gap-1 hover:opacity-75"><Icon name="Plus" size={13} />Добавить</button>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={item.id} className="flex gap-2 items-center">
                  <NomenclatureCombobox
                    value={item.name}
                    onChange={name => setItems(p => p.map((x, i) => i === idx ? { ...x, name } : x))}
                    onPick={(name, price, unit) => setItems(p => p.map((x, i) => i === idx ? { ...x, name, price, unit } : x))}
                  />
                  <input type="number" placeholder="Кол." value={item.qty} onChange={e => setItems(p => p.map((x, i) => i === idx ? { ...x, qty: +e.target.value } : x))} className="crm-input text-center" style={{ width: 64 }} />
                  <input type="number" placeholder="Цена ₽" value={item.price || ''} onChange={e => setItems(p => p.map((x, i) => i === idx ? { ...x, price: +e.target.value } : x))} className="crm-input" style={{ width: 110 }} />
                  {items.length > 1 && <button onClick={() => setItems(p => p.filter((_, i) => i !== idx))} className="text-muted-foreground hover:text-rose-500 transition-colors flex-shrink-0"><Icon name="Trash2" size={16} /></button>}
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-3 pt-3 border-t border-border/60">
              <span className="text-base font-bold text-foreground">Итого: {total.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>
        </div>

        <div className="px-6 pb-5 pt-3 border-t border-border/60 flex gap-2 flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary/50 transition-colors">Отмена</button>
          <button onClick={handleSave} disabled={!clientId || saving || saved} className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: 'hsl(244 80% 60%)' }}>
            {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Создаём...</> : <><Icon name="FileText" size={15} />Создать и просмотреть</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Invoices() {
  const { invoices, clients, deals } = useStore();
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = invoices.filter(inv => {
    const client = clients.find(c => c.id === inv.clientId);
    const matchSearch = client?.name.toLowerCase().includes(search.toLowerCase()) || inv.number.includes(search);
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === 'sent').reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);

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
            <h1 className="text-2xl font-bold text-foreground">Счета</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{invoices.length} счётов</p>
          </div>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all" style={{ background: 'hsl(244 80% 60%)', boxShadow: '0 4px 14px hsl(244 80% 60% / 0.3)' }}>
            <Icon name="Plus" size={16} />Новый счёт
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
                <div className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center`}><Icon name={m.icon} size={20} className={m.color} /></div>
                <div><p className="text-xs text-muted-foreground">{m.label}</p><p className="text-lg font-bold text-foreground">{(m.value / 1000).toFixed(0)} тыс ₽</p></div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white rounded-xl border border-border shadow-sm flex-1 min-w-48">
            <Icon name="Search" size={16} className="text-muted-foreground" />
            <input className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-foreground" placeholder="Поиск..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1.5 bg-white rounded-xl border border-border shadow-sm p-1">
            {[['all', 'Все'], ['draft', 'Черновики'], ['sent', 'Отправлены'], ['paid', 'Оплачены'], ['overdue', 'Просрочены']].map(([val, label]) => (
              <button key={val} onClick={() => setStatusFilter(val)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${statusFilter === val ? 'text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`} style={statusFilter === val ? { background: 'hsl(244 80% 60%)' } : {}}>{label}</button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-border/50">{['Номер', 'Клиент', 'Сделка', 'Сумма', 'Статус', 'Срок', ''].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map(inv => {
                const client = clients.find(c => c.id === inv.clientId);
                const deal = deals.find(d => d.id === inv.dealId);
                return (
                  <tr key={inv.id} className="hover:bg-secondary/30 transition-colors cursor-pointer group" onClick={() => setSelected(inv)}>
                    <td className="px-4 py-3.5 text-sm font-bold text-foreground">№ {inv.number}</td>
                    <td className="px-4 py-3.5 text-sm text-foreground">{client?.name}</td>
                    <td className="px-4 py-3.5 text-sm text-muted-foreground truncate max-w-40">{deal?.title || '—'}</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-foreground">{inv.amount.toLocaleString('ru-RU')} ₽</td>
                    <td className="px-4 py-3.5"><span className={`status-badge ${statusConfig[inv.status].badge}`}>{statusConfig[inv.status].label}</span></td>
                    <td className="px-4 py-3.5 text-sm text-muted-foreground">{new Date(inv.dueDate).toLocaleDateString('ru-RU')}</td>
                    <td className="px-4 py-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Icon name="Eye" size={15} className="text-muted-foreground" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <InvoicePreview invoice={selected} onClose={() => setSelected(null)} />}
      {showNew && <InvoiceFormModal onClose={() => setShowNew(false)} />}
    </>
  );
}