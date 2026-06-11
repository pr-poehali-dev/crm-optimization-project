import { useState, useEffect } from 'react';
import { CLIENTS, DEALS, TASKS, INVOICES, type Client, type Deal, type Task, type Invoice } from './mock';

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

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() { listeners.forEach(l => l()); }

export function subscribe(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getClients() { return clients; }
export function getDeals() { return deals; }
export function getTasks() { return tasks; }
export function getInvoices() { return invoices; }
export function getComments() { return comments; }

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
  };
}
