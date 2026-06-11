import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { USERS, ROLE_LABELS, type User } from '@/data/mock';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    const user = USERS.find(u => u.email === email && u.isActive);
    if (user) {
      onLogin(user);
    } else {
      setError('Неверный email или пользователь неактивен');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'hsl(220 25% 8%)' }}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, hsl(244 80% 60%), transparent)' }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, hsl(188 85% 45%), transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, hsl(244 80% 60%), transparent)' }} />
      </div>

      <div className="w-full max-w-sm relative animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-2xl"
            style={{ background: 'hsl(244 80% 60%)', boxShadow: '0 8px 32px hsl(244 80% 60% / 0.4)' }}>
            <Icon name="Zap" size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">1C Matrix</h1>
          <p className="text-white/40 text-sm mt-1">Система управления продажами</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-white font-semibold text-lg mb-5">Вход в систему</h2>

          <div className="space-y-3 mb-5">
            <div>
              <label className="text-xs font-medium text-white/50 block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="example@company.ru"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-white/50 block mb-1.5">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 mb-4">
              <Icon name="AlertCircle" size={14} className="text-rose-400 flex-shrink-0" />
              <p className="text-rose-400 text-xs">{error}</p>
            </div>
          )}

          <button onClick={handleLogin}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 hover:shadow-lg mb-4"
            style={{ background: 'hsl(244 80% 60%)', boxShadow: '0 4px 16px hsl(244 80% 60% / 0.3)' }}>
            Войти
          </button>

          {/* Quick login */}
          <div>
            <p className="text-xs text-white/30 text-center mb-3">Быстрый вход (демо)</p>
            <div className="space-y-2">
              {USERS.filter(u => u.isActive).slice(0, 3).map(user => (
                <button key={user.id} onClick={() => onLogin(user)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-white/10"
                  style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'hsl(244 80% 60%)' }}>
                    {user.avatar}
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-white text-xs font-semibold">{user.name}</p>
                    <p className="text-white/30 text-xs">{ROLE_LABELS[user.role]}</p>
                  </div>
                  <Icon name="ArrowRight" size={14} className="text-white/20" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}