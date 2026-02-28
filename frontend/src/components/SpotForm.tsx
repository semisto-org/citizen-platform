import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader2 } from 'lucide-react';
import { SpotType, SPOT_TYPE_LABELS } from '../types';

export interface SpotFormValues {
  spot_type: SpotType;
  latitude: number;
  longitude: number;
  species: string;
  estimated_height: number | null;
  is_edible: boolean;
  description: string;
}

interface SpotFormProps {
  onSubmit: (values: SpotFormValues) => void;
  initialValues?: Partial<SpotFormValues>;
  loading?: boolean;
}

const COLORS = {
  primary: '#2D5F2D',
  secondary: '#4A8C3F',
  background: '#F5F0E8',
  text: '#1A1A1A',
  gold: '#E8B130',
  white: '#FFFFFF',
};

const DEFAULT_VALUES: SpotFormValues = {
  spot_type: SpotType.ArbreIsole,
  latitude: 0,
  longitude: 0,
  species: '',
  estimated_height: null,
  is_edible: false,
  description: '',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #D1D5DB',
  fontSize: 14,
  color: '#1A1A1A',
  backgroundColor: '#FFFFFF',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box',
};

const applyFocusRing = (
  e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
) => {
  e.currentTarget.style.borderColor = COLORS.secondary;
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 140, 63, 0.15)';
};

const removeFocusRing = (
  e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
) => {
  e.currentTarget.style.borderColor = '#D1D5DB';
  e.currentTarget.style.boxShadow = 'none';
};

export default function SpotForm({ onSubmit, initialValues, loading = false }: SpotFormProps) {
  const navigate = useNavigate();
  const [values, setValues] = useState<SpotFormValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });

  useEffect(() => {
    if (initialValues) {
      setValues((prev) => ({ ...prev, ...initialValues }));
    }
  }, [initialValues]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setValues((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === 'number') {
      setValues((prev) => ({
        ...prev,
        [name]: value === '' ? null : parseFloat(value),
      }));
    } else {
      setValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 28,
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        maxWidth: 560,
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: 20,
          fontWeight: 700,
          color: COLORS.text,
        }}
      >
        {initialValues ? 'Modifier le spot' : 'Nouveau spot'}
      </h2>

      {/* Type de spot */}
      <div>
        <label htmlFor="spot_type" style={labelStyle}>
          Type de spot
        </label>
        <select
          id="spot_type"
          name="spot_type"
          value={values.spot_type}
          onChange={handleChange}
          onFocus={applyFocusRing}
          onBlur={removeFocusRing}
          style={{
            ...inputStyle,
            appearance: 'none',
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%236B7280\' d=\'M6 8L1 3h10z\'/%3E%3C/svg%3E")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 14px center',
            paddingRight: 36,
          }}
        >
          {Object.entries(SPOT_TYPE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Latitude / Longitude */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label htmlFor="latitude" style={labelStyle}>
            Latitude
          </label>
          <input
            id="latitude"
            name="latitude"
            type="number"
            step="any"
            required
            value={values.latitude ?? ''}
            onChange={handleChange}
            onFocus={applyFocusRing}
            onBlur={removeFocusRing}
            style={inputStyle}
            placeholder="46.2276"
          />
        </div>
        <div>
          <label htmlFor="longitude" style={labelStyle}>
            Longitude
          </label>
          <input
            id="longitude"
            name="longitude"
            type="number"
            step="any"
            required
            value={values.longitude ?? ''}
            onChange={handleChange}
            onFocus={applyFocusRing}
            onBlur={removeFocusRing}
            style={inputStyle}
            placeholder="2.2137"
          />
        </div>
      </div>

      {/* Espèces */}
      <div>
        <label htmlFor="species" style={labelStyle}>
          Espèces
        </label>
        <input
          id="species"
          name="species"
          type="text"
          value={values.species}
          onChange={handleChange}
          onFocus={applyFocusRing}
          onBlur={removeFocusRing}
          style={inputStyle}
          placeholder="Chêne, Noisetier, Pommier..."
        />
      </div>

      {/* Hauteur estimée */}
      <div>
        <label htmlFor="estimated_height" style={labelStyle}>
          Hauteur estimée (m)
        </label>
        <input
          id="estimated_height"
          name="estimated_height"
          type="number"
          step="0.1"
          min="0"
          value={values.estimated_height ?? ''}
          onChange={handleChange}
          onFocus={applyFocusRing}
          onBlur={removeFocusRing}
          style={inputStyle}
          placeholder="2.5"
        />
      </div>

      {/* Comestible */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <input
          id="is_edible"
          name="is_edible"
          type="checkbox"
          checked={values.is_edible}
          onChange={handleChange}
          style={{
            width: 18,
            height: 18,
            accentColor: COLORS.secondary,
            cursor: 'pointer',
            borderRadius: 4,
          }}
        />
        <label
          htmlFor="is_edible"
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: COLORS.text,
            cursor: 'pointer',
          }}
        >
          Espèce comestible
        </label>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" style={labelStyle}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={values.description}
          onChange={handleChange}
          onFocus={applyFocusRing as React.FocusEventHandler<HTMLTextAreaElement>}
          onBlur={removeFocusRing as React.FocusEventHandler<HTMLTextAreaElement>}
          rows={4}
          style={{
            ...inputStyle,
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
          placeholder="Décrivez l'emplacement, l'état de la végétation..."
        />
      </div>

      {/* Boutons */}
      <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            flex: 1,
            padding: '12px 20px',
            borderRadius: 10,
            border: '1px solid #D1D5DB',
            backgroundColor: COLORS.white,
            color: '#6B7280',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = '#F9FAFB';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.white;
          }}
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '12px 20px',
            borderRadius: 10,
            border: 'none',
            backgroundColor: loading ? '#9CA3AF' : COLORS.primary,
            color: COLORS.white,
            fontSize: 14,
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.secondary;
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.primary;
            }
          }}
        >
          {loading ? (
            <>
              <Loader2
                size={16}
                style={{
                  animation: 'spotform-spin 1s linear infinite',
                }}
              />
              Enregistrement...
            </>
          ) : (
            <>
              <Save size={16} />
              Enregistrer
            </>
          )}
        </button>
      </div>

      <style>{`
        @keyframes spotform-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  );
}
