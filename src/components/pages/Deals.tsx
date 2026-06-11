import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { USERS, type Deal, type Client, type Task } from '@/data/mock';
import { useStore, addClient, addDeal, addTask, addComment, updateDealStage } from '@/data/store';

const stages = [
  { id: 'new', label: 'Новые', color: 'hsl(214 84% 56%)', badge: 'bg-blue-100 text-blue-700' },
  { id: 'negotiation', label: 'Переговоры', color: 'hsl(38 95% 55%)', badge: 'bg-amber-100 text-amber-700' },
  { id: 'proposal', label: 'Предложение', color: 'hsl(244 80% 60%)', badge: 'bg-violet-100 text-violet-700' },
  { id: 'won', label: 'Выиграны', color: 'hsl(158 64% 45%)', badge: 'bg-emerald-100 text-emerald-700' },
  { id: 'lost', label: 'Проиграны', color: 'hsl(350 80% 58%)', badge: 'bg-rose-100 text-rose-700' },
];

const INN_DB: Record<string, string> = {
  '7701234567': 'ООО «Технологии»', '7707083893': 'ПАО Сбербанк',
  '7736207543': 'ПАО Газпром', '5010051523': 'ООО «Яндекс»',
  '7704340310': 'ООО «ВКонтакте»', '771234567890': 'ИП Никитина',
  '7728168971': 'ООО «МТС»', '9999000001': 'ООО «Рога и Копыта»',
};
function resolveINN(inn: string): Promise<string | null> {
  return new Promise(r => setTimeout(() => r(INN_DB[inn] || null), 500));
}

const priorityOpts = [
  { id: 'low' as Task['priority'], label: 'Низкий', cls: 'bg-slate-100 text-slate-600' },
  { id: 'medium' as Task['priority'], label: 'Средний', cls: 'bg-amber-100 text-amber-700' },
  { id: 'high' as Task['priority'], label: 'Высокий', cls: 'bg-rose-100 text-rose-700' },
];

