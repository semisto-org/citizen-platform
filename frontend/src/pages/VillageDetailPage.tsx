import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Users,
  TreePine,
  TrendingUp,
  Award,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  Star,
} from 'lucide-react';
import { getVillageDashboard } from '../lib/api';
import { SPOT_TYPE_LABELS } from '../types';
import type { VillageDashboard } from '../types';

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

const LEVEL_COLORS: Record<number, string> = {
  0: '#6B7280',
  1: COLORS.secondary,
  2: COLORS.bronze,
  3: COLORS.silver,
  4: COLORS.gold,
  5: COLORS.gold,
};

const LEVEL_BG: Record<number, string> = {
  0: '#F3F4F6',
  1: '#E8F5E8',
  2: '#FDF0E0',
  3: '#F0F0F0',
  4: '#FDF8E8',
  5: '#FDF8E8',
};

const BAR_COLORS = [
  '#2D5F2D',
  '#4A8C3F',
  '#E8B130',
  '#3B82F6',
  '#8B5CF6',
];

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function VillageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<VillageDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getVillageDashboard(Number(id));
        if (!cancelled) setData(result);
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Village introuvable');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [id]);

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
          Chargement du village...
        </span>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Error ──
  if (error || !data) {
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
        <p style={{ fontSize: 18, fontWeight: 600, color: COLORS.text, margin: 0 }}>
          {error || 'Village introuvable'}
        </p>
        <Link
          to="/villages"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: COLORS.primary,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} />
          Retour aux villages
        </Link>
      </div>
    );
  }

  const v = data.village;
  const progressPct =
    v.hectares_potential > 0
      ? Math.min((v.hectares_planted / v.hectares_potential) * 100, 100)
      : 0;

  const spotsByTypeEntries = Object.entries(v.spots_by_type || {});
  const maxSpotCount = Math.max(...spotsByTypeEntries.map(([, c]) => c as number), 1);

  // ── Stats card helper ──
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
          width: 44,
          height: 44,
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
        <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, lineHeight: 1.1 }}>
          {value}
        </div>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', marginTop: 2 }}>
          {label}
        </div>
      </div>
    </div>
  );

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: COLORS.background,
        padding: '32px 24px',
      }}
    >
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Back link */}
        <Link
          to="/villages"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: COLORS.primary,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
            marginBottom: 20,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'underline'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'none'; }}
        >
          <ArrowLeft size={16} />
          Retour aux villages
        </Link>

        {/* ── Village header card ── */}
        <div
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 18,
            padding: 28,
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            {/* Icon */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: LEVEL_BG[v.level] || LEVEL_BG[0],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <TreePine size={28} color={LEVEL_COLORS[v.level] || LEVEL_COLORS[0]} />
            </div>

            {/* Name + meta */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: COLORS.text }}>
                {v.name}
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
                <span style={{ fontSize: 13, color: '#6B7280' }}>{v.code_postal}</span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: 20,
                    backgroundColor: LEVEL_BG[v.level] || LEVEL_BG[0],
                    color: LEVEL_COLORS[v.level] || LEVEL_COLORS[0],
                  }}
                >
                  {v.level >= 4 && <Star size={12} fill={COLORS.gold} stroke={COLORS.gold} />}
                  Niveau {v.level} — {v.level_name}
                </span>
              </div>
            </div>

            {/* Score */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: COLORS.primary, lineHeight: 1 }}>
                {v.score.toLocaleString('fr-FR')}
              </div>
              <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 500, marginTop: 4 }}>
                points
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 24 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 13,
                marginBottom: 8,
              }}
            >
              <span style={{ color: '#6B7280', fontWeight: 500 }}>Progression de plantation</span>
              <span style={{ fontWeight: 700, color: COLORS.text }}>
                {v.hectares_planted.toFixed(1)} / {v.hectares_potential.toFixed(1)} ha
              </span>
            </div>
            <div
              style={{
                height: 10,
                backgroundColor: '#E5E7EB',
                borderRadius: 5,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progressPct}%`,
                  background: `linear-gradient(90deg, ${COLORS.secondary}, ${COLORS.primary})`,
                  borderRadius: 5,
                  transition: 'width 0.6s ease',
                }}
              />
            </div>
            <div style={{ textAlign: 'right', fontSize: 12, color: '#6B7280', marginTop: 4 }}>
              {progressPct.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* ── Stats cards ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 14,
            marginBottom: 24,
          }}
        >
          <StatCard
            icon={<MapPin size={22} />}
            label="Spots identifies"
            value={v.spots_total}
            color="#3B82F6"
          />
          <StatCard
            icon={<TreePine size={22} />}
            label="Hectares plantes"
            value={`${v.hectares_planted.toFixed(1)} ha`}
            color={COLORS.primary}
          />
          <StatCard
            icon={<TrendingUp size={22} />}
            label="Citoyens actifs"
            value={v.active_citizens}
            color={COLORS.gold}
          />
          <StatCard
            icon={<Users size={22} />}
            label="Membres"
            value={v.members_count}
            color="#8B5CF6"
          />
        </div>

        {/* ── Two-column: Spots by type + Leaderboard ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
            gap: 20,
            marginBottom: 24,
          }}
        >
          {/* Spots by type */}
          <div
            style={{
              backgroundColor: COLORS.white,
              borderRadius: 14,
              padding: 24,
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            }}
          >
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: COLORS.text }}>
              Spots par type
            </h3>
            {spotsByTypeEntries.length === 0 ? (
              <p style={{ color: '#9CA3AF', fontSize: 14 }}>Aucun spot pour le moment</p>
            ) : (
              spotsByTypeEntries.map(([type, count], i) => {
                const pct = ((count as number) / maxSpotCount) * 100;
                const color = BAR_COLORS[i % BAR_COLORS.length];
                return (
                  <div key={type} style={{ marginBottom: 14 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 13,
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontWeight: 500, color: COLORS.text }}>
                        {SPOT_TYPE_LABELS[type as keyof typeof SPOT_TYPE_LABELS] || type}
                      </span>
                      <span style={{ fontWeight: 700, color: COLORS.text }}>
                        {count as number}
                      </span>
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
                          width: `${pct}%`,
                          backgroundColor: color,
                          borderRadius: 4,
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Leaderboard */}
          <div
            style={{
              backgroundColor: COLORS.white,
              borderRadius: 14,
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
              <Award size={18} color={COLORS.gold} />
              Top contributeurs
            </h3>
            {data.leaderboard.length === 0 ? (
              <p style={{ color: '#9CA3AF', fontSize: 14 }}>Aucun contributeur pour le moment</p>
            ) : (
              data.leaderboard.map((member, i) => {
                const medalColors = [COLORS.gold, COLORS.silver, COLORS.bronze];
                const isTop3 = i < 3;
                return (
                  <div
                    key={member.user_id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 0',
                      borderBottom:
                        i < data.leaderboard.length - 1 ? '1px solid #F3F4F6' : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: isTop3 ? `${medalColors[i]}25` : '#F3F4F6',
                        color: isTop3 ? medalColors[i] : '#6B7280',
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
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: COLORS.text,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {member.display_name}
                      </div>
                      <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                        {member.spots_created} spot{member.spots_created !== 1 ? 's' : ''} · {member.badges_count} badge{member.badges_count !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: COLORS.primary,
                        flexShrink: 0,
                      }}
                    >
                      {member.points} pts
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Recent activity ── */}
        <div
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 14,
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
          {(v.recent_activity || []).length === 0 ? (
            <p style={{ color: '#9CA3AF', fontSize: 14 }}>Aucune activite recente</p>
          ) : (
            v.recent_activity.map((a) => (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
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
                    backgroundColor: COLORS.secondary,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: 600, color: COLORS.text }}>{a.user_name}</span>
                  <span style={{ color: '#6B7280' }}> — {a.description}</span>
                </div>
                <span style={{ fontSize: 12, color: '#9CA3AF', flexShrink: 0 }}>
                  {new Date(a.created_at).toLocaleDateString('fr-BE')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
