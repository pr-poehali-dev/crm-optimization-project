import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { ROLE_LABELS, ROLE_PERMISSIONS, type Role, type User, type SelfEmployedInfo } from '@/data/mock';
import { useStore, inviteUser, updateUser, updateSelfEmployed } from '@/data/store';

const roleColors: Record<Role, { badge: string; dot: string; accent: string }> = {
  admin: { badge: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500', accent: 'hsl(244 80% 60%)' },
  sales: { badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', accent: 'hsl(158 64% 45%)' },
  support: { badge: 'bg-cyan-100 text-cyan-700', dot: 'bg-cyan-500', accent: 'hsl(188 85% 45%)' },
};

function UserModal({ user, onClose }: { user: User; onClose: () => void }) {
  const [role, setRole] = useState<Role>(user.role);
  const [isActive, setIsActive] = useState(user.isActive);
  const roles: Role[] = ['admin', 'sales', 'support'];

  const handleSave = () => {
    updateUser(user.id, { role, isActive });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ background: roleColors[user.role].accent }}>
              {user.avatar}
            </div>
            <div>
              <h2 className="font-bold text-foreground text-lg">{user.name}</h2>
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="mb-5">
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Роль</p>
          <div className="space-y-2">
            {roles.map(r => (
              <button key={r} onClick={() => setRole(r)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${role === r ? 'border-primary bg-primary/5' : 'border-border hover:border-border-600'}`}>
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${roleColors[r].dot}`} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{ROLE_LABELS[r]}</p>
                  <p className="text-xs text-muted-foreground">{ROLE_PERMISSIONS[r].slice(0, 2).join(', ')}</p>
                </div>
                {role === r && <Icon name="Check" size={16} className="text-primary flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/50 mb-5">
          <div className="flex items-center gap-2">
            <Icon name="Power" size={16} className={isActive ? 'text-emerald-600' : 'text-muted-foreground'} />
            <span className="text-sm font-medium text-foreground">Аккаунт активен</span>
          </div>
          <button onClick={() => setIsActive(!isActive)}
            className={`w-11 h-6 rounded-full transition-all relative ${isActive ? 'bg-emerald-500' : 'bg-secondary border border-border'}`}>
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${isActive ? 'left-5' : 'left-0.5'}`} />
          </button>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary/50 transition-colors">
            Отмена
          </button>
          <button className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
            style={{ background: 'hsl(244 80% 60%)' }} onClick={handleSave}>
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

function InviteModal({ onClose }: { onClose: () => void }) {
  const [role, setRole] = useState<Role>('sales');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [err, setErr] = useState('');
  const [sent, setSent] = useState(false);

  const handleInvite = () => {
    if (!name.trim() || !email.trim()) { setErr('Заполните имя и email'); return; }
    inviteUser({ name, email, role, phone: phone || undefined });
    setSent(true);
    setTimeout(onClose, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-foreground text-lg">Пригласить сотрудника</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="space-y-3 mb-5">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Имя *</label>
            <input value={name} onChange={e => { setName(e.target.value); setErr(''); }} placeholder="Иван Петров"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Email *</label>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErr(''); }} placeholder="ivan@company.ru"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Телефон</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 900 000 00 00"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Роль</label>
            <div className="grid grid-cols-3 gap-2">
              {(['admin', 'sales', 'support'] as Role[]).map(r => (
                <button key={r} onClick={() => setRole(r)}
                  className={`py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-all ${role === r ? 'border-primary text-primary bg-primary/5' : 'border-border text-muted-foreground hover:border-muted-foreground'}`}>
                  {ROLE_LABELS[r].split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
          {err && <p className="text-xs text-rose-500">{err}</p>}
        </div>

        <div className="p-3 rounded-xl bg-secondary/50 mb-5">
          <p className="text-xs font-semibold text-muted-foreground mb-1.5">Права: {ROLE_LABELS[role]}</p>
          <div className="flex flex-wrap gap-1.5">
            {ROLE_PERMISSIONS[role].map(p => (
              <span key={p} className="text-xs px-2 py-0.5 rounded-full bg-white border border-border text-foreground">{p}</span>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary/50 transition-colors">
            Отмена
          </button>
          <button onClick={handleInvite} disabled={sent} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-60"
            style={{ background: sent ? 'hsl(158 64% 45%)' : 'hsl(244 80% 60%)' }}>
            {sent ? <><Icon name="Check" size={15} />Приглашён!</> : <><Icon name="Send" size={15} />Отправить приглашение</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function SelfEmployedSettings() {
  const { selfEmployed } = useStore();
  const [form, setForm] = useState<SelfEmployedInfo>(selfEmployed);
  const [saved, setSaved] = useState(false);

  const set = (k: keyof SelfEmployedInfo, v: string) => { setForm(p => ({ ...p, [k]: v })); setSaved(false); };

  const handleSave = () => {
    updateSelfEmployed(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'hsl(244 80% 60%)' }}>
          <Icon name="Landmark" size={16} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-sm">Реквизиты для счетов</h3>
          <p className="text-xs text-muted-foreground">Подтягиваются автоматически во все выставляемые счета</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {([
          ['fullName', 'ФИО'], ['inn', 'ИНН'], ['phone', 'Телефон'],
          ['bankName', 'Банк'], ['bik', 'БИК'], ['account', 'Расчётный счёт'], ['corrAccount', 'Корр. счёт'],
        ] as [keyof SelfEmployedInfo, string][]).map(([k, label]) => (
          <div key={k}>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">{label}</label>
            <input value={form[k]} onChange={e => set(k, e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        ))}
      </div>
      <button onClick={handleSave} className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all" style={{ background: saved ? 'hsl(158 64% 45%)' : 'hsl(244 80% 60%)' }}>
        {saved ? <><Icon name="Check" size={15} />Сохранено</> : <><Icon name="Save" size={15} />Сохранить реквизиты</>}
      </button>
    </div>
  );
}

export default function Roles() {
  const { users } = useStore();
  const [selected, setSelected] = useState<User | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filtered = users.filter(u => roleFilter === 'all' || u.role === roleFilter);

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Роли и права</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{users.length} сотрудников · {users.filter(u => u.isActive).length} активных</p>
        </div>
        <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
          style={{ background: 'hsl(244 80% 60%)' }}>
          <Icon name="UserPlus" size={16} />
          Пригласить
        </button>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-3 gap-4">
        {(['admin', 'sales', 'support'] as Role[]).map(r => {
          const count = users.filter(u => u.role === r).length;
          return (
            <div key={r} className="bg-white rounded-2xl border border-border/50 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${roleColors[r].dot}`} />
                <span className="text-sm font-bold text-foreground">{ROLE_LABELS[r]}</span>
                <span className="ml-auto text-2xl font-bold text-foreground">{count}</span>
              </div>
              <div className="space-y-1.5">
                {ROLE_PERMISSIONS[r].map(p => (
                  <div key={p} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon name="Check" size={12} className="text-emerald-500 flex-shrink-0" />
                    {p}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 bg-white rounded-xl border border-border shadow-sm p-1 w-fit">
        {[['all', 'Все'], ['admin', 'Администраторы'], ['sales', 'Продажи'], ['support', 'Поддержка']].map(([val, label]) => (
          <button key={val} onClick={() => setRoleFilter(val)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${roleFilter === val ? 'text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            style={roleFilter === val ? { background: 'hsl(244 80% 60%)' } : {}}>
            {label}
          </button>
        ))}
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              {['Сотрудник', 'Роль', 'Email', 'Телефон', 'Добавлен', 'Статус', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {filtered.map(user => (
              <tr key={user.id} className="hover:bg-secondary/30 transition-colors cursor-pointer group" onClick={() => setSelected(user)}>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: roleColors[user.role].accent }}>
                      {user.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{user.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`status-badge ${roleColors[user.role].badge}`}>{ROLE_LABELS[user.role]}</span>
                </td>
                <td className="px-4 py-3.5 text-sm text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3.5 text-sm text-muted-foreground">{user.phone || '—'}</td>
                <td className="px-4 py-3.5 text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleDateString('ru-RU')}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className={`text-xs font-medium ${user.isActive ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                      {user.isActive ? 'Активен' : 'Неактивен'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <Icon name="Settings" size={15} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SelfEmployedSettings />

      {selected && <UserModal user={selected} onClose={() => setSelected(null)} />}
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
    </div>
  );
}
