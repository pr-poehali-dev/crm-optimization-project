import { useState, useEffect } from 'react';
import { CLIENTS, DEALS, TASKS, type Client, type Deal, type Task } from './mock';

// Simple in-memory reactive store
let clients = [...CLIENTS];
let deals = [...DEALS];
let tasks = [...TASKS];

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(l => l());
}

export function subscribe(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getClients() { return clients; }
export function getDeals() { return deals; }
export function getTasks() { return tasks; }

export function addClient(client: Client) {
  clients = [client, ...clients];
  notify();
}

export function addDeal(deal: Deal) {
  deals = [deal, ...deals];
  notify();
}

export function addTask(task: Task) {
  tasks = [task, ...tasks];
  notify();
}

export function updateDealStage(dealId: string, stage: Deal['stage']) {
  deals = deals.map(d => d.id === dealId ? { ...d, stage } : d);
  notify();
}

// React hook to subscribe to store
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
  };
}
