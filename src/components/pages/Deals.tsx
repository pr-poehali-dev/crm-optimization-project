import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { USERS, type Deal, type Client, type Task } from '@/data/mock';
import { useStore, addClient, addDeal, addTask } from '@/data/store';

const stages = [
  { id: 'new', label: 'Новые', color: 'hsl(214 84% 56%)', bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
  { id: 'negotiation', label: 'Переговоры', color: 'hsl(38 95% 55%)', bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700' },
  { id: 'proposal', label: 'Предложение', color: 'hsl(244 80% 60%)', bg: 'bg-violet-50', badge: 'bg-violet-100 text-violet-700' },
  { id: 'won', label: 'Выиграны', color: 'hsl(158 64% 45%)', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
  { id: 'lost', label: 'Проиграны', color: 'hsl(350 80% 58%)', bg: 'bg-rose-50', badge: 'bg-rose-100 text-rose-700' },
];

// INN mock resolver — in production replace with dadata API
const INN_DB: Record<string, string> = {
  '7701234567': 'ООО «Технологии»',
  '7707083893': 'ПАО Сбербанк',
  '7736207543': 'ПАО Газпром',
  '5010051523': 'ООО «Яндекс»',
  '7704340310': 'ООО «ВКонтакте»',
  '771234567890': 'ИП Никитина',
  '7728168971': 'ООО «МТС»',
  '9999000001': 'ООО «Рога и Копыта»',
};

function resolveINN(inn: string): Promise<string | null> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(INN_DB[inn] || null);
    }, 600);
  });
}

// ─── Task sub-form ───────────────────────────────────────────────────────────
interface TaskFormData {
  title: string;
  description: string;
  assigneeId: string;
  priority: Task['priority'];
  dueDate: string;
  contactPhone: string;
  contactEmail: string;
}

