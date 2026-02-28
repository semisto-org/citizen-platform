import { useNavigate } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import type { Village } from '../types';

interface VillageCardProps {
  village: Village;
}

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

const LEVEL_CONFIG: Record<number, { label: string; color: string; bg: string }> = {
  0: { label: 'Niveau 0', color: '#6B7280', bg: '#F3F4F6' },
  1: { label: 'Niveau 1', color: COLORS.secondary, bg: '#E8F5E8' },
  2: { label: 'Niveau 2', color: COLORS.bronze, bg: '#FDF0E0' },
  3: { label: 'Niveau 3', color: COLORS.silver, bg: '#F0F0F0' },
  4: { label: 'Niveau 4', color: COLORS.gold, bg: '#FDF8E8' },
  5: { label: 'Niveau 5', color: COLORS.gold, bg: '#FDF8E8' },
};

export default function VillageCard({ village }: VillageCardProps) {
  const navigate = useNavigate();
  const levelConfig = LEVEL_CONFIG[village.level] ?? LEVEL_CONFIG[0];
  const hectaresPercent =
    village.hectares_potential > 0
      ? Math.min((village.hectares_planted / village.hectares_potential) * 100, 100)
      : 0;

  return (
    <div
      onClick={() => navigate(`/villages/${village.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/villages/${village.id}`);
        }
      }}
      style={{
        backgroundColor: COLORS.white,
        borderRadius: 14,
        padding: 20,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.07)',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.12)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.07)';
      }}
    >
      {/* Ligne du haut : Nom + badge de niveau */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 17,
              fontWeight: 700,
              color: COLORS.text,
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {village.name}
          </h3>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              marginTop: 4,
              color: '#6B7280',
              fontSize: 13,
            }}
          >
            <MapPin size={14} />
            <span>{village.code_postal}</span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            borderRadius: 20,
            backgroundColor: levelConfig.bg,
            color: levelConfig.color,
            fontSize: 12,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {village.level === 5 && <Star size={13} fill={COLORS.gold} stroke={COLORS.gold} />}
          {levelConfig.label}
        </div>
      </div>

      {/* Score */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 6,
        }}
      >
        <span
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: COLORS.primary,
            lineHeight: 1,
          }}
        >
          {village.score.toLocaleString('fr-FR')}
        </span>
        <span
          style={{
            fontSize: 13,
            color: '#6B7280',
            fontWeight: 500,
          }}
        >
          points
        </span>
      </div>

      {/* Barre d'hectares */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Hectares plantés
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: COLORS.text,
            }}
          >
            {village.hectares_planted} / {village.hectares_potential} ha
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: 8,
            borderRadius: 4,
            backgroundColor: '#E5E7EB',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${hectaresPercent}%`,
              height: '100%',
              borderRadius: 4,
              backgroundColor: COLORS.secondary,
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>
    </div>
  );
}
