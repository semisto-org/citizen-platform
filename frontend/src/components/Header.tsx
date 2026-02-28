import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Leaf, Map, Building2, Trophy, LayoutDashboard,
  LogIn, UserPlus, LogOut, Menu, X, User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const COLORS = {
  primary: '#2D5F2D',
  secondary: '#4A8C3F',
  gold: '#E8B130',
  white: '#FFFFFF',
  text: '#1A1A1A',
};

const navItems = [
  { to: '/', label: 'Carte', icon: Map },
  { to: '/villages', label: 'Villages', icon: Building2 },
  { to: '/ranking', label: 'Classement', icon: Trophy },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header style={{
      backgroundColor: COLORS.primary, color: COLORS.white,
      padding: '0 24px', position: 'sticky', top: 0, zIndex: 1000,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', height: 64,
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: COLORS.white }}>
          <Leaf size={28} color={COLORS.gold} />
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: 0.5 }}>
            Villages Nourriciers
          </span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="header-nav-desktop">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                borderRadius: 8, textDecoration: 'none', color: COLORS.white,
                fontSize: 14, fontWeight: 500, transition: 'background-color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Icon size={18} /> {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="header-auth-desktop">
          {user ? (
            <>
              <Link to="/profile" style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                borderRadius: 8, textDecoration: 'none', color: COLORS.gold,
                fontSize: 14, fontWeight: 500, transition: 'background-color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <UserIcon size={16} /> {user.display_name}
              </Link>
              <button onClick={handleLogout} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                borderRadius: 8, border: '1px solid rgba(255,255,255,0.3)',
                backgroundColor: 'transparent', color: COLORS.white,
                fontSize: 14, fontWeight: 500, cursor: 'pointer',
              }}>
                <LogOut size={16} /> Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                borderRadius: 8, border: '1px solid rgba(255,255,255,0.3)',
                textDecoration: 'none', color: COLORS.white, fontSize: 14, fontWeight: 500,
              }}>
                <LogIn size={16} /> Connexion
              </Link>
              <Link to="/register" style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                borderRadius: 8, border: 'none', textDecoration: 'none',
                backgroundColor: COLORS.gold, color: COLORS.text, fontSize: 14, fontWeight: 600,
              }}>
                <UserPlus size={16} /> Inscription
              </Link>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="header-burger" style={{
          display: 'none', alignItems: 'center', justifyContent: 'center',
          background: 'none', border: 'none', color: COLORS.white, cursor: 'pointer', padding: 8,
        }} aria-label="Menu">
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="header-mobile-menu" style={{
          backgroundColor: COLORS.primary, padding: '8px 0 16px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                  borderRadius: 8, textDecoration: 'none', color: COLORS.white, fontSize: 15, fontWeight: 500,
                }}>
                  <Icon size={20} /> {item.label}
                </Link>
              );
            })}
          </nav>
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 8, paddingTop: 12,
            display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 16, paddingRight: 16,
          }}>
            {user ? (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)} style={{
                  fontSize: 14, fontWeight: 500, color: COLORS.gold, paddingBottom: 8, textDecoration: 'none',
                }}>{user.display_name}</Link>
                <button onClick={handleLogout} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
                  borderRadius: 8, border: '1px solid rgba(255,255,255,0.3)',
                  backgroundColor: 'transparent', color: COLORS.white, fontSize: 14, fontWeight: 500,
                  cursor: 'pointer', width: '100%',
                }}>
                  <LogOut size={16} /> Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.3)',
                  textDecoration: 'none', color: COLORS.white, fontSize: 14, fontWeight: 500,
                }}>
                  <LogIn size={16} /> Connexion
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '10px 16px', borderRadius: 8, border: 'none',
                  textDecoration: 'none', backgroundColor: COLORS.gold, color: COLORS.text,
                  fontSize: 14, fontWeight: 600,
                }}>
                  <UserPlus size={16} /> Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .header-nav-desktop { display: none !important; }
          .header-auth-desktop { display: none !important; }
          .header-burger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .header-mobile-menu { display: none !important; }
        }
      `}</style>
    </header>
  );
}
