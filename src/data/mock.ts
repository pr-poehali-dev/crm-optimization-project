export type Role = 'admin' | 'sales' | 'support';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  phone?: string;
  createdAt: string;
  isActive: boolean;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'active' | 'lead' | 'inactive';
  managerId: string;
  createdAt: string;
  tags: string[];
  inn?: string;
}

export interface Deal {
  id: string;
  title: string;
  clientId: string;
  managerId: string;
  stage: 'new' | 'negotiation' | 'proposal' | 'won' | 'lost';
  amount: number;
  createdAt: string;
  closedAt?: string;
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigneeId: string;
  clientId?: string;
  dealId?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  dueDate: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  dealId: string;
  managerId: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  createdAt: string;
  dueDate: string;
  items: InvoiceItem[];
  selfEmployed: SelfEmployedInfo;
}

export interface InvoiceItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  unit?: string;
}

export interface SelfEmployedInfo {
  fullName: string;
  inn: string;
  bankName: string;
  bik: string;
  account: string;
  corrAccount: string;
  phone: string;
}

export interface NomenclatureItem {
  id: string;
  name: string;
  unit: string;
  price: number;
}

export const USERS: User[] = [
  { id: 'u1', name: 'Алексей Громов', email: 'admin@company.ru', role: 'admin', avatar: 'АГ', phone: '+7 999 111 22 33', createdAt: '2024-01-10', isActive: true },
  { id: 'u2', name: 'Мария Соколова', email: 'maria@company.ru', role: 'sales', avatar: 'МС', phone: '+7 999 222 33 44', createdAt: '2024-02-15', isActive: true },
  { id: 'u3', name: 'Дмитрий Лебедев', email: 'dima@company.ru', role: 'sales', avatar: 'ДЛ', phone: '+7 999 333 44 55', createdAt: '2024-03-01', isActive: true },
  { id: 'u4', name: 'Анна Петрова', email: 'anna@company.ru', role: 'support', avatar: 'АП', phone: '+7 999 444 55 66', createdAt: '2024-03-20', isActive: true },
  { id: 'u5', name: 'Игорь Волков', email: 'igor@company.ru', role: 'support', avatar: 'ИВ', phone: '+7 999 555 66 77', createdAt: '2024-04-05', isActive: false },
];

export const CLIENTS: Client[] = [
  { id: 'c1', name: 'Сергей Иванов', company: 'ООО Технологии', email: 'ivanov@tech.ru', phone: '+7 916 100 20 30', status: 'active', managerId: 'u2', createdAt: '2024-01-20', tags: ['VIP', 'B2B'], inn: '7701234567' },
  { id: 'c2', name: 'Елена Никитина', company: 'ИП Никитина', email: 'nikitina@mail.ru', phone: '+7 916 200 30 40', status: 'active', managerId: 'u2', createdAt: '2024-02-05', tags: ['B2C'], inn: '771234567890' },
  { id: 'c3', name: 'Андрей Смирнов', company: 'Smarts LLC', email: 'smirnov@smarts.com', phone: '+7 916 300 40 50', status: 'lead', managerId: 'u3', createdAt: '2024-03-10', tags: ['Новый', 'Enterprise'] },
  { id: 'c4', name: 'Татьяна Орлова', company: 'Орёл и партнёры', email: 'orlova@orel.ru', phone: '+7 916 400 50 60', status: 'active', managerId: 'u3', createdAt: '2024-03-25', tags: ['B2B'] },
  { id: 'c5', name: 'Константин Фёдоров', company: 'ФедСтрой', email: 'fedorov@fedstroy.ru', phone: '+7 916 500 60 70', status: 'inactive', managerId: 'u2', createdAt: '2024-04-01', tags: ['Старый'] },
  { id: 'c6', name: 'Юлия Белова', company: 'Digital Wave', email: 'belova@dwave.ru', phone: '+7 916 600 70 80', status: 'lead', managerId: 'u3', createdAt: '2024-05-10', tags: ['Новый', 'B2B'] },
];

export const DEALS: Deal[] = [
  { id: 'd1', title: 'Внедрение CRM системы', clientId: 'c1', managerId: 'u2', stage: 'won', amount: 350000, createdAt: '2024-02-01', closedAt: '2024-03-15', notes: 'Успешно завершена поставка' },
  { id: 'd2', title: 'Разработка мобильного приложения', clientId: 'c1', managerId: 'u2', stage: 'proposal', amount: 800000, createdAt: '2024-04-10' },
  { id: 'd3', title: 'SEO продвижение', clientId: 'c2', managerId: 'u2', stage: 'negotiation', amount: 120000, createdAt: '2024-03-20' },
  { id: 'd4', title: 'Корпоративный портал', clientId: 'c3', managerId: 'u3', stage: 'new', amount: 450000, createdAt: '2024-04-15' },
  { id: 'd5', title: 'Интеграция ERP', clientId: 'c4', managerId: 'u3', stage: 'negotiation', amount: 280000, createdAt: '2024-05-01' },
  { id: 'd6', title: 'Техническая поддержка', clientId: 'c5', managerId: 'u2', stage: 'lost', amount: 60000, createdAt: '2024-03-05', closedAt: '2024-04-01' },
  { id: 'd7', title: 'Редизайн сайта', clientId: 'c6', managerId: 'u3', stage: 'new', amount: 95000, createdAt: '2024-05-20' },
];

