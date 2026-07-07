import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { useStore } from '@/data/store';

export default function ClientPicker({
  clientId,
  onChange,
  placeholder = 'Имя, компания, телефон или ИНН...',
}: {
  clientId: string;
  onChange: (id: string) => void;
  placeholder?: string;
}) {
  const { clients } = useStore();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const selected = clients.find(c => c.id === clientId);

  const results = clients.filter(c => {
    const q = query.toLowerCase().trim();
    const qDigits = query.replace(/\D/g, '');
    if (!q) return true;
    return c.name.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      (qDigits.length > 2 && c.phone.replace(/\D/g, '').includes(qDigits)) ||
      (qDigits.length > 2 && (c.inn || '').includes(qDigits));
  }).slice(0, 6);

  if (selected && !open) {
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-secondary/60 text-sm">
        <Icon name="User" size={14} className="text-muted-foreground flex-shrink-0" />
        <span className="flex-1 truncate min-w-0">
          <b className="text-foreground">{selected.name}</b> · {selected.company}
          {selected.inn && <span className="text-muted-foreground"> · ИНН {selected.inn}</span>}
        </span>
        <button type="button" onClick={() => { onChange(''); setQuery(''); setOpen(true); }} className="text-muted-foreground hover:text-foreground flex-shrink-0">
          <Icon name="X" size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className="crm-input"
      />
      {open && (
        <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {results.length === 0 && <div className="p-3 text-xs text-muted-foreground text-center">Ничего не найдено</div>}
          {results.map(c => (
            <button
              key={c.id}
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => { onChange(c.id); setQuery(''); setOpen(false); }}
              className="w-full text-left px-3 py-2 hover:bg-secondary/60 transition-colors border-b border-border/40 last:border-0"
            >
              <div className="text-sm font-medium text-foreground">{c.name}</div>
              <div className="text-xs text-muted-foreground">{c.company} · {c.phone}{c.inn ? ` · ИНН ${c.inn}` : ''}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
