import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from '@/components/Sidebar';
import LoginPage from '@/components/LoginPage';
import Dashboard from '@/components/pages/Dashboard';
import Clients from '@/components/pages/Clients';
import Deals from '@/components/pages/Deals';
import Tasks from '@/components/pages/Tasks';
import Invoices, { InvoiceFormModal } from '@/components/pages/Invoices';
import Analytics from '@/components/pages/Analytics';
import Roles from '@/components/pages/Roles';
import { type User } from '@/data/mock';
import Icon from '@/components/ui/icon';

type Page = 'dashboard' | 'clients' | 'deals' | 'tasks' | 'invoices' | 'analytics' | 'roles';

const pageTitles: Record<Page, string> = {
  dashboard: 'Главная',
  clients: 'Клиенты',
  deals: 'Сделки',
  tasks: 'Задачи',
  invoices: 'Счета',
  analytics: 'Аналитика',
  roles: 'Роли и права',
};

function CRMApp() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [page, setPage] = useState<Page>('dashboard');
  const [invoiceModal, setInvoiceModal] = useState<{ dealId?: string; clientId?: string } | null>(null);

  const openInvoice = (dealId: string, clientId: string) => {
    setInvoiceModal({ dealId, clientId });
  };

  if (!currentUser) {
    return <LoginPage onLogin={user => setCurrentUser(user)} />;
  }

  const renderPage = () => {
    if (page === 'clients') return <Clients />;
    if (page === 'deals' && ['admin', 'sales'].includes(currentUser.role))
      return <Deals onOpenInvoice={openInvoice} />;
    if (page === 'tasks') return <Tasks />;
    if (page === 'invoices' && ['admin', 'sales'].includes(currentUser.role))
      return <Invoices />;
    if (page === 'analytics' && ['admin', 'sales'].includes(currentUser.role))
      return <Analytics />;
    if (page === 'roles' && currentUser.role === 'admin') return <Roles />;
    return <Dashboard />;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar currentPage={page} onNavigate={setPage} currentUser={currentUser} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center px-6 border-b border-border/60 bg-white/80 backdrop-blur-md flex-shrink-0">
          <h2 className="text-sm font-semibold text-foreground">{pageTitles[page]}</h2>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors">
              <Icon name="Bell" size={16} className="text-muted-foreground" />
              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors">
              <Icon name="Settings" size={16} className="text-muted-foreground" />
            </button>
            <div className="w-px h-5 bg-border" />
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setCurrentUser(null)}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'hsl(244 80% 60%)' }}>
                {currentUser.avatar}
              </div>
              <span className="text-sm font-medium text-foreground hidden sm:block">{currentUser.name.split(' ')[0]}</span>
              <Icon name="LogOut" size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>

      {invoiceModal && (
        <InvoiceFormModal
          prefillDealId={invoiceModal.dealId}
          prefillClientId={invoiceModal.clientId}
          onClose={() => setInvoiceModal(null)}
        />
      )}
    </div>
  );
}

const App = () => (
  <TooltipProvider>
    <Toaster />
    <CRMApp />
  </TooltipProvider>
);

export default App;
