import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Header from './components/Header';
import MapPage from './pages/MapPage';
import VillagesPage from './pages/VillagesPage';
import VillageDetailPage from './pages/VillageDetailPage';
import RankingPage from './pages/RankingPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<AppLayout><MapPage /></AppLayout>} />
          <Route path="/villages" element={<AppLayout><VillagesPage /></AppLayout>} />
          <Route path="/villages/:id" element={<AppLayout><VillageDetailPage /></AppLayout>} />
          <Route path="/ranking" element={<AppLayout><RankingPage /></AppLayout>} />
          <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
          <Route path="/profile" element={<AppLayout><ProfilePage /></AppLayout>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
