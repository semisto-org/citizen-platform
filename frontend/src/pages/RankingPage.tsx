import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Star,
  Loader2,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { getVillageRanking } from '../lib/api';
import type { VillageRanking } from '../types';

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

const LEVEL_COLORS: Record<string, string> = {
  'Village en eveil': COLORS.secondary,
  'Village planteur': COLORS.bronze,
  'Village nourricier': COLORS.silver,
  'Village resilient': COLORS.gold,
  'Village modele': COLORS.gold,
};

const MEDAL_COLORS = [COLORS.gold, COLORS.silver, COLORS.bronze];

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function RankingPage() {
  const [villages, setVillages] = useState<VillageRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState('');
  const [regions, setRegions] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: { page: number; per_page: number; region?: string } = {
          page,
          per_page: 25,
        };
        if (region) params.region = region;
        const res = await getVillageRanking(params);
        if (!cancelled) {
          setVillages(res.data);
          setTotalPages(res.meta.total_pages);

          // Extract regions
          if (regions.length === 0) {
            const unique = [...new Set(res.data.map((v) => v.region).filter(Boolean))].sort();
            setRegions(unique);
          }
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erreur lors du chargement du classement');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [region, page]);

  useEffect(() => {
    setPage(1);
  }, [region]);

  const getLevelColor = (levelName: string): string => {
    for (const [key, color] of Object.entries(LEVEL_COLORS)) {
      if (levelName.toLowerCase().includes(key.split(' ').pop()!.toLowerCase())) return color;
    }
    return '#6B7280';
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: COLORS.background,
        padding: '32px 24px',
      }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Trophy size={30} color={COLORS.gold} />
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: COLORS.text }}>
              Classement des villages
            </h1>
            <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: 15 }}>
              Les villages les plus engages dans le programme
            </p>
          </div>
        </div>

        {/* ── Region filter ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20, marginTop: 16 }}>
          <div style={{ position: 'relative', minWidth: 220 }}>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 36px 10px 14px',
                borderRadius: 10,
                border: '1px solid #D1D5DB',
                fontSize: 14,
                color: COLORS.text,
                backgroundColor: COLORS.white,
                appearance: 'none',
                cursor: 'pointer',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            >
              <option value="">Toutes les regions</option>
              {regions.map((r) => (
                <option key={r} value={r}>{r}</option>
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

        {/* ── Loading ── */}
        {loading && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: 60,
            }}
          >
            <Loader2
              size={28}
              color={COLORS.primary}
              style={{ animation: 'spin 1s linear infinite' }}
            />
            <span style={{ fontSize: 15, fontWeight: 500, color: '#6B7280' }}>
              Chargement du classement...
            </span>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '20px 24px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: 12,
              marginBottom: 24,
            }}
          >
            <AlertCircle size={20} color="#DC2626" />
            <span style={{ fontSize: 14, color: '#DC2626' }}>{error}</span>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && villages.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: '#9CA3AF' }}>
            <Trophy size={48} color="#D1D5DB" style={{ marginBottom: 16 }} />
            <p style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
              Aucun village classe pour le moment
            </p>
          </div>
        )}

        {/* ── Table ── */}
        {!loading && !error && villages.length > 0 && (
          <>
            <div
              style={{
                backgroundColor: COLORS.white,
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
              }}
            >
              {/* Header row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 160px 100px 120px',
                  padding: '14px 24px',
                  backgroundColor: '#F9FAFB',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  borderBottom: '1px solid #E5E7EB',
                }}
              >
                <span>Rang</span>
                <span>Village</span>
                <span>Niveau</span>
                <span style={{ textAlign: 'right' }}>Score</span>
                <span style={{ textAlign: 'right' }}>Ha plantes</span>
              </div>

              {/* Data rows */}
              {villages.map((v, i) => {
                const rank = (page - 1) * 25 + i + 1;
                const isTop3 = rank <= 3;
                const levelColor = getLevelColor(v.level_name);

                return (
                  <Link
                    to={`/villages/${v.id}`}
                    key={v.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '60px 1fr 160px 100px 120px',
                      padding: '14px 24px',
                      alignItems: 'center',
                      textDecoration: 'none',
                      color: COLORS.text,
                      borderBottom: '1px solid #F3F4F6',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = '#FAFAF5';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    {/* Rank */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontWeight: 800,
                        fontSize: 16,
                        color: isTop3 ? MEDAL_COLORS[rank - 1] : '#6B7280',
                      }}
                    >
                      {isTop3 && (
                        <Star
                          size={14}
                          fill={MEDAL_COLORS[rank - 1]}
                          stroke={MEDAL_COLORS[rank - 1]}
                        />
                      )}
                      {rank}
                    </div>

                    {/* Name */}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, color: COLORS.text }}>
                        {v.name}
                      </div>
                      <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                        {v.code_postal} · {v.region}
                      </div>
                    </div>

                    {/* Level badge */}
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '4px 12px',
                        borderRadius: 20,
                        backgroundColor: `${levelColor}18`,
                        color: levelColor,
                        whiteSpace: 'nowrap',
                        maxWidth: 'fit-content',
                      }}
                    >
                      {v.level_name}
                    </span>

                    {/* Score */}
                    <span
                      style={{
                        textAlign: 'right',
                        fontWeight: 800,
                        fontSize: 16,
                        color: COLORS.primary,
                      }}
                    >
                      {v.score.toLocaleString('fr-FR')}
                    </span>

                    {/* Hectares */}
                    <span style={{ textAlign: 'right', fontSize: 14, fontWeight: 500, color: COLORS.text }}>
                      {v.hectares_planted.toFixed(1)} ha
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingTop: 24,
                }}
              >
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  style={{
                    padding: '10px 18px',
                    backgroundColor: page <= 1 ? '#E5E7EB' : COLORS.white,
                    color: page <= 1 ? '#9CA3AF' : COLORS.text,
                    border: '1px solid #D1D5DB',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Precedent
                </button>
                <span
                  style={{
                    padding: '10px 18px',
                    fontSize: 14,
                    fontWeight: 700,
                    color: COLORS.text,
                  }}
                >
                  Page {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  style={{
                    padding: '10px 18px',
                    backgroundColor: page >= totalPages ? '#E5E7EB' : COLORS.white,
                    color: page >= totalPages ? '#9CA3AF' : COLORS.text,
                    border: '1px solid #D1D5DB',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
