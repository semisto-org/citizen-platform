import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  MapPin,
  Users,
  TreePine,
  Leaf,
  TrendingUp,
  Loader2,
  AlertCircle,
  Clock,
  Star,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getGlobalDashboard, getPersonalDashboard } from '../lib/api';
import { SPOT_TYPE_LABELS } from '../types';
import type { DashboardGlobal, PersonalDashboard } from '../types';

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

const MEDAL_COLORS = [COLORS.gold, COLORS.silver, COLORS.bronze];

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const [globalData, setGlobalData] = useState<DashboardGlobal | null>(null);
  const [personalData, setPersonalData] = useState<PersonalDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const globalPromise = getGlobalDashboard();
        const personalPromise = user ? getPersonalDashboard().catch(() => null) : Promise.resolve(null);

        const [globalResult, personalResult] = await Promise.all([globalPromise, personalPromise]);

        if (!cancelled) {
          setGlobalData(globalResult);
          setPersonalData(personalResult);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erreur lors du chargement du tableau de bord');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [user]);

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
        padding: 20,
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.04)',
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
        <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, lineHeight: 1.1 }}>
          {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
        </div>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', marginTop: 2 }}>
          {label}
        </div>
      </div>
    </div>
  );

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
          Chargement du tableau de bord...
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
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: 40,
        }}
      >
        <AlertCircle size={32} color="#DC2626" />
        <span style={{ fontSize: 16, color: '#DC2626' }}>{error}</span>
      </div>
    );
  }

  if (!globalData) return null;

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: COLORS.background,
        padding: '32px 24px',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <BarChart3 size={30} color={COLORS.primary} />
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: COLORS.text }}>
              Tableau de bord
            </h1>
            <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: 15 }}>
              Vue d'ensemble de la plateforme Villages Nourriciers
            </p>
          </div>
        </div>

        {/* ── Global stats ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 16,
            marginBottom: 28,
          }}
        >
          <StatCard
            icon={<Leaf size={24} />}
            label="Villages actifs"
            value={globalData.total_villages}
            color={COLORS.primary}
          />
          <StatCard
            icon={<Users size={24} />}
            label="Utilisateurs"
            value={globalData.total_users}
            color="#8B5CF6"
          />
          <StatCard
            icon={<MapPin size={24} />}
            label="Spots identifies"
            value={globalData.total_spots}
            color="#3B82F6"
          />
          <StatCard
            icon={<TreePine size={24} />}
            label="Hectares plantes"
            value={`${(globalData.total_hectares_planted ?? 0).toFixed(1)} ha`}
            color={COLORS.secondary}
          />
        </div>

        {/* ── Personal stats (if logged in) ── */}
        {user && personalData && (
          <div
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
              borderRadius: 18,
              padding: 28,
              marginBottom: 28,
              color: COLORS.white,
            }}
          >
            <h2
              style={{
                margin: '0 0 20px',
                fontSize: 19,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Star size={20} color={COLORS.gold} />
              Vos statistiques, {personalData.user.display_name}
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: 20,
              }}
            >
              <div>
                <div style={{ fontSize: 32, fontWeight: 800 }}>{personalData.user.points}</div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>Points</div>
              </div>
              <div>
                <div style={{ fontSize: 32, fontWeight: 800 }}>{personalData.user.stats.spots_created}</div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>Spots crees</div>
              </div>
              <div>
                <div style={{ fontSize: 32, fontWeight: 800 }}>{personalData.user.stats.validations_given}</div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>Validations</div>
              </div>
              <div>
                <div style={{ fontSize: 32, fontWeight: 800 }}>{personalData.user.stats.photos_uploaded}</div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>Photos</div>
              </div>
            </div>

            {/* Badges */}
            {personalData.user.badges.length > 0 && (
              <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {personalData.user.badges.map((b) => (
                  <div
                    key={b.slug}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      backgroundColor: 'rgba(255,255,255,0.18)',
                      borderRadius: 20,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                    title={b.description}
                  >
                    <span>{b.icon}</span>
                    <span>{b.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Next badge progress */}
            {personalData.next_badge && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
                  Prochain badge : <strong>{personalData.next_badge.name}</strong>
                </div>
                <div
                  style={{
                    height: 6,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(personalData.next_badge_progress * 100, 100)}%`,
                      backgroundColor: COLORS.gold,
                      borderRadius: 3,
                      transition: 'width 0.5s',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Village info */}
            {personalData.user.village_name && (
              <div
                style={{
                  marginTop: 16,
                  fontSize: 13,
                  opacity: 0.8,
                }}
              >
                Village : <strong>{personalData.user.village_name}</strong>
              </div>
            )}
          </div>
        )}

        {/* ── Two-column: Top villages + Activity ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: 20,
          }}
        >
          {/* Top 10 villages */}
          <div
            style={{
              backgroundColor: COLORS.white,
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            }}
          >
            <h3
              style={{
                margin: '0 0 20px',
                fontSize: 16,
                fontWeight: 700,
                color: COLORS.text,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <TrendingUp size={18} color={COLORS.primary} />
              Top 10 villages
            </h3>
            {globalData.top_villages.length === 0 ? (
              <p style={{ color: '#9CA3AF', fontSize: 14 }}>Aucun village pour le moment</p>
            ) : (
              globalData.top_villages.map((v, i) => (
                <Link
                  to={`/villages/${v.id}`}
                  key={v.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom: i < globalData.top_villages.length - 1 ? '1px solid #F3F4F6' : 'none',
                    textDecoration: 'none',
                    color: COLORS.text,
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.75'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                >
                  {/* Rank */}
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: i < 3 ? `${MEDAL_COLORS[i]}25` : '#F3F4F6',
                      color: i < 3 ? MEDAL_COLORS[i] : '#6B7280',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>

                  {/* Name */}
                  <span
                    style={{
                      flex: 1,
                      fontSize: 14,
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {v.name}
                  </span>

                  {/* Level */}
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 12,
                      backgroundColor: `${COLORS.secondary}18`,
                      color: COLORS.secondary,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {v.level_name}
                  </span>

                  {/* Score */}
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: COLORS.primary,
                      flexShrink: 0,
                      minWidth: 50,
                      textAlign: 'right',
                    }}
                  >
                    {v.score.toLocaleString('fr-FR')}
                  </span>
                </Link>
              ))
            )}
          </div>

          {/* Recent activity */}
          <div
            style={{
              backgroundColor: COLORS.white,
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            }}
          >
            <h3
              style={{
                margin: '0 0 20px',
                fontSize: 16,
                fontWeight: 700,
                color: COLORS.text,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Clock size={18} color="#6B7280" />
              Activite recente
            </h3>
            {globalData.recent_contributions.length === 0 ? (
              <p style={{ color: '#9CA3AF', fontSize: 14 }}>Aucune activite recente</p>
            ) : (
              globalData.recent_contributions.slice(0, 15).map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 0',
                    borderBottom: '1px solid #F3F4F6',
                    fontSize: 14,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: c.is_positive ? COLORS.secondary : '#EF4444',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: COLORS.text }}>
                      {SPOT_TYPE_LABELS[c.spot_type] || c.type}
                    </div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                      {c.user_name} · {c.village}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      color: '#9CA3AF',
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {new Date(c.created_at).toLocaleDateString('fr-BE')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
