import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { HomePage } from './pages/HomePage';
import { TasksPage } from './pages/TasksPage';
import { HistoryPage } from './pages/HistoryPage';
import { StatsPage } from './pages/StatsPage';
import { SettingsPage } from './pages/SettingsPage';
import { useSettingsStore } from './store/settingsStore';
import './styles/global.css';

const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  home: { title: 'EviTakip', subtitle: 'Ev işlerinizi takip edin' },
  tasks: { title: 'Görevler' },
  history: { title: 'Geçmiş' },
  stats: { title: 'İstatistikler' },
  settings: { title: 'Ayarlar' },
};

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const { theme } = useSettingsStore();

  // Apply theme on mount
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'tasks':
        return <TasksPage />;
      case 'history':
        return <HistoryPage />;
      case 'stats':
        return <StatsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  const pageInfo = PAGE_TITLES[currentPage] || PAGE_TITLES.home;

  return (
    <>
      <Header title={pageInfo.title} subtitle={pageInfo.subtitle} />
      <main>{renderPage()}</main>
      <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
    </>
  );
}

export default App;
