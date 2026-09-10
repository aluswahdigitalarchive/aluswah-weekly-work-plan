import React, { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AgendaProvider, useAgenda } from './context/AgendaContext';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { DivisionPage } from './pages/DivisionPage';
import { PresentationPage } from './pages/PresentationPage';
import { LoginPage } from './pages/LoginPage';

function AppContent() {
  const { user, isDivision, userDivisionId } = useAuth();
  const { isLoading, error, refetchData, divisions } = useAgenda();
  const getInitialPath = () => {
    const hash = window.location.hash;
    if (hash.startsWith('#/')) {
      return hash.slice(1);
    }
    const path = window.location.pathname;
    return path || '/';
  };

  const [currentPath, setCurrentPath] = useState<string>(getInitialPath);

  // Sync navigation
  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    if (window.location.hash.startsWith('#/')) {
      window.location.hash = path;
    } else {
      window.history.pushState({}, '', path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen to popstate / hashchange
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getInitialPath());
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-sky-400 animate-spin" />
          </div>
          <div className="text-center">
            <h2 className="text-sm font-semibold tracking-wider text-slate-200 uppercase">
              Weekly Work Plan
            </h2>
            <p className="text-xs text-slate-400 mt-1 animate-pulse">
              Memuat data dari Supabase...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#131b2e] border border-rose-500/20 rounded-2xl p-6 shadow-2xl text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-slate-100 mb-2">
            Gagal Memuat Data
          </h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            {error}
          </p>
          <button
            onClick={() => { void refetchData(); }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-lg transition-colors shadow-lg shadow-sky-500/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // Check if login route
  if (currentPath === '/login') {
    if (user) {
      if (isDivision && userDivisionId) {
        const targetDiv = divisions.find((d) => d.id === userDivisionId);
        if (targetDiv) {
          handleNavigate(`/division/${targetDiv.slug}`);
          return null;
        }
      }
      handleNavigate('/');
      return null;
    }
    return <LoginPage onNavigate={handleNavigate} />;
  }

  // Protected admin routes: require authentication
  if (currentPath.startsWith('/admin') || currentPath.startsWith('/manage')) {
    if (!user) {
      handleNavigate('/login');
      return <LoginPage onNavigate={handleNavigate} />;
    }
    if (isDivision && userDivisionId) {
      const targetDiv = divisions.find((d) => d.id === userDivisionId);
      if (targetDiv) {
        handleNavigate(`/division/${targetDiv.slug}`);
        return null;
      }
    }
  }

  // Check if presentation mode
  const isPresentation = currentPath === '/presentation';

  if (isPresentation) {
    return <PresentationPage onExit={() => handleNavigate('/')} />;
  }

  // Parse route
  const renderContent = () => {
    if (currentPath.startsWith('/division/')) {
      const slug = currentPath.replace('/division/', '');
      return (
        <DivisionPage
          divisionSlug={slug}
          onNavigateDivision={handleNavigate}
          onEnterPresentation={() => handleNavigate('/presentation')}
        />
      );
    }

    // Default: Dashboard Page
    return (
      <DashboardPage
        onNavigateDivision={handleNavigate}
        onEnterPresentation={() => handleNavigate('/presentation')}
      />
    );
  };

  return (
    <AppShell currentPath={currentPath} onNavigate={handleNavigate}>
      {renderContent()}
    </AppShell>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AgendaProvider>
        <AppContent />
      </AgendaProvider>
    </AuthProvider>
  );
}

export default App;