// ── TaskModal ────────────────────────────────────────────────────────────────
function TaskModal({ deal, onClose }: { deal: Deal; onClose: () => void }) {
  const { clients } = useStore();
  const client = clients.find(c => c.id === deal.clientId);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [assigneeId, setAssigneeId] = useState(deal.managerId ?? USERS[1].id);
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDate, setDueDate] = useState('');
  const [phone, setPhone] = useState(client?.phone ?? '');
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState('');

  const handleSave = () => {
    if (!title.trim()) { setErr('Введите название задачи'); return; }
    addTask({ id: `t${Date.now()}`, title, description: comment || undefined, assigneeId, clientId: deal.clientId, dealId: deal.id, priority, status: 'todo', dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], createdAt: new Date().toISOString().split('T')[0] });
    setSaved(true);
    setTimeout(onClose, 700);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'hsl(244 80% 60%)' }}><Icon name="CheckSquare" size={15} className="text-white" /></div>
            <div><h2 className="font-bold text-foreground text-base">Новая задача</h2><p className="text-xs text-muted-foreground">{deal.title}</p></div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><Icon name="X" size={18} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="field-label">Задача *</label>
            <input value={title} onChange={e => { setTitle(e.target.value); setErr(''); }} placeholder="Позвонить, отправить КП..." className={`crm-input ${err ? 'border-rose-400' : ''}`} autoFocus />
            {err && <p className="text-xs text-rose-500 mt-1">{err}</p>}
          </div>
          <div><label className="field-label">Комментарий</label><textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Детали, что важно учесть..." rows={2} className="crm-input resize-none" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="field-label">Ответственный</label>
              <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} className="crm-input">
                {USERS.filter(u => u.isActive).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div><label className="field-label">Срок</label><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="crm-input" /></div>
          </div>
          <div><label className="field-label">Приоритет</label>
            <div className="flex gap-2">
              {priorityOpts.map(p => <button key={p.id} type="button" onClick={() => setPriority(p.id)} className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${priority === p.id ? `${p.cls} border-current` : 'border-transparent bg-secondary text-muted-foreground hover:bg-secondary/70'}`}>{p.label}</button>)}
            </div>
          </div>
          <div><label className="field-label">Телефон</label><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 900 000 00 00" className="crm-input" /></div>
          {client && <div className="flex items-center gap-2 p-2.5 rounded-xl bg-secondary/60 text-xs text-muted-foreground"><Icon name="User" size={13} /><span>Клиент: <b className="text-foreground">{client.name}</b> · {client.company}</span></div>}
          <button onClick={handleSave} disabled={saved} className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90" style={{ background: saved ? 'hsl(158 64% 45%)' : 'hsl(244 80% 60%)' }}>
            {saved ? <><Icon name="Check" size={15} className="inline mr-1.5" />Задача создана!</> : 'Поставить задачу'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── DealModal with comments ──────────────────────────────────────────────────
function DealModal({ deal, onClose, onInvoice }: { deal: Deal; onClose: () => void; onInvoice: (deal: Deal) => void }) {
  const { clients, tasks, comments } = useStore();
  const [showTask, setShowTask] = useState(false);
  const [commentText, setCommentText] = useState('');
  const client = clients.find(c => c.id === deal.clientId);
  const manager = USERS.find(u => u.id === deal.managerId);
  const stage = stages.find(s => s.id === deal.stage);
  const dealTasks = tasks.filter(t => t.dealId === deal.id);
  const dealComments = comments.filter(c => c.entityId === deal.id);
  const currentUser = USERS[0];

  const sendComment = () => {
    if (!commentText.trim()) return;
    addComment(deal.id, commentText, currentUser.id);
    setCommentText('');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col animate-scale-in" style={{ maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
          <div className="px-6 pt-5 pb-4 border-b border-border/60 flex-shrink-0">
            <div className="flex items-start justify-between">
              <div><h2 className="font-bold text-foreground text-lg pr-4">{deal.title}</h2><p className="text-muted-foreground text-sm mt-0.5">{client?.company || client?.name}</p></div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground flex-shrink-0"><Icon name="X" size={20} /></button>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className={`status-badge ${stage?.badge}`}>{stage?.label}</span>
              {deal.amount > 0 && <span className="text-lg font-bold text-foreground">{deal.amount.toLocaleString('ru-RU')} ₽</span>}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div className="space-y-2">
              {[
                { icon: 'User', label: 'Клиент', value: client?.name },
                { icon: 'Phone', label: 'Телефон', value: client?.phone },
                { icon: 'Mail', label: 'Email', value: client?.email },
                { icon: 'UserCircle', label: 'Менеджер', value: manager?.name },
              ].filter(r => r.value).map(row => (
                <div key={row.label} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/50">
                  <Icon name={row.icon} size={14} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground w-14">{row.label}</span>
                  <span className="text-sm font-medium text-foreground truncate">{row.value}</span>
                </div>
              ))}
            </div>

            {deal.notes && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                <p className="text-xs text-amber-700 font-semibold mb-1">Комментарий к сделке</p>
                <p className="text-sm text-foreground">{deal.notes}</p>
              </div>
            )}

            {dealTasks.length > 0 && (
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Задачи</p>
                <div className="space-y-1.5">
                  {dealTasks.map(t => (
                    <div key={t.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-violet-50 border border-violet-100 text-sm">
                      <Icon name="CheckSquare" size={13} className="text-violet-500 flex-shrink-0" />
                      <span className="font-medium text-foreground truncate flex-1">{t.title}</span>
                      <span className="text-xs text-muted-foreground">{USERS.find(u => u.id === t.assigneeId)?.name.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                Комментарии {dealComments.length > 0 && `(${dealComments.length})`}
              </p>
              {dealComments.length > 0 && (
                <div className="space-y-2 mb-3">
                  {dealComments.map(c => {
                    const author = USERS.find(u => u.id === c.authorId);
                    return (
                      <div key={c.id} className="flex gap-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5" style={{ background: 'hsl(244 80% 60%)' }}>{author?.avatar.slice(0, 1)}</div>
                        <div className="flex-1 bg-secondary/60 rounded-xl p-2.5">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-foreground">{author?.name.split(' ')[0]}</span>
                            <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-sm text-foreground">{c.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="flex gap-2">
                <input value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendComment()} placeholder="Написать комментарий..." className="crm-input flex-1" />
                <button onClick={sendComment} disabled={!commentText.trim()} className="px-3 py-2 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90 disabled:opacity-30 flex-shrink-0" style={{ background: 'hsl(244 80% 60%)' }}>
                  <Icon name="Send" size={15} />
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 pb-5 pt-3 border-t border-border/60 flex gap-2 flex-shrink-0">
            <button onClick={() => setShowTask(true)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary/50 transition-colors">
              <Icon name="CheckSquare" size={15} />Поставить задачу
            </button>
            <button onClick={() => { onInvoice(deal); onClose(); }} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90" style={{ background: 'hsl(244 80% 60%)' }}>
              <Icon name="Receipt" size={15} />Выставить счёт
            </button>
          </div>
        </div>
      </div>
      {showTask && <TaskModal deal={deal} onClose={() => setShowTask(false)} />}
    </>
  );
}

// ── NewDealModal ─────────────────────────────────────────────────────────────
function NewDealModal({ onClose }: { onClose: () => void }) {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientInn, setClientInn] = useState('');
  const [dealTitle, setDealTitle] = useState('');
  const [dealAmount, setDealAmount] = useState('');
  const [dealStage, setDealStage] = useState<Deal['stage']>('new');
  const [dealManagerId, setDealManagerId] = useState(USERS[1].id);
  const [dealComment, setDealComment] = useState('');
  const [innLoading, setInnLoading] = useState(false);
  const [innFound, setInnFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState('');
  const innTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (clientInn.length < 10) { setInnFound(false); return; }
    setInnLoading(true);
    clearTimeout(innTimer.current);
    innTimer.current = setTimeout(async () => {
      const company = await resolveINN(clientInn);
      setInnLoading(false);
      if (company) { setClientCompany(company); setInnFound(true); } else setInnFound(false);
    }, 300);
  }, [clientInn]);

  const handleSave = () => {
    if (!clientName.trim() || !clientPhone.trim()) { setErr('Заполните имя и телефон клиента'); return; }
    if (!dealTitle.trim()) { setErr('Введите название сделки'); return; }
    setSaving(true);
    setTimeout(() => {
      const newClientId = `c${Date.now()}`;
      addClient({ id: newClientId, name: clientName, company: clientCompany || 'Не указана', email: '', phone: clientPhone, status: 'lead', managerId: dealManagerId, createdAt: new Date().toISOString().split('T')[0], tags: ['Новый'], inn: clientInn || undefined } as Client);
      addDeal({ id: `d${Date.now()}`, title: dealTitle, clientId: newClientId, managerId: dealManagerId, stage: dealStage, amount: parseInt(dealAmount.replace(/\D/g, '')) || 0, createdAt: new Date().toISOString().split('T')[0], notes: dealComment || undefined });
      setSaving(false); setSuccess(true);
      setTimeout(onClose, 700);
    }, 500);
  };

  const fmtAmount = (v: string) => { const n = v.replace(/\D/g, ''); return n ? parseInt(n).toLocaleString('ru-RU') : ''; };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in flex flex-col" style={{ maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-5 pb-4 flex-shrink-0 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'hsl(244 80% 60%)' }}><Icon name="Handshake" size={16} className="text-white" /></div>
            <h2 className="font-bold text-foreground text-lg">Новая сделка</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><Icon name="X" size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3"><div className="w-1 h-4 rounded-full" style={{ background: 'hsl(244 80% 60%)' }} /><span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Клиент</span></div>
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div><label className="field-label">Имя *</label><input value={clientName} onChange={e => { setClientName(e.target.value); setErr(''); }} placeholder="Иван Иванов" className="crm-input" autoFocus /></div>
                <div><label className="field-label">Телефон *</label><input value={clientPhone} onChange={e => { setClientPhone(e.target.value); setErr(''); }} placeholder="+7 900 000 00 00" className="crm-input" /></div>
              </div>
              <div>
                <label className="field-label">ИНН (опционально)</label>
                <div className="relative">
                  <input value={clientInn} onChange={e => setClientInn(e.target.value.replace(/\D/g, '').slice(0, 12))} placeholder="Введите ИНН — подтянем компанию" className="crm-input pr-8" />
                  {innLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />}
                  {innFound && !innLoading && <Icon name="CheckCircle" size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />}
                </div>
                {innFound && <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><Icon name="Building2" size={11} />Найдено: <b>{clientCompany}</b></p>}
              </div>
              {!innFound && <div><label className="field-label">Компания</label><input value={clientCompany} onChange={e => setClientCompany(e.target.value)} placeholder="ООО «Компания» или ИП" className="crm-input" /></div>}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3"><div className="w-1 h-4 rounded-full" style={{ background: 'hsl(38 95% 55%)' }} /><span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Сделка</span></div>
            <div className="space-y-2.5">
              <div><label className="field-label">Название *</label><input value={dealTitle} onChange={e => { setDealTitle(e.target.value); setErr(''); }} placeholder="Разработка сайта, поставка..." className="crm-input" /></div>
              <div className="grid grid-cols-2 gap-2.5">
                <div><label className="field-label">Сумма</label>
                  <div className="relative"><input value={dealAmount} onChange={e => setDealAmount(fmtAmount(e.target.value))} placeholder="0" className="crm-input pr-5" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₽</span></div>
                </div>
                <div><label className="field-label">Ответственный</label>
                  <select value={dealManagerId} onChange={e => setDealManagerId(e.target.value)} className="crm-input">
                    {USERS.filter(u => u.isActive && ['admin', 'sales'].includes(u.role)).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="field-label">Этап воронки</label>
                <div className="flex gap-1.5 flex-wrap">
                  {stages.map(s => <button key={s.id} type="button" onClick={() => setDealStage(s.id as Deal['stage'])} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${dealStage === s.id ? `${s.badge} border-current` : 'border-transparent bg-secondary text-muted-foreground hover:bg-secondary/70'}`}><div className="w-1.5 h-1.5 rounded-full" style={{ background: dealStage === s.id ? s.color : 'currentColor', opacity: dealStage === s.id ? 1 : 0.4 }} />{s.label}</button>)}
                </div>
              </div>
              <div><label className="field-label">Комментарий</label><textarea value={dealComment} onChange={e => setDealComment(e.target.value)} placeholder="Откуда пришёл клиент, что обсудили..." rows={2} className="crm-input resize-none" /></div>
            </div>
          </div>
          {err && <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-600"><Icon name="AlertCircle" size={14} className="flex-shrink-0" />{err}</div>}
        </div>
        <div className="px-6 pb-5 pt-3 flex-shrink-0 border-t border-border/60">
          <button onClick={handleSave} disabled={saving || success} className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-70 flex items-center justify-center gap-2" style={{ background: success ? 'hsl(158 64% 45%)' : 'hsl(244 80% 60%)' }}>
            {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Сохраняем...</> : success ? <><Icon name="CheckCircle" size={16} />Создано!</> : <><Icon name="Zap" size={15} />Создать сделку</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Deals({ onOpenInvoice }: { onOpenInvoice?: (dealId: string, clientId: string) => void }) {
  const { deals, clients } = useStore();
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [selected, setSelected] = useState<Deal | null>(null);
  const [showNew, setShowNew] = useState(false);
  const dragId = useRef<string | null>(null);

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    dragId.current = dealId;
    e.dataTransfer.effectAllowed = 'move';
    (e.currentTarget as HTMLElement).style.opacity = '0.5';
  };
  const handleDragEnd = (e: React.DragEvent) => { (e.currentTarget as HTMLElement).style.opacity = '1'; };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (dragId.current) { updateDealStage(dragId.current, stageId as Deal['stage']); dragId.current = null; }
  };

  const filtered = deals.filter(d => {
    const client = clients.find(c => c.id === d.clientId);
    return d.title.toLowerCase().includes(search.toLowerCase()) || client?.company.toLowerCase().includes(search.toLowerCase()) || client?.name.toLowerCase().includes(search.toLowerCase()) || false;
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
            <h1 className="text-2xl font-bold text-foreground">Сделки</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{deals.filter(d => !['won', 'lost'].includes(d.stage)).length} активных · {deals.filter(d => d.stage === 'won').reduce((s, d) => s + d.amount, 0).toLocaleString('ru-RU')} ₽ выиграно</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-white rounded-xl border border-border shadow-sm p-1">
              {([['kanban', 'Kanban', 'LayoutGrid'], ['list', 'Список', 'List']] as const).map(([id, label, icon]) => (
                <button key={id} onClick={() => setView(id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === id ? 'text-white shadow-sm' : 'text-muted-foreground'}`} style={view === id ? { background: 'hsl(244 80% 60%)' } : {}}>
                  <Icon name={icon} size={14} />{label}
                </button>
              ))}
            </div>
            <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all" style={{ background: 'hsl(244 80% 60%)', boxShadow: '0 4px 14px hsl(244 80% 60% / 0.3)' }}>
              <Icon name="Plus" size={16} />Новая сделка
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white rounded-xl border border-border shadow-sm w-full max-w-80">
          <Icon name="Search" size={16} className="text-muted-foreground" />
          <input className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-foreground" placeholder="Поиск сделок..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch('')}><Icon name="X" size={14} className="text-muted-foreground" /></button>}
        </div>

        {view === 'kanban' ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map(stage => {
              const stageDeals = filtered.filter(d => d.stage === stage.id);
              const total = stageDeals.reduce((s, d) => s + d.amount, 0);
              return (
                <div key={stage.id} className="flex-shrink-0 w-64" onDragOver={handleDragOver} onDrop={e => handleDrop(e, stage.id)}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
                      <span className="text-sm font-semibold text-foreground">{stage.label}</span>
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{stageDeals.length}</span>
                    </div>
                    {total > 0 && <span className="text-xs text-muted-foreground font-medium">{(total / 1000).toFixed(0)}K ₽</span>}
                  </div>
                  <div className="space-y-2.5 min-h-[60px] rounded-xl transition-colors p-1">
                    {stageDeals.map(deal => {
                      const client = clients.find(c => c.id === deal.clientId);
                      const manager = USERS.find(u => u.id === deal.managerId);
                      return (
                        <div key={deal.id} draggable
                          onDragStart={e => handleDragStart(e, deal.id)}
                          onDragEnd={handleDragEnd}
                          className="bg-white rounded-xl border border-border/60 p-4 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-0.5 transition-all"
                          onClick={() => setSelected(deal)}
                        >
                          <p className="text-sm font-semibold text-foreground mb-1 leading-snug">{deal.title}</p>
                          <p className="text-xs text-muted-foreground mb-3">{client?.company || client?.name}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-white" style={{ background: 'hsl(244 80% 60%)' }}>{manager?.avatar.slice(0, 1)}</div>
                              <span className="text-xs text-muted-foreground">{manager?.name.split(' ')[0]}</span>
                            </div>
                            <span className="text-sm font-bold text-foreground">{deal.amount > 0 ? `${(deal.amount / 1000).toFixed(0)}K ₽` : '—'}</span>
                          </div>
                        </div>
                      );
                    })}
                    <button onClick={() => setShowNew(true)} className="w-full rounded-xl border-2 border-dashed border-border p-3 text-center text-xs text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-1.5">
                      <Icon name="Plus" size={13} />Добавить сделку
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-border/50">{['Сделка', 'Клиент', 'Менеджер', 'Сумма', 'Этап', 'Дата'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map(deal => {
                  const client = clients.find(c => c.id === deal.clientId);
                  const manager = USERS.find(u => u.id === deal.managerId);
                  const stage = stages.find(s => s.id === deal.stage);
                  return (
                    <tr key={deal.id} className="hover:bg-secondary/30 transition-colors cursor-pointer" onClick={() => setSelected(deal)}>
                      <td className="px-4 py-3.5 text-sm font-semibold text-foreground">{deal.title}</td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">{client?.company || client?.name}</td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">{manager?.name.split(' ')[0]}</td>
                      <td className="px-4 py-3.5 text-sm font-bold text-foreground">{deal.amount > 0 ? `${deal.amount.toLocaleString('ru-RU')} ₽` : '—'}</td>
                      <td className="px-4 py-3.5"><span className={`status-badge ${stage?.badge}`}>{stage?.label}</span></td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">{new Date(deal.createdAt).toLocaleDateString('ru-RU')}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">Нет сделок</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && <DealModal deal={selected} onClose={() => setSelected(null)} onInvoice={d => { onOpenInvoice?.(d.id, d.clientId); }} />}
      {showNew && <NewDealModal onClose={() => setShowNew(false)} />}
    </>
  );
}
