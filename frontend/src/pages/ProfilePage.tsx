import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Award,
  MapPin,
  CheckCircle,
  Camera,
  TreePine,
  Edit3,
  Save,
  X,
  LogOut,
  Loader2,
  AlertCircle,
  ChevronDown,
  Star,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getPersonalDashboard, getVillages, updateProfile } from '../lib/api';
import type { PersonalDashboard, Village } from '../types';

// ──────────────────────────────────────────────
// Theme
// ──────────────────────────────────────────────

const COLORS = {
  primary: '#2D5F2D',
  secondary: '#4A8C3F',
  background: '#F5F0E8',
  text: '#1A1A1A',
  gold: '#E8B130',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  white: '#FFFFFF',
};

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [personalData, setPersonalData] = useState<PersonalDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ display_name: '', village_id: '' as string, bio: '' });
  const [villages, setVillages] = useState<Village[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Load personal dashboard
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPersonalDashboard();
        if (!cancelled) {
          setPersonalData(data);
          setForm({
            display_name: data.user.display_name,
            village_id: data.user.village_id?.toString() || '',
            bio: data.user.bio || '',
          });
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erreur lors du chargement du profil');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [user]);

  // Load villages when editing
  useEffect(() => {
    if (editing && villages.length === 0) {
      getVillages({ per_page: 500 })
        .then((res) => setVillages(res.data))
        .catch(() => {});
    }
  }, [editing, villages.length]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await updateProfile({
        display_name: form.display_name,
        bio: form.bio || undefined,
        village_id: form.village_id ? Number(form.village_id) : undefined,
      });
      // Reload data
      const data = await getPersonalDashboard();
      setPersonalData(data);
      setEditing(false);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  // ── Stat card helper ──
  const StatCard = ({
    icon,
    label,
    value,
    color,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: string;
  }) => (
    <div
      style={{
        backgroundColor: COLORS.white,
        borderRadius: 14,
        padding: 18,
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.04)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          backgroundColor: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.text, lineHeight: 1.1 }}>
          {value}
        </div>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', marginTop: 2 }}>
          {label}
        </div>
      </div>
    </div>
  );

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
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

  // ── Loading ──
  if (loading) {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: COLORS.background,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        <Loader2 size={32} color={COLORS.primary} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: 16, fontWeight: 600, color: COLORS.text }}>
          Chargement du profil...
        </span>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: COLORS.background,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 40,
        }}
      >
        <AlertCircle size={48} color="#DC2626" />
        <p style={{ fontSize: 18, fontWeight: 600, color: COLORS.text, margin: 0 }}>{error}</p>
      </div>
    );
  }

  const currentUser = personalData?.user || user;
  const stats = currentUser.stats;
  const badges = currentUser.badges;

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: COLORS.background,
        padding: '32px 24px',
      }}
    >
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* ── Profile header card ── */}
        <div
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 18,
            padding: 28,
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            {/* Avatar */}
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: 18,
                backgroundColor: `${COLORS.primary}12`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <UserIcon size={32} color={COLORS.primary} />
            </div>

            {/* Name + meta */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 24,
                  fontWeight: 800,
                  color: COLORS.text,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {currentUser.display_name}
              </h1>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginTop: 6,
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 20,
                    backgroundColor: `${COLORS.primary}12`,
                    color: COLORS.primary,
                    textTransform: 'capitalize',
                  }}
                >
                  {currentUser.role}
                </span>
                {currentUser.village_name && (
                  <span style={{ fontSize: 13, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={13} />
                    {currentUser.village_name}
                  </span>
                )}
              </div>
            </div>

            {/* Points */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: COLORS.gold, lineHeight: 1 }}>
                {currentUser.points.toLocaleString('fr-FR')}
              </div>
              <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 500, marginTop: 4 }}>
                points
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 12,
            }}
          >
            <StatCard
              icon={<MapPin size={20} />}
              label="Spots crees"
              value={stats.spots_created}
              color="#3B82F6"
            />
            <StatCard
              icon={<CheckCircle size={20} />}
              label="Validations"
              value={stats.validations_given}
              color="#22C55E"
            />
            <StatCard
              icon={<Camera size={20} />}
              label="Photos"
              value={stats.photos_uploaded}
              color="#8B5CF6"
            />
            <StatCard
              icon={<TreePine size={20} />}
              label="Villages contribues"
              value={stats.villages_contributed}
              color={COLORS.gold}
            />
          </div>
        </div>

        {/* ── Badges ── */}
        {badges && badges.length > 0 && (
          <div
            style={{
              backgroundColor: COLORS.white,
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              marginBottom: 20,
            }}
          >
            <h3
              style={{
                margin: '0 0 18px',
                fontSize: 16,
                fontWeight: 700,
                color: COLORS.text,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Award size={18} color={COLORS.gold} />
              Badges obtenus ({badges.length})
            </h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {badges.map((b) => (
                <div
                  key={b.slug}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 16px',
                    backgroundColor: `${COLORS.gold}12`,
                    borderRadius: 12,
                    border: `1px solid ${COLORS.gold}30`,
                  }}
                  title={b.description}
                >
                  <span style={{ fontSize: 20 }}>{b.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>{b.name}</div>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>{b.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Next badge progress ── */}
        {personalData?.next_badge && (
          <div
            style={{
              backgroundColor: COLORS.white,
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              marginBottom: 20,
            }}
          >
            <h3
              style={{
                margin: '0 0 14px',
                fontSize: 16,
                fontWeight: 700,
                color: COLORS.text,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Star size={18} color={COLORS.gold} />
              Prochain badge
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 24 }}>{personalData.next_badge.icon}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>
                  {personalData.next_badge.name}
                </div>
                <div style={{ fontSize: 13, color: '#6B7280' }}>
                  {personalData.next_badge.description}
                </div>
              </div>
            </div>
            <div
              style={{
                height: 8,
                backgroundColor: '#E5E7EB',
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(personalData.next_badge_progress * 100, 100)}%`,
                  backgroundColor: COLORS.gold,
                  borderRadius: 4,
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
            <div style={{ textAlign: 'right', fontSize: 12, color: '#6B7280', marginTop: 4 }}>
              {Math.round(personalData.next_badge_progress * 100)}%
            </div>
          </div>
        )}

        {/* ── Village info ── */}
        {currentUser.village_name && (
          <div
            style={{
              backgroundColor: COLORS.white,
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: `${COLORS.primary}12`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <MapPin size={24} color={COLORS.primary} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
                Mon village
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: COLORS.text }}>
                {currentUser.village_name}
              </div>
            </div>
          </div>
        )}

        {/* ── Edit profile ── */}
        <div
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: COLORS.text }}>
              Informations du profil
            </h3>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  backgroundColor: COLORS.primary,
                  color: COLORS.white,
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.secondary; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.primary; }}
              >
                <Edit3 size={14} />
                Modifier
              </button>
            )}
          </div>

          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Display name */}
              <div>
                <label style={labelStyle}>Nom affiche</label>
                <input
                  type="text"
                  value={form.display_name}
                  onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
                  style={inputStyle}
                  onFocus={(e) => {
                    e.target.style.borderColor = COLORS.secondary;
                    e.target.style.boxShadow = `0 0 0 3px ${COLORS.secondary}22`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Village */}
              <div>
                <label style={labelStyle}>Village</label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={form.village_id}
                    onChange={(e) => setForm((f) => ({ ...f, village_id: e.target.value }))}
                    style={{
                      ...inputStyle,
                      appearance: 'none',
                      cursor: 'pointer',
                      paddingRight: 36,
                    }}
                  >
                    <option value="">-- Aucun village --</option>
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

              {/* Bio */}
              <div>
                <label style={labelStyle}>Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  placeholder="Parlez-nous de vous..."
                  rows={3}
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = COLORS.secondary;
                    e.target.style.boxShadow = `0 0 0 3px ${COLORS.secondary}22`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Save error */}
              {saveError && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 14px',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: 10,
                    fontSize: 13,
                    color: '#DC2626',
                  }}
                >
                  <AlertCircle size={14} />
                  {saveError}
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 20px',
                    backgroundColor: COLORS.primary,
                    color: COLORS.white,
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1,
                    transition: 'background-color 0.2s',
                  }}
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Enregistrer
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setSaveError(null);
                    if (personalData) {
                      setForm({
                        display_name: personalData.user.display_name,
                        village_id: personalData.user.village_id?.toString() || '',
                        bio: personalData.user.bio || '',
                      });
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 20px',
                    backgroundColor: '#F3F4F6',
                    color: COLORS.text,
                    border: '1px solid #D1D5DB',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <X size={16} />
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 2 }}>Email</div>
                <div style={{ fontSize: 14, color: COLORS.text }}>{currentUser.email}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 2 }}>Village</div>
                <div style={{ fontSize: 14, color: COLORS.text }}>{currentUser.village_name || 'Non rattache'}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 2 }}>Bio</div>
                <div style={{ fontSize: 14, color: currentUser.bio ? COLORS.text : '#9CA3AF' }}>
                  {currentUser.bio || 'Pas encore de bio'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 2 }}>Inscrit le</div>
                <div style={{ fontSize: 14, color: COLORS.text }}>
                  {new Date(currentUser.created_at).toLocaleDateString('fr-BE', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Logout ── */}
        <div
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              border: '1px solid #FECACA',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#FEE2E2'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#FEF2F2'; }}
          >
            <LogOut size={16} />
            Se deconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
