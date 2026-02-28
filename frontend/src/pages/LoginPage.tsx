import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Leaf,
  Mail,
  Lock,
  LogIn,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

// ──────────────────────────────────────────────
// Theme
// ──────────────────────────────────────────────

const COLORS = {
  primary: '#2D5F2D',
  secondary: '#4A8C3F',
  background: '#F5F0E8',
  text: '#1A1A1A',
  gold: '#E8B130',
  white: '#FFFFFF',
};

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion. Verifiez vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px 12px 42px',
    borderRadius: 10,
    border: '1px solid #D1D5DB',
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.white,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: COLORS.text,
    marginBottom: 6,
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
      }}
    >
      <div
        style={{
          backgroundColor: COLORS.white,
          borderRadius: 20,
          padding: '44px 40px',
          width: '100%',
          maxWidth: 440,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: `${COLORS.primary}12`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Leaf size={24} color={COLORS.primary} />
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, color: COLORS.primary }}>
              Villages Nourriciers
            </span>
          </div>
          <h1 style={{ margin: '8px 0 4px', fontSize: 26, fontWeight: 800, color: COLORS.text }}>
            Connexion
          </h1>
          <p style={{ margin: 0, color: '#6B7280', fontSize: 14 }}>
            Connectez-vous pour contribuer a votre village
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: 10,
              fontSize: 14,
              color: '#DC2626',
              marginBottom: 20,
            }}
          >
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Email */}
          <div>
            <label style={labelStyle}>Adresse email</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                color="#9CA3AF"
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
                style={inputStyle}
                onFocus={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = COLORS.secondary;
                  (e.target as HTMLInputElement).style.boxShadow = `0 0 0 3px ${COLORS.secondary}22`;
                }}
                onBlur={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = '#D1D5DB';
                  (e.target as HTMLInputElement).style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                color="#9CA3AF"
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Votre mot de passe"
                style={{ ...inputStyle, paddingRight: 42 }}
                onFocus={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = COLORS.secondary;
                  (e.target as HTMLInputElement).style.boxShadow = `0 0 0 3px ${COLORS.secondary}22`;
                }}
                onBlur={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = '#D1D5DB';
                  (e.target as HTMLInputElement).style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 2,
                  display: 'flex',
                  color: '#9CA3AF',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              width: '100%',
              padding: 14,
              backgroundColor: COLORS.primary,
              color: COLORS.white,
              border: 'none',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: 4,
              transition: 'background-color 0.2s, opacity 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.secondary;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.primary;
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Connexion en cours...
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
              </>
            ) : (
              <>
                <LogIn size={18} />
                Se connecter
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p
          style={{
            textAlign: 'center',
            marginTop: 24,
            fontSize: 14,
            color: '#6B7280',
          }}
        >
          Pas encore de compte ?{' '}
          <Link
            to="/register"
            style={{
              color: COLORS.primary,
              fontWeight: 700,
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'underline'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'none'; }}
          >
            Creer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