export const TASKS: Task[] = [
  { id: 't1', title: 'Отправить КП клиенту Иванову', assigneeId: 'u2', clientId: 'c1', dealId: 'd2', priority: 'high', status: 'todo', dueDate: '2024-06-15', createdAt: '2024-06-10' },
  { id: 't2', title: 'Позвонить по новой заявке Смирнов', assigneeId: 'u3', clientId: 'c3', dealId: 'd4', priority: 'high', status: 'in_progress', dueDate: '2024-06-12', createdAt: '2024-06-09' },
  { id: 't3', title: 'Подготовить договор', assigneeId: 'u2', clientId: 'c2', dealId: 'd3', priority: 'medium', status: 'in_progress', dueDate: '2024-06-20', createdAt: '2024-06-08' },
  { id: 't4', title: 'Провести демо-презентацию', assigneeId: 'u3', clientId: 'c4', dealId: 'd5', priority: 'medium', status: 'todo', dueDate: '2024-06-25', createdAt: '2024-06-08' },
  { id: 't5', title: 'Обработать входящий запрос поддержки', assigneeId: 'u4', clientId: 'c1', priority: 'low', status: 'done', dueDate: '2024-06-10', createdAt: '2024-06-07' },
  { id: 't6', title: 'Обновить реквизиты клиента Орлова', assigneeId: 'u4', clientId: 'c4', priority: 'low', status: 'todo', dueDate: '2024-06-18', createdAt: '2024-06-09' },
  { id: 't7', title: 'Согласовать бюджет Digital Wave', assigneeId: 'u3', clientId: 'c6', dealId: 'd7', priority: 'high', status: 'todo', dueDate: '2024-06-14', createdAt: '2024-06-10' },
];

export const SELF_EMPLOYED_DEFAULT: SelfEmployedInfo = {
  fullName: 'Иванов Иван Иванович',
  inn: '771234567890',
  bankName: 'Тинькофф Банк',
  bik: '044525974',
  account: '40817810000000000001',
  corrAccount: '30101810145250000974',
  phone: '+7 999 123 45 67',
};

export const INVOICES: Invoice[] = [
  {
    id: 'inv1', number: '001', clientId: 'c1', dealId: 'd1', managerId: 'u2',
    amount: 175000, status: 'paid', createdAt: '2024-03-01', dueDate: '2024-03-15',
    items: [{ id: 'i1', name: 'Внедрение CRM — 1-й этап', qty: 1, price: 175000 }],
    selfEmployed: SELF_EMPLOYED_DEFAULT,
  },
  {
    id: 'inv2', number: '002', clientId: 'c1', dealId: 'd2', managerId: 'u2',
    amount: 200000, status: 'sent', createdAt: '2024-05-01', dueDate: '2024-06-01',
    items: [{ id: 'i2', name: 'Разработка — предоплата', qty: 1, price: 200000 }],
    selfEmployed: SELF_EMPLOYED_DEFAULT,
  },
  {
    id: 'inv3', number: '003', clientId: 'c2', dealId: 'd3', managerId: 'u2',
    amount: 60000, status: 'overdue', createdAt: '2024-04-15', dueDate: '2024-05-15',
    items: [
      { id: 'i3', name: 'SEO аудит', qty: 1, price: 30000 },
      { id: 'i4', name: 'Настройка контекстной рекламы', qty: 1, price: 30000 },
    ],
    selfEmployed: SELF_EMPLOYED_DEFAULT,
  },
  {
    id: 'inv4', number: '004', clientId: 'c4', dealId: 'd5', managerId: 'u3',
    amount: 50000, status: 'draft', createdAt: '2024-06-01', dueDate: '2024-06-30',
    items: [{ id: 'i5', name: 'Аналитика и ТЗ', qty: 1, price: 50000 }],
    selfEmployed: SELF_EMPLOYED_DEFAULT,
  },
];

export const NOMENCLATURE: NomenclatureItem[] = [
  { id: 'n1', name: 'Внедрение CRM — базовый пакет', unit: 'шт.', price: 175000 },
  { id: 'n2', name: 'Разработка мобильного приложения', unit: 'шт.', price: 200000 },
  { id: 'n3', name: 'SEO аудит', unit: 'шт.', price: 30000 },
  { id: 'n4', name: 'Настройка контекстной рекламы', unit: 'мес.', price: 30000 },
  { id: 'n5', name: 'Аналитика и составление ТЗ', unit: 'шт.', price: 50000 },
  { id: 'n6', name: 'Консультация', unit: 'час', price: 3000 },
  { id: 'n7', name: 'Техническая поддержка', unit: 'мес.', price: 15000 },
];

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Администратор',
  sales: 'Менеджер продаж',
  support: 'Поддержка',
};

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin: ['Полный доступ', 'Управление пользователями', 'Все разделы', 'Настройки системы', 'Экспорт данных'],
  sales: ['Клиенты', 'Сделки', 'Задачи', 'Счета', 'Аналитика (своя)'],
  support: ['Клиенты (просмотр)', 'Задачи', 'Заявки поддержки'],
};