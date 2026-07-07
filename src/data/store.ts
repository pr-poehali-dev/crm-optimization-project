import { useState, useEffect } from 'react';
import { CLIENTS, DEALS, TASKS, INVOICES, USERS, NOMENCLATURE, SELF_EMPLOYED_DEFAULT, type Client, type Deal, type Task, type Invoice, type User, type NomenclatureItem, type SelfEmployedInfo, type Role } from './mock';

export interface Comment {
  id: string;
  entityId: string; // dealId or taskId
  text: string;
  authorId: string;
  createdAt: string;
}

let clients = [...CLIENTS];
let deals = [...DEALS];
let tasks = [...TASKS];
let invoices = [...INVOICES];
let comments: Comment[] = [];
let users = [...USERS];
let nomenclature = [...NOMENCLATURE];
let selfEmployed: SelfEmployedInfo = { ...SELF_EMPLOYED_DEFAULT };

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() { listeners.forEach(l => l()); }

export function subscribe(fn: Listener) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function getClients() { return clients; }
export function getDeals() { return deals; }
export function getTasks() { return tasks; }
export function getInvoices() { return invoices; }
export function getComments() { return comments; }
export function getUsers() { return users; }
export function getNomenclature() { return nomenclature; }
export function getSelfEmployed() { return selfEmployed; }

export function addClient(c: Client) { clients = [c, ...clients]; notify(); }
export function addDeal(d: Deal) { deals = [d, ...deals]; notify(); }
export function addTask(t: Task) { tasks = [t, ...tasks]; notify(); }
export function addInvoice(inv: Invoice) { invoices = [inv, ...invoices]; notify(); }

export function addComment(entityId: string, text: string, authorId: string) {
  comments = [...comments, { id: `cmt${Date.now()}`, entityId, text, authorId, createdAt: new Date().toISOString() }];
  notify();
}

export function updateDealStage(dealId: string, stage: Deal['stage']) {
  deals = deals.map(d => d.id === dealId ? { ...d, stage } : d);
  notify();
}

export function updateTaskStatus(taskId: string, status: Task['status']) {
  tasks = tasks.map(t => t.id === taskId ? { ...t, status } : t);
  notify();
}

export function inviteUser(data: { name: string; email: string; role: Role; phone?: string }) {
  const user: User = {
    id: `u${Date.now()}`,
    name: data.name,
    email: data.email,
    role: data.role,
    avatar: data.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    phone: data.phone,
    createdAt: new Date().toISOString().split('T')[0],
    isActive: true,
  };
  users = [user, ...users];
  notify();
  return user;
}

export function updateUser(userId: string, patch: Partial<User>) {
  users = users.map(u => u.id === userId ? { ...u, ...patch } : u);
  notify();
}

export function addNomenclatureItem(item: NomenclatureItem) {
  nomenclature = [item, ...nomenclature];
  notify();
}

export function updateNomenclatureItem(id: string, patch: Partial<NomenclatureItem>) {
  nomenclature = nomenclature.map(n => n.id === id ? { ...n, ...patch } : n);
  notify();
}

export function removeNomenclatureItem(id: string) {
  nomenclature = nomenclature.filter(n => n.id !== id);
  notify();
}

export function updateSelfEmployed(info: SelfEmployedInfo) {
  selfEmployed = { ...info };
  notify();
}

export function useStore() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const unsub = subscribe(() => setTick(t => t + 1));
    return unsub;
  }, []);
  return {
    clients: getClients(),
    deals: getDeals(),
    tasks: getTasks(),
    invoices: getInvoices(),
    comments: getComments(),
    users: getUsers(),
    nomenclature: getNomenclature(),
    selfEmployed: getSelfEmployed(),
  };
}