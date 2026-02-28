import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getVillages } from '../lib/api';
import type { Village } from '../types';
import {
  Leaf,
  Mail,
  Lock,
  User,
  MapPin,
  UserPlus,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronDown,
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

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    display_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    village_id: '' as number | '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [villages, setVillages] = useState<Village[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load villages
  useEffect(() => {
    getVillages({ per_page: 500 })
      .then((res) => setVillages(res.data))
      .catch(() => {});
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.password_confirmation) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await register({
        display_name: form.display_name,
        email: form.email,
        password: form.password,
        village_id: form.village_id ? Number(form.village_id) : undefined,
      });
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription.");
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

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = COLORS.secondary;
    e.target.style.boxShadow = `0 0 0 3px ${COLORS.secondary}22`;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#D1D5DB';
    e.target.style.boxShadow = 'none';
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
          padding: '40px 40px',
          width: '100%',
          maxWidth: 460,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
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
            Creer un compte
          </h1>
          <p style={{ margin: 0, color: '#6B7280', fontSize: 14 }}>
            Rejoignez la communaute et contribuez a votre village
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
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Display name */}
          <div>
            <label style={labelStyle}>Nom affiche</label>
            <div style={{ position: 'relative' }}>
              <User
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
                type="text"
                value={form.display_name}
                onChange={(e) => handleChange('display_name', e.target.value)}
                required
                placeholder="Marie D."
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
          </div>

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
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                placeholder="votre@email.com"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
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
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                minLength={6}
                placeholder="Min. 6 caracteres"
                style={{ ...inputStyle, paddingRight: 42 }}
                onFocus={handleFocus}
                onBlur={handleBlur}
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

          {/* Password confirmation */}
          <div>
            <label style={labelStyle}>Confirmer le mot de passe</label>
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
                value={form.password_confirmation}
                onChange={(e) => handleChange('password_confirmation', e.target.value)}
                required
                placeholder="Repetez le mot de passe"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
          </div>

          {/* Village */}
          <div>
            <label style={labelStyle}>
              Village <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(optionnel)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin
                size={18}
                color="#9CA3AF"
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              />
              <select
                value={form.village_id}
                onChange={(e) => handleChange('village_id', e.target.value)}
                style={{
                  ...inputStyle,
                  appearance: 'none',
                  cursor: 'pointer',
                  paddingRight: 36,
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              >
                <option value="">-- Choisir un village --</option>
                {villages.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.code_postal})
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                color="#6B7280"
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
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
                Creation en cours...
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Creer mon compte
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
          Deja un compte ?{' '}
          <Link
            to="/login"
            style={{
              color: COLORS.primary,
              fontWeight: 700,
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'underline'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'none'; }}
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