function TaskSubForm({
  onSave,
  onCancel,
}: {
  onSave: (data: TaskFormData) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<TaskFormData>({
    title: '',
    description: '',
    assigneeId: USERS[1].id,
    priority: 'medium',
    dueDate: '',
    contactPhone: '',
    contactEmail: '',
  });

  const set = (k: keyof TaskFormData, v: string) => setForm(p => ({ ...p, [k]: v }));

  const priorityOpts: { id: Task['priority']; label: string; color: string }[] = [
    { id: 'low', label: 'Низкий', color: 'bg-slate-100 text-slate-600' },
    { id: 'medium', label: 'Средний', color: 'bg-amber-100 text-amber-700' },
    { id: 'high', label: 'Высокий', color: 'bg-rose-100 text-rose-700' },
  ];

  return (
    <div className="border-2 border-dashed border-violet-200 rounded-2xl p-5 bg-violet-50/40 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'hsl(244 80% 60%)' }}>
          <Icon name="CheckSquare" size={13} className="text-white" />
        </div>
        <span className="text-sm font-bold text-foreground">Новая задача</span>
        <button onClick={onCancel} className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
          <Icon name="X" size={16} />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="field-label">Название задачи *</label>
          <input
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="Позвонить, отправить КП, провести встречу..."
            className="crm-input"
          />
        </div>

        <div>
          <label className="field-label">Описание / комментарий</label>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Что нужно сделать, детали, важные моменты..."
            rows={2}
            className="crm-input resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Ответственный</label>
            <select value={form.assigneeId} onChange={e => set('assigneeId', e.target.value)} className="crm-input">
              {USERS.filter(u => u.isActive).map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Срок выполнения</label>
            <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} className="crm-input" />
          </div>
        </div>

        <div>
          <label className="field-label">Приоритет</label>
          <div className="flex gap-2">
            {priorityOpts.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => set('priority', p.id)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                  form.priority === p.id
                    ? `${p.color} border-current`
                    : 'border-transparent bg-secondary text-muted-foreground hover:bg-secondary/70'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Телефон для связи</label>
            <input
              value={form.contactPhone}
              onChange={e => set('contactPhone', e.target.value)}
              placeholder="+7 900 000 00 00"
              className="crm-input"
            />
          </div>
          <div>
            <label className="field-label">Email для связи</label>
            <input
              type="email"
              value={form.contactEmail}
              onChange={e => set('contactEmail', e.target.value)}
              placeholder="contact@email.ru"
              className="crm-input"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-secondary/50 transition-colors"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={() => form.title && onSave(form)}
            disabled={!form.title}
            className="flex-1 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: 'hsl(244 80% 60%)' }}
          >
            Добавить задачу
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── New Deal Modal ──────────────────────────────────────────────────────────
interface NewDealModalProps {
  onClose: () => void;
  onCreated: () => void;
}

function NewDealModal({ onClose, onCreated }: NewDealModalProps) {
  const [step, setStep] = useState<'client' | 'deal'>('client');

  // Client fields
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientInn, setClientInn] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [innLoading, setInnLoading] = useState(false);
  const [innResolved, setInnResolved] = useState(false);
  const innTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Deal fields
  const [dealTitle, setDealTitle] = useState('');
  const [dealAmount, setDealAmount] = useState('');
  const [dealStage, setDealStage] = useState<Deal['stage']>('new');
  const [dealManagerId, setDealManagerId] = useState(USERS[1].id);
  const [dealComment, setDealComment] = useState('');

  // Task
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [pendingTask, setPendingTask] = useState<TaskFormData | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // INN lookup
  useEffect(() => {
    if (clientInn.length < 10) {
      setInnResolved(false);
      return;
    }
    setInnLoading(true);
    clearTimeout(innTimeout.current);
    innTimeout.current = setTimeout(async () => {
      const company = await resolveINN(clientInn);
      setInnLoading(false);
      if (company) {
        setClientCompany(company);
        setInnResolved(true);
      } else {
        setInnResolved(false);
      }
    }, 400);
  }, [clientInn]);

  const validateClient = () => {
    const e: Record<string, string> = {};
    if (!clientName.trim()) e.clientName = 'Введите имя';
    if (!clientPhone.trim()) e.clientPhone = 'Введите телефон';
    if (!clientEmail.trim()) e.clientEmail = 'Введите email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateDeal = () => {
    const e: Record<string, string> = {};
    if (!dealTitle.trim()) e.dealTitle = 'Введите название сделки';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goToDeal = () => {
    if (validateClient()) setStep('deal');
  };

  const handleSave = () => {
    if (!validateDeal()) return;
    setSaving(true);

    setTimeout(() => {
      const newClientId = `c${Date.now()}`;
      const newDealId = `d${Date.now()}`;

      const newClient: Client = {
        id: newClientId,
        name: clientName,
        company: clientCompany || 'Не указана',
        email: clientEmail,
        phone: clientPhone,
        status: 'lead',
        managerId: dealManagerId,
        createdAt: new Date().toISOString().split('T')[0],
        tags: ['Новый'],
        inn: clientInn || undefined,
      };

      const newDeal: Deal = {
        id: newDealId,
        title: dealTitle,
        clientId: newClientId,
        managerId: dealManagerId,
        stage: dealStage,
        amount: parseInt(dealAmount.replace(/\D/g, '')) || 0,
        createdAt: new Date().toISOString().split('T')[0],
        notes: dealComment || undefined,
      };

      addClient(newClient);
      addDeal(newDeal);

      if (pendingTask) {
        const newTask: Task = {
          id: `t${Date.now()}`,
          title: pendingTask.title,
          description: pendingTask.description || undefined,
          assigneeId: pendingTask.assigneeId,
          clientId: newClientId,
          dealId: newDealId,
          priority: pendingTask.priority,
          status: 'todo',
          dueDate: pendingTask.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          createdAt: new Date().toISOString().split('T')[0],
        };
        addTask(newTask);
      }

      setSaving(false);
      setSuccess(true);
      setTimeout(() => {
        onCreated();
        onClose();
      }, 900);
    }, 600);
  };

  const formatAmount = (v: string) => {
    const num = v.replace(/\D/g, '');
    return num ? parseInt(num).toLocaleString('ru-RU') : '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in flex flex-col"
        style={{ maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'hsl(244 80% 60%)' }}>
                <Icon name="Plus" size={18} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-foreground text-lg leading-tight">Новая сделка</h2>
                <p className="text-xs text-muted-foreground">Клиент будет добавлен в базу автоматически</p>
              </div>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="X" size={20} />
            </button>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-1">
            {[
              { id: 'client', label: 'Клиент', icon: 'User' },
              { id: 'deal', label: 'Сделка', icon: 'Handshake' },
            ].map((s, idx) => (
              <div key={s.id} className="flex items-center gap-1 flex-1">
                <button
                  onClick={() => s.id === 'client' && setStep('client')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex-1 justify-center ${
                    step === s.id
                      ? 'text-white'
                      : step === 'deal' && s.id === 'client'
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-muted-foreground bg-secondary'
                  }`}
                  style={step === s.id ? { background: 'hsl(244 80% 60%)' } : {}}
                >
                  <Icon name={step === 'deal' && s.id === 'client' ? 'CheckCircle' : s.icon} size={12} />
                  {s.label}
                </button>
                {idx < 1 && <Icon name="ChevronRight" size={14} className="text-muted-foreground flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">

          {/* ── STEP 1: CLIENT ── */}
          {step === 'client' && (
            <div className="space-y-3 animate-fade-in">
              <div>
                <label className="field-label">ИНН организации</label>
                <div className="relative">
                  <input
                    value={clientInn}
                    onChange={e => setClientInn(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    placeholder="7701234567 — подтянем название"
                    className="crm-input pr-10"
                  />
                  {innLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                  )}
                  {innResolved && !innLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Icon name="CheckCircle" size={16} className="text-emerald-500" />
                    </div>
                  )}
                </div>
                {innResolved && (
                  <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                    <Icon name="Building2" size={11} />
                    Найдено: <b>{clientCompany}</b>
                  </p>
                )}
              </div>

              <div>
                <label className="field-label">Название компании / организации</label>
                <input
                  value={clientCompany}
                  onChange={e => setClientCompany(e.target.value)}
                  placeholder="ООО «Компания», ИП Иванов..."
                  className="crm-input"
                />
              </div>

              <div>
                <label className="field-label">Контактное лицо *</label>
                <input
                  value={clientName}
                  onChange={e => { setClientName(e.target.value); setErrors(p => ({ ...p, clientName: '' })); }}
                  placeholder="Иван Петров"
                  className={`crm-input ${errors.clientName ? 'border-rose-400 focus:ring-rose-300' : ''}`}
                />
                {errors.clientName && <p className="text-xs text-rose-500 mt-1">{errors.clientName}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Телефон *</label>
                  <input
                    value={clientPhone}
                    onChange={e => { setClientPhone(e.target.value); setErrors(p => ({ ...p, clientPhone: '' })); }}
                    placeholder="+7 900 000 00 00"
                    className={`crm-input ${errors.clientPhone ? 'border-rose-400' : ''}`}
                  />
                  {errors.clientPhone && <p className="text-xs text-rose-500 mt-1">{errors.clientPhone}</p>}
                </div>
                <div>
                  <label className="field-label">Email *</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={e => { setClientEmail(e.target.value); setErrors(p => ({ ...p, clientEmail: '' })); }}
                    placeholder="ivan@company.ru"
                    className={`crm-input ${errors.clientEmail ? 'border-rose-400' : ''}`}
                  />
                  {errors.clientEmail && <p className="text-xs text-rose-500 mt-1">{errors.clientEmail}</p>}
                </div>
              </div>

              <button
                onClick={goToDeal}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm mt-2 transition-all hover:opacity-90"
                style={{ background: 'hsl(244 80% 60%)' }}
              >
                Далее — заполнить сделку
                <Icon name="ArrowRight" size={15} className="inline ml-1.5" />
              </button>
            </div>
          )}

          {/* ── STEP 2: DEAL ── */}
          {step === 'deal' && (
            <div className="space-y-3 animate-fade-in">
              {/* Client summary */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ background: 'hsl(158 64% 45%)' }}>
                  {clientName.split(' ').map(w => w[0]).join('').slice(0, 2) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{clientName}</p>
                  <p className="text-xs text-muted-foreground truncate">{clientCompany || clientEmail}</p>
                </div>
                <Icon name="CheckCircle" size={16} className="text-emerald-500 flex-shrink-0" />
              </div>

              <div>
                <label className="field-label">Название сделки *</label>
                <input
                  value={dealTitle}
                  onChange={e => { setDealTitle(e.target.value); setErrors(p => ({ ...p, dealTitle: '' })); }}
                  placeholder="Разработка сайта, Поставка оборудования..."
                  className={`crm-input ${errors.dealTitle ? 'border-rose-400' : ''}`}
                />
                {errors.dealTitle && <p className="text-xs text-rose-500 mt-1">{errors.dealTitle}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Сумма сделки</label>
                  <div className="relative">
                    <input
                      value={dealAmount}
                      onChange={e => setDealAmount(formatAmount(e.target.value))}
                      placeholder="0"
                      className="crm-input pr-6"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">₽</span>
                  </div>
                </div>
                <div>
                  <label className="field-label">Ответственный</label>
                  <select value={dealManagerId} onChange={e => setDealManagerId(e.target.value)} className="crm-input">
                    {USERS.filter(u => u.isActive && ['admin', 'sales'].includes(u.role)).map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stage picker */}
              <div>
                <label className="field-label">Этап воронки</label>
                <div className="flex gap-1.5 flex-wrap">
                  {stages.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setDealStage(s.id as Deal['stage'])}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                        dealStage === s.id ? `${s.badge} border-current` : 'border-transparent bg-secondary text-muted-foreground hover:bg-secondary/70'
                      }`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: dealStage === s.id ? s.color : 'currentColor' }} />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="field-label">Комментарий к сделке</label>
                <textarea
                  value={dealComment}
                  onChange={e => setDealComment(e.target.value)}
                  placeholder="Что обсудили, откуда пришёл клиент, особенности..."
                  rows={3}
                  className="crm-input resize-none"
                />
              </div>

              {/* Task section */}
              {!showTaskForm && !pendingTask && (
                <button
                  type="button"
                  onClick={() => setShowTaskForm(true)}
                  className="w-full flex items-center gap-2 py-2.5 px-4 rounded-xl border-2 border-dashed border-violet-200 text-sm font-medium text-violet-600 hover:bg-violet-50 hover:border-violet-300 transition-all"
                >
                  <Icon name="Plus" size={16} />
                  Поставить задачу по этой сделке
                </button>
              )}

              {showTaskForm && (
                <TaskSubForm
                  onSave={data => {
                    setPendingTask(data);
                    setShowTaskForm(false);
                  }}
                  onCancel={() => setShowTaskForm(false)}
                />
              )}

              {pendingTask && !showTaskForm && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-50 border border-violet-100">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'hsl(244 80% 60%)' }}>
                    <Icon name="CheckSquare" size={13} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{pendingTask.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {USERS.find(u => u.id === pendingTask.assigneeId)?.name.split(' ')[0]} ·{' '}
                      {pendingTask.priority === 'high' ? 'Высокий' : pendingTask.priority === 'medium' ? 'Средний' : 'Низкий'} приоритет
                    </p>
                  </div>
                  <button
                    onClick={() => setPendingTask(null)}
                    className="text-muted-foreground hover:text-rose-500 transition-colors flex-shrink-0"
                  >
                    <Icon name="X" size={15} />
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('client')}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-secondary/50 transition-colors"
                >
                  <Icon name="ArrowLeft" size={14} />
                  Назад
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || success}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-70"
                  style={{ background: success ? 'hsl(158 64% 45%)' : 'hsl(244 80% 60%)' }}
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Сохраняем...
                    </>
                  ) : success ? (
                    <>
                      <Icon name="CheckCircle" size={16} />
                      Создано!
                    </>
                  ) : (
                    <>
                      <Icon name="Zap" size={15} />
                      Создать сделку{pendingTask ? ' + задачу' : ''}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Deal Card Modal ─────────────────────────────────────────────────────────
function DealModal({ deal, onClose }: { deal: Deal; onClose: () => void }) {
  const { clients, tasks } = useStore();
  const client = clients.find(c => c.id === deal.clientId);
  const manager = USERS.find(u => u.id === deal.managerId);
  const stage = stages.find(s => s.id === deal.stage);
  const dealTasks = tasks.filter(t => t.dealId === deal.id);

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
            { icon: 'Phone', label: 'Телефон', value: client?.phone },
            { icon: 'Mail', label: 'Email', value: client?.email },
            { icon: 'UserCircle', label: 'Менеджер', value: manager?.name },
            { icon: 'Calendar', label: 'Создана', value: new Date(deal.createdAt).toLocaleDateString('ru-RU') },
          ].map(row => (
            <div key={row.label} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
              <Icon name={row.icon} size={15} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground w-16">{row.label}</span>
              <span className="text-sm font-medium text-foreground">{row.value || '—'}</span>
            </div>
          ))}
        </div>

        {deal.notes && (
          <div className="mt-3 p-3 rounded-xl bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Комментарий</p>
            <p className="text-sm text-foreground">{deal.notes}</p>
          </div>
        )}

        {dealTasks.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Задачи по сделке</p>
            <div className="space-y-1.5">
              {dealTasks.map(t => (
                <div key={t.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-violet-50 border border-violet-100 text-sm">
                  <Icon name="CheckSquare" size={13} className="text-violet-500 flex-shrink-0" />
                  <span className="font-medium text-foreground truncate">{t.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground flex-shrink-0">
                    {USERS.find(u => u.id === t.assigneeId)?.name.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
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

// ─── Main component ──────────────────────────────────────────────────────────
export default function Deals() {
  const { deals, clients } = useStore();
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [selected, setSelected] = useState<Deal | null>(null);
  const [showNew, setShowNew] = useState(false);

  const filtered = deals.filter(d => {
    const client = clients.find(c => c.id === d.clientId);
    return (
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      client?.company.toLowerCase().includes(search.toLowerCase()) ||
      client?.name.toLowerCase().includes(search.toLowerCase()) || false
    );
  });

  return (
    <>
      <style>{`
        .field-label { display: block; font-size: 0.7rem; font-weight: 600; color: hsl(var(--muted-foreground)); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.35rem; }
        .crm-input { width: 100%; padding: 0.6rem 0.75rem; border-radius: 0.75rem; border: 1.5px solid hsl(var(--border)); font-size: 0.875rem; outline: none; transition: all 0.15s; background: white; color: hsl(var(--foreground)); }
        .crm-input:focus { border-color: hsl(244 80% 60%); box-shadow: 0 0 0 3px hsl(244 80% 60% / 0.12); }
        select.crm-input { cursor: pointer; }
      `}</style>

      <div className="p-6 space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Сделки</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {deals.filter(d => !['won', 'lost'].includes(d.stage)).length} активных ·{' '}
              {deals.filter(d => d.stage === 'won').reduce((s, d) => s + d.amount, 0).toLocaleString('ru-RU')} ₽ выиграно
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
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all shadow-md"
              style={{ background: 'hsl(244 80% 60%)', boxShadow: '0 4px 14px hsl(244 80% 60% / 0.3)' }}
            >
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
          {search && (
            <button onClick={() => setSearch('')}><Icon name="X" size={14} className="text-muted-foreground" /></button>
          )}
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
                    {total > 0 && <span className="text-xs text-muted-foreground font-medium">{(total / 1000).toFixed(0)}K ₽</span>}
                  </div>
                  <div className="space-y-2.5">
                    {stageDeals.map(deal => {
                      const client = clients.find(c => c.id === deal.clientId);
                      const manager = USERS.find(u => u.id === deal.managerId);
                      return (
                        <div key={deal.id} className="bg-white rounded-xl border border-border/60 p-4 card-hover shadow-sm"
                          onClick={() => setSelected(deal)}>
                          <p className="text-sm font-semibold text-foreground mb-1 leading-snug">{deal.title}</p>
                          <p className="text-xs text-muted-foreground mb-3">{client?.company || client?.name}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-white"
                                style={{ background: 'hsl(244 80% 60%)' }}>
                                {manager?.avatar.slice(0, 1)}
                              </div>
                              <span className="text-xs text-muted-foreground">{manager?.name.split(' ')[0]}</span>
                            </div>
                            <span className="text-sm font-bold text-foreground">
                              {deal.amount > 0 ? `${(deal.amount / 1000).toFixed(0)}K ₽` : '—'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <button
                      onClick={() => setShowNew(true)}
                      className="w-full rounded-xl border-2 border-dashed border-border p-3 text-center text-xs text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Icon name="Plus" size={13} />
                      Добавить сделку
                    </button>
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
                  const client = clients.find(c => c.id === deal.clientId);
                  const manager = USERS.find(u => u.id === deal.managerId);
                  const stage = stages.find(s => s.id === deal.stage);
                  return (
                    <tr key={deal.id} className="hover:bg-secondary/30 transition-colors cursor-pointer" onClick={() => setSelected(deal)}>
                      <td className="px-4 py-3.5 text-sm font-semibold text-foreground">{deal.title}</td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">{client?.company || client?.name}</td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">{manager?.name.split(' ')[0]}</td>
                      <td className="px-4 py-3.5 text-sm font-bold text-foreground">
                        {deal.amount > 0 ? `${deal.amount.toLocaleString('ru-RU')} ₽` : '—'}
                      </td>
                      <td className="px-4 py-3.5"><span className={`status-badge ${stage?.badge}`}>{stage?.label}</span></td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">{new Date(deal.createdAt).toLocaleDateString('ru-RU')}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">Сделки не найдены</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && <DealModal deal={selected} onClose={() => setSelected(null)} />}
      {showNew && <NewDealModal onClose={() => setShowNew(false)} onCreated={() => {}} />}
    </>
  );
}
