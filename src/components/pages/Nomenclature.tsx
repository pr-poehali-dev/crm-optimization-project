import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { type NomenclatureItem } from '@/data/mock';
import { useStore, addNomenclatureItem, updateNomenclatureItem, removeNomenclatureItem } from '@/data/store';

function ItemModal({ item, onClose }: { item?: NomenclatureItem; onClose: () => void }) {
  const [name, setName] = useState(item?.name ?? '');
  const [unit, setUnit] = useState(item?.unit ?? 'шт.');
  const [price, setPrice] = useState(item?.price ? String(item.price) : '');
  const [err, setErr] = useState('');

  const handleSave = () => {
    if (!name.trim()) { setErr('Введите название'); return; }
    if (item) {
      updateNomenclatureItem(item.id, { name, unit, price: +price || 0 });
    } else {
      addNomenclatureItem({ id: `n${Date.now()}`, name, unit, price: +price || 0 });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-foreground text-lg">{item ? 'Изменить позицию' : 'Новая позиция'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><Icon name="X" size={20} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="field-label">Название *</label>
            <input value={name} onChange={e => { setName(e.target.value); setErr(''); }} placeholder="Внедрение CRM — базовый пакет" className={`crm-input ${err ? 'border-rose-400' : ''}`} autoFocus />
            {err && <p className="text-xs text-rose-500 mt-1">{err}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Единица</label>
              <select value={unit} onChange={e => setUnit(e.target.value)} className="crm-input">
                {['шт.', 'час', 'мес.', 'услуга', 'комплект'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Цена, ₽</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0" className="crm-input" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary/50 transition-colors">Отмена</button>
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90" style={{ background: 'hsl(244 80% 60%)' }}>
            {item ? 'Сохранить' : 'Добавить'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Nomenclature() {
  const { nomenclature } = useStore();
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState<NomenclatureItem | null>(null);

  const filtered = nomenclature.filter(n => n.name.toLowerCase().includes(search.toLowerCase()));

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
            <h1 className="text-2xl font-bold text-foreground">Номенклатура</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{nomenclature.length} позиций для счетов</p>
          </div>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all" style={{ background: 'hsl(244 80% 60%)', boxShadow: '0 4px 14px hsl(244 80% 60% / 0.3)' }}>
            <Icon name="Plus" size={16} />Добавить позицию
          </button>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white rounded-xl border border-border shadow-sm w-full max-w-80">
          <Icon name="Search" size={16} className="text-muted-foreground" />
          <input className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-foreground" placeholder="Поиск позиции..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch('')}><Icon name="X" size={14} className="text-muted-foreground" /></button>}
        </div>

        <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-border/50">{['Наименование', 'Единица', 'Цена', ''].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-secondary/30 transition-colors group">
                  <td className="px-4 py-3.5 text-sm font-semibold text-foreground">{item.name}</td>
                  <td className="px-4 py-3.5 text-sm text-muted-foreground">{item.unit}</td>
                  <td className="px-4 py-3.5 text-sm font-bold text-foreground">{item.price.toLocaleString('ru-RU')} ₽</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditing(item)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><Icon name="Pencil" size={14} className="text-muted-foreground" /></button>
                      <button onClick={() => removeNomenclatureItem(item.id)} className="p-1.5 rounded-lg hover:bg-rose-50 transition-colors"><Icon name="Trash2" size={14} className="text-rose-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={4} className="text-center py-10 text-muted-foreground text-sm">Нет позиций</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showNew && <ItemModal onClose={() => setShowNew(false)} />}
      {editing && <ItemModal item={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
