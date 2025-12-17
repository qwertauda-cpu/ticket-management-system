import { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { SnackbarProvider } from 'notistack';

// Create RTL cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});
import { theme } from './theme';
import { MainLayout } from './layouts/MainLayout';
import { SuperAdminLayout } from './layouts/SuperAdminLayout';
import { Dashboard } from './pages/Dashboard';
import { TicketsPage } from './pages/TicketsPage';
import { TicketDetailsPage } from './pages/TicketDetailsPage';
import { UsersPage } from './pages/UsersPage';
import { LoginPage } from './pages/LoginPage';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';
import { SuperAdminCompaniesPage } from './pages/SuperAdminCompaniesPage';
import { SuperAdminCompanyDetailsPage } from './pages/SuperAdminCompanyDetailsPage';
import { SuperAdminSubscriptionsPage } from './pages/SuperAdminSubscriptionsPage';
import { SuperAdminInvoicesPage } from './pages/SuperAdminInvoicesPage';
import { setAuthToken, removeAuthToken } from './api/tickets';

type User = {
  id: string;
  email: string;
  name: string;
  tenantId?: string;
  tenantName?: string;
  permissions?: string[];
  isOwner?: boolean;
  isSuperAdmin?: boolean;
};

function App() {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    // Check if super admin is logged in
    const savedSuperAdminToken = localStorage.getItem('superAdminToken');
    const savedSuperAdminUser = localStorage.getItem('superAdminUser');
    
    if (savedSuperAdminToken && savedSuperAdminUser && savedSuperAdminUser !== 'undefined') {
      try {
        setToken(savedSuperAdminToken);
        setUser(JSON.parse(savedSuperAdminUser));
        setIsSuperAdmin(true);
        setCurrentPage('dashboard');
        // Redirect to super admin dashboard
        window.history.replaceState({}, '', '/');
        return;
      } catch (e) {
        // Invalid data, clear it
        localStorage.removeItem('superAdminToken');
        localStorage.removeItem('superAdminUser');
      }
    }

    // Check if regular user is logged in
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser && savedUser !== 'undefined') {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setAuthToken(savedToken);
        setIsSuperAdmin(false);
        setCurrentPage('dashboard');
        // Redirect to user dashboard
        window.history.replaceState({}, '', '/');
      } catch (e) {
        // Invalid data, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        removeAuthToken();
      }
    }
  }, []);

  const handleLogin = (accessToken: string, userData: User) => {
    setToken(accessToken);
    setUser(userData);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setAuthToken(accessToken);
    setIsSuperAdmin(false);
    setCurrentPage('dashboard');
    // Redirect to dashboard
    window.history.replaceState({}, '', '/');
  };

  const handleSuperAdminLogin = (accessToken: string, userData: User) => {
    setToken(accessToken);
    setUser(userData);
    localStorage.setItem('superAdminToken', accessToken);
    localStorage.setItem('superAdminUser', JSON.stringify(userData));
    setIsSuperAdmin(true);
    setCurrentPage('dashboard');
    // Redirect to super admin dashboard
    window.history.replaceState({}, '', '/');
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    if (isSuperAdmin) {
      localStorage.removeItem('superAdminToken');
      localStorage.removeItem('superAdminUser');
      setIsSuperAdmin(false);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      removeAuthToken();
    }
    setCurrentPage('login');
    // Redirect to home
    window.history.replaceState({}, '', '/');
  };

  // Show login page if not authenticated
  if (!user || !token) {
    return (
      <CacheProvider value={cacheRtl}>
        <ThemeProvider theme={theme}>
          <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <CssBaseline />
            <LoginPage 
              onLogin={handleLogin} 
              onSuperAdminLogin={handleSuperAdminLogin}
            />
          </SnackbarProvider>
        </ThemeProvider>
      </CacheProvider>
    );
  }

  // Routing for Super Admin
  if (isSuperAdmin) {
    const renderSuperAdminPage = () => {
      const pathname = window.location.pathname;
      
      // Check for company details page
      if (pathname.match(/^\/super-admin\/companies\/[^/]+$/)) {
        return <SuperAdminCompanyDetailsPage />;
      }
      
      switch (pathname) {
        case '/super-admin/dashboard':
          return <SuperAdminDashboard />;
        case '/super-admin/companies':
          return <SuperAdminCompaniesPage />;
        case '/super-admin/subscriptions':
          return <SuperAdminSubscriptionsPage />;
        case '/super-admin/invoices':
          return <SuperAdminInvoicesPage />;
        default:
          return <SuperAdminDashboard />;
      }
    };

    const handleSuperAdminNavigate = (path: string) => {
      window.history.pushState({}, '', path);
      setCurrentPage(path);
    };

    return (
      <CacheProvider value={cacheRtl}>
        <ThemeProvider theme={theme}>
          <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <CssBaseline />
            <SuperAdminLayout
              currentPath={window.location.pathname}
              onNavigate={handleSuperAdminNavigate}
              user={user}
              onLogout={handleLogout}
            >
              {renderSuperAdminPage()}
            </SuperAdminLayout>
          </SnackbarProvider>
        </ThemeProvider>
      </CacheProvider>
    );
  }

  // Routing for regular users
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'tickets':
        return <TicketsPage onViewTicket={(ticketId) => {
          setSelectedTicketId(ticketId);
          setCurrentPage('ticket-details');
        }} />;
      case 'ticket-details':
        return selectedTicketId ? (
          <TicketDetailsPage 
            ticketId={selectedTicketId} 
            onBack={() => setCurrentPage('tickets')} 
          />
        ) : <TicketsPage onViewTicket={(ticketId) => {
          setSelectedTicketId(ticketId);
          setCurrentPage('ticket-details');
        }} />;
      case 'users':
        return user?.isOwner ? <UsersPage /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  const handleNavigate = (path: string) => {
    if (path === '/') {
      setCurrentPage('dashboard');
    } else if (path === '/tickets') {
      setCurrentPage('tickets');
      setSelectedTicketId(null);
    } else if (path === '/users') {
      setCurrentPage('users');
    }
  };

  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <CssBaseline />
          <MainLayout 
            currentPath={
              currentPage === 'dashboard' ? '/' : 
              currentPage === 'tickets' ? '/tickets' : 
              '/users'
            }
            onNavigate={handleNavigate}
            user={user}
            onLogout={handleLogout}
          >
            {renderPage()}
          </MainLayout>
        </SnackbarProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;

