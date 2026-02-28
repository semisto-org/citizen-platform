import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useAuth } from '../hooks/useAuth';
import { getSpotsGeoJSON, createSpot, getVillages } from '../lib/api';
import {
  SpotType,
  SpotStatus,
  SPOT_TYPE_LABELS,
  SPOT_STATUS_LABELS,
} from '../types';
import type {
  CreateSpotRequest,
  Village,
} from '../types';
import {
  Filter,
  Plus,
  X,
  Layers,
  MapPin,
  Loader2,
  AlertCircle,
  ChevronDown,
  Send,
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
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  white: '#FFFFFF',
};

const TYPE_COLORS: Record<string, string> = {
  [SpotType.HaieExistante]: '#2D5F2D',
  [SpotType.HaiePotentielle]: '#4A8C3F',
  [SpotType.ArbreIsole]: '#E8B130',
  [SpotType.Bosquet]: '#8B5CF6',
  [SpotType.ZonePotentielle]: '#3B82F6',
};

const STATUS_COLORS: Record<string, string> = {
  [SpotStatus.Brouillon]: '#9CA3AF',
  [SpotStatus.Soumis]: '#3B82F6',
  [SpotStatus.Valide]: '#22C55E',
  [SpotStatus.Plante]: '#E8B130',
};

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const addMarker = useRef<mapboxgl.Marker | null>(null);
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Add spot
  const [addingSpot, setAddingSpot] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSpotCoords, setNewSpotCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    spot_type: SpotType.ArbreIsole as SpotType,
    description: '',
    village_id: '' as number | '',
  });
  const [villages, setVillages] = useState<Village[]>([]);

  // ── Load GeoJSON ──

  const loadSpots = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (filterType) params.spot_type = filterType;
      if (filterStatus) params.status = filterStatus;
      const data = await getSpotsGeoJSON(params);
      return data;
    } catch {
      return null;
    }
  }, [filterType, filterStatus]);

  const refreshMapData = useCallback(async () => {
    const data = await loadSpots();
    if (data && map.current?.getSource('spots')) {
      (map.current.getSource('spots') as mapboxgl.GeoJSONSource).setData(
        data as unknown as GeoJSON.FeatureCollection,
      );
    }
  }, [loadSpots]);

  // ── Init Mapbox ──

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token) {
      setError('Token Mapbox manquant (VITE_MAPBOX_TOKEN)');
      setLoading(false);
      return;
    }

    mapboxgl.accessToken = token;

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [5.0, 50.4],
      zoom: 8,
    });

    m.addControl(new mapboxgl.NavigationControl(), 'top-right');
    m.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      'top-right',
    );

    m.on('load', () => {
      setLoading(false);

      m.addSource('spots', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      m.addLayer({
        id: 'spots-circles',
        type: 'circle',
        source: 'spots',
        paint: {
          'circle-radius': 8,
          'circle-color': [
            'match',
            ['get', 'spot_type'],
            SpotType.HaieExistante, TYPE_COLORS[SpotType.HaieExistante],
            SpotType.HaiePotentielle, TYPE_COLORS[SpotType.HaiePotentielle],
            SpotType.ArbreIsole, TYPE_COLORS[SpotType.ArbreIsole],
            SpotType.Bosquet, TYPE_COLORS[SpotType.Bosquet],
            SpotType.ZonePotentielle, TYPE_COLORS[SpotType.ZonePotentielle],
            '#999999',
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': [
            'match',
            ['get', 'status'],
            SpotStatus.Brouillon, STATUS_COLORS[SpotStatus.Brouillon],
            SpotStatus.Soumis, STATUS_COLORS[SpotStatus.Soumis],
            SpotStatus.Valide, STATUS_COLORS[SpotStatus.Valide],
            SpotStatus.Plante, STATUS_COLORS[SpotStatus.Plante],
            '#FFFFFF',
          ],
          'circle-opacity': 0.9,
        },
      });

      // Click handler – popup
      m.on('click', 'spots-circles', (e) => {
        if (!e.features?.[0]) return;
        const props = e.features[0].properties!;
        const coords = (e.features[0].geometry as GeoJSON.Point).coordinates.slice() as [number, number];

        const typeLabel = SPOT_TYPE_LABELS[props.spot_type as SpotType] || props.spot_type;
        const statusLabel = SPOT_STATUS_LABELS[props.status as SpotStatus] || props.status;
        const statusColor = STATUS_COLORS[props.status as string] || '#666';

        new mapboxgl.Popup({ offset: 12, maxWidth: '280px' })
          .setLngLat(coords)
          .setHTML(`
            <div style="font-family:system-ui,-apple-system,sans-serif;min-width:200px;">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
                <span style="width:12px;height:12px;border-radius:50%;background:${TYPE_COLORS[props.spot_type as string] || '#999'};flex-shrink:0;"></span>
                <strong style="font-size:15px;color:${COLORS.primary};">${typeLabel}</strong>
              </div>
              <div style="font-size:13px;color:#555;margin-bottom:6px;">
                Statut : <span style="color:${statusColor};font-weight:600;">${statusLabel}</span>
              </div>
              ${props.species ? `<div style="font-size:13px;margin-bottom:4px;">Especes : ${typeof props.species === 'string' ? props.species : JSON.parse(props.species).join(', ')}</div>` : ''}
              ${props.description ? `<div style="font-size:13px;color:#555;margin-bottom:4px;">${props.description}</div>` : ''}
              <div style="font-size:12px;color:#888;margin-top:8px;padding-top:6px;border-top:1px solid #E5E7EB;">
                par <strong>${props.creator_name || '—'}</strong> &middot; ${props.village_name || '—'}
              </div>
            </div>
          `)
          .addTo(m);
      });

      m.on('mouseenter', 'spots-circles', () => {
        m.getCanvas().style.cursor = 'pointer';
      });
      m.on('mouseleave', 'spots-circles', () => {
        m.getCanvas().style.cursor = '';
      });
    });

    map.current = m;

    return () => {
      m.remove();
      map.current = null;
    };
  }, []);

  // ── Refresh spots when filters change ──

  useEffect(() => {
    refreshMapData();
  }, [refreshMapData]);

  // ── Add-mode map click ──

  const handleMapClickForAdd = useCallback((e: mapboxgl.MapMouseEvent) => {
    const { lat, lng } = e.lngLat;
    setNewSpotCoords({ lat, lng });
    setShowAddForm(true);
    setAddingSpot(false);

    // Place marker
    if (addMarker.current) addMarker.current.remove();
    if (map.current) {
      addMarker.current = new mapboxgl.Marker({ color: COLORS.gold })
        .setLngLat([lng, lat])
        .addTo(map.current);
      map.current.getCanvas().style.cursor = '';
    }
  }, []);

  const startAddSpot = () => {
    setAddingSpot(true);
    setFormError(null);
    if (map.current) {
      map.current.getCanvas().style.cursor = 'crosshair';
      map.current.once('click', handleMapClickForAdd);
    }
  };

  const cancelAdd = () => {
    setAddingSpot(false);
    setShowAddForm(false);
    setNewSpotCoords(null);
    setFormError(null);
    setFormData({ spot_type: SpotType.ArbreIsole, description: '', village_id: '' });
    if (addMarker.current) {
      addMarker.current.remove();
      addMarker.current = null;
    }
    if (map.current) {
      map.current.getCanvas().style.cursor = '';
    }
  };

  // ── Load villages for add form ──

  useEffect(() => {
    if (showAddForm && villages.length === 0) {
      getVillages({ per_page: 500 })
        .then((res) => setVillages(res.data))
        .catch(() => {});
    }
  }, [showAddForm, villages.length]);

  // ── Submit new spot ──

  const handleSubmitSpot = async () => {
    if (!newSpotCoords || !formData.village_id) return;
    setFormLoading(true);
    setFormError(null);
    try {
      const req: CreateSpotRequest = {
        spot_type: formData.spot_type,
        geometry_type: 'Point',
        latitude: newSpotCoords.lat,
        longitude: newSpotCoords.lng,
        geometry_coords: [newSpotCoords.lng, newSpotCoords.lat],
        description: formData.description || undefined,
        village_id: formData.village_id as number,
      };
      await createSpot(req);
      cancelAdd();
      refreshMapData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Erreur lors de la creation du spot');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Shared styles ──

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 36px 10px 12px',
    borderRadius: 8,
    border: '1px solid #D1D5DB',
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.white,
    appearance: 'none',
    cursor: 'pointer',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  };

  // ──────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 64px)', display: 'flex' }}>
      {/* Map */}
      <div ref={mapContainer} style={{ flex: 1 }} />

      {/* Loading overlay */}
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            backgroundColor: 'rgba(255,255,255,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <Loader2
            size={36}
            color={COLORS.primary}
            style={{ animation: 'spin 1s linear infinite' }}
          />
          <span style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>
            Chargement de la carte...
          </span>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 10,
            zIndex: 25,
          }}
        >
          <AlertCircle size={18} color="#DC2626" />
          <span style={{ fontSize: 14, color: '#DC2626' }}>{error}</span>
        </div>
      )}

      {/* ── Filter panel ── */}
      {showFilters && (
        <div
          style={{
            position: 'absolute',
            top: 62,
            left: 16,
            zIndex: 10,
            backgroundColor: COLORS.white,
            borderRadius: 14,
            padding: 20,
            width: 280,
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: COLORS.text }}>Filtres</h3>
            <button
              onClick={() => setShowFilters(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: '#6B7280' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Type */}
          <div>
            <label style={labelStyle}>Type de spot</label>
            <div style={{ position: 'relative' }}>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={selectStyle}
              >
                <option value="">Tous les types</option>
                {Object.values(SpotType).map((t) => (
                  <option key={t} value={t}>{SPOT_TYPE_LABELS[t]}</option>
                ))}
              </select>
              <ChevronDown
                size={16}
                color="#6B7280"
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label style={labelStyle}>Statut</label>
            <div style={{ position: 'relative' }}>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={selectStyle}
              >
                <option value="">Tous les statuts</option>
                {Object.values(SpotStatus).map((s) => (
                  <option key={s} value={s}>{SPOT_STATUS_LABELS[s]}</option>
                ))}
              </select>
              <ChevronDown
                size={16}
                color="#6B7280"
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
            </div>
          </div>

          {/* Reset */}
          {(filterType || filterStatus) && (
            <button
              onClick={() => { setFilterType(''); setFilterStatus(''); }}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: COLORS.secondary,
                border: `1px solid ${COLORS.secondary}`,
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reinitialiser les filtres
            </button>
          )}

          {/* Legend */}
          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8, fontWeight: 600, fontSize: 12, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              <Layers size={14} /> Legende
            </div>
            {Object.values(SpotType).map((t) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: TYPE_COLORS[t],
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 13, color: COLORS.text }}>{SPOT_TYPE_LABELS[t]}</span>
              </div>
            ))}
            <div style={{ marginTop: 10, fontSize: 11, color: '#9CA3AF' }}>
              Le contour indique le statut du spot.
            </div>
          </div>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 10,
          display: 'flex',
          gap: 8,
        }}
      >
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 16px',
            backgroundColor: showFilters ? COLORS.primary : COLORS.white,
            color: showFilters ? COLORS.white : COLORS.text,
            border: 'none',
            borderRadius: 10,
            boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Filter size={16} />
          Filtres
        </button>

        {user && !addingSpot && !showAddForm && (
          <button
            onClick={startAddSpot}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              backgroundColor: COLORS.primary,
              color: COLORS.white,
              border: 'none',
              borderRadius: 10,
              boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.secondary; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.primary; }}
          >
            <Plus size={16} />
            Ajouter un spot
          </button>
        )}

        {addingSpot && (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                backgroundColor: COLORS.gold,
                color: COLORS.text,
                borderRadius: 10,
                boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <MapPin size={16} />
              Cliquez sur la carte pour placer le spot
            </div>
            <button
              onClick={cancelAdd}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 14px',
                backgroundColor: COLORS.white,
                color: '#DC2626',
                border: 'none',
                borderRadius: 10,
                boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <X size={16} />
              Annuler
            </button>
          </>
        )}
      </div>

      {/* ── Add spot form panel ── */}
      {showAddForm && newSpotCoords && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 60,
            zIndex: 10,
            backgroundColor: COLORS.white,
            borderRadius: 14,
            padding: 24,
            width: 320,
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            maxHeight: 'calc(100vh - 110px)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: COLORS.primary }}>
              Nouveau spot
            </h3>
            <button
              onClick={cancelAdd}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: '#6B7280' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Coords */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              backgroundColor: '#F3F4F6',
              borderRadius: 8,
              fontSize: 13,
              color: '#6B7280',
            }}
          >
            <MapPin size={14} />
            {newSpotCoords.lat.toFixed(5)}, {newSpotCoords.lng.toFixed(5)}
          </div>

          {/* Type */}
          <div>
            <label style={labelStyle}>Type de spot *</label>
            <div style={{ position: 'relative' }}>
              <select
                value={formData.spot_type}
                onChange={(e) => setFormData((p) => ({ ...p, spot_type: e.target.value as SpotType }))}
                style={selectStyle}
              >
                {Object.values(SpotType).map((t) => (
                  <option key={t} value={t}>{SPOT_TYPE_LABELS[t]}</option>
                ))}
              </select>
              <ChevronDown
                size={16}
                color="#6B7280"
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
            </div>
          </div>

          {/* Village */}
          <div>
            <label style={labelStyle}>Village *</label>
            <div style={{ position: 'relative' }}>
              <select
                value={formData.village_id}
                onChange={(e) => setFormData((p) => ({ ...p, village_id: e.target.value ? Number(e.target.value) : '' }))}
                style={selectStyle}
              >
                <option value="">Selectionnez un village</option>
                {villages.map((v) => (
                  <option key={v.id} value={v.id}>{v.name} ({v.code_postal})</option>
                ))}
              </select>
              <ChevronDown
                size={16}
                color="#6B7280"
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              placeholder="Decrivez ce spot..."
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #D1D5DB',
                fontSize: 14,
                color: COLORS.text,
                backgroundColor: COLORS.white,
                resize: 'vertical',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Error */}
          {formError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 8,
                fontSize: 13,
                color: '#DC2626',
              }}
            >
              <AlertCircle size={14} />
              {formError}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmitSpot}
            disabled={formLoading || !formData.village_id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 20px',
              backgroundColor: !formData.village_id ? '#9CA3AF' : COLORS.primary,
              color: COLORS.white,
              border: 'none',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: !formData.village_id ? 'not-allowed' : 'pointer',
              opacity: formLoading ? 0.7 : 1,
              transition: 'background-color 0.2s',
            }}
          >
            {formLoading ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send size={16} />
                Creer le spot
              </>
            )}
          </button>
        </div>
      )}

      {/* ── Bottom legend ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 30,
          left: 16,
          zIndex: 5,
          backgroundColor: COLORS.white,
          borderRadius: 10,
          padding: '10px 16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          fontSize: 12,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            marginBottom: 6,
            fontWeight: 700,
            color: COLORS.text,
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          <Layers size={14} />
          Legende
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {Object.values(SpotType).map((t) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: TYPE_COLORS[t],
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 11, color: COLORS.text, whiteSpace: 'nowrap' }}>
                {SPOT_TYPE_LABELS[t]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
