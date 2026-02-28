import { useState, useEffect } from 'react';
import { Search, MapPin, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { getVillages } from '../lib/api';
import type { Village } from '../types';
import VillageCard from '../components/VillageCard';

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

export default function VillagesPage() {
  const [villages, setVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [regions, setRegions] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset page on region change
  useEffect(() => {
    setPage(1);
  }, [region]);

  // Load villages
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: { page: number; per_page: number; search?: string; region?: string } = {
          page,
          per_page: 12,
        };
        if (search) params.search = search;
        if (region) params.region = region;

        const res = await getVillages(params);
        if (!cancelled) {
          setVillages(res.data);
          setTotalPages(res.meta.total_pages);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erreur lors du chargement des villages');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [search, region, page]);

  // Load regions once
  useEffect(() => {
    getVillages({ per_page: 500 })
      .then((res) => {
        const unique = [...new Set(res.data.map((v) => v.region).filter(Boolean))].sort();
        setRegions(unique);
      })
      .catch(() => {});
  }, []);

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: COLORS.background,
        padding: '32px 24px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* ── Header ── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <MapPin size={28} color={COLORS.primary} />
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: COLORS.text }}>
              Villages
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: 15, color: '#6B7280', maxWidth: 600 }}>
            Decouvrez les villages engages dans le programme Villages Nourriciers et suivez leur progression.
          </p>
        </div>

        {/* ── Search and filter bar ── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <Search
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
              placeholder="Rechercher un village..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
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
              }}
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

          {/* Region filter */}
          <div style={{ position: 'relative', minWidth: 220 }}>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 36px 12px 14px',
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
              Chargement des villages...
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

        {/* ── Empty state ── */}
        {!loading && !error && villages.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: '#9CA3AF' }}>
            <MapPin size={48} color="#D1D5DB" style={{ marginBottom: 16 }} />
            <p style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>
              Aucun village trouve
            </p>
            <p style={{ fontSize: 14, margin: 0 }}>
              Essayez de modifier vos criteres de recherche.
            </p>
          </div>
        )}

        {/* ── Villages grid ── */}
        {!loading && !error && villages.length > 0 && (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 20,
                marginBottom: 32,
              }}
            >
              {villages.map((village) => (
                <VillageCard key={village.id} village={village} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingTop: 16,
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
                    transition: 'background-color 0.2s',
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
                    transition: 'background-color 0.2s',
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
