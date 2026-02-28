import { Trees, TreeDeciduous, TreePine, Square, CheckCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Spot } from '../types';
import { SpotType, SpotStatus, SPOT_TYPE_LABELS, SPOT_STATUS_LABELS } from '../types';

interface SpotCardProps {
  spot: Spot;
  onClick?: (spot: Spot) => void;
}

const COLORS = {
  primary: '#2D5F2D',
  secondary: '#4A8C3F',
  background: '#F5F0E8',
  text: '#1A1A1A',
  gold: '#E8B130',
  white: '#FFFFFF',
};

const SPOT_TYPE_ICONS: Record<SpotType, ReactNode> = {
  [SpotType.HaieExistante]: <Trees size={20} color={COLORS.secondary} />,
  [SpotType.HaiePotentielle]: <Trees size={20} color={COLORS.secondary} />,
  [SpotType.ArbreIsole]: <TreeDeciduous size={20} color={COLORS.secondary} />,
  [SpotType.Bosquet]: <TreePine size={20} color={COLORS.secondary} />,
  [SpotType.ZonePotentielle]: <Square size={20} color={COLORS.secondary} />,
};

const STATUS_STYLES: Record<SpotStatus, { color: string; bg: string }> = {
  [SpotStatus.Brouillon]: { color: '#6B7280', bg: '#F3F4F6' },
  [SpotStatus.Soumis]: { color: '#2563EB', bg: '#EFF6FF' },
  [SpotStatus.Valide]: { color: COLORS.secondary, bg: '#E8F5E8' },
  [SpotStatus.Plante]: { color: COLORS.gold, bg: '#FDF8E8' },
};

export default function SpotCard({ spot, onClick }: SpotCardProps) {
  const typeIcon = SPOT_TYPE_ICONS[spot.spot_type] ?? SPOT_TYPE_ICONS[SpotType.ArbreIsole];
  const typeLabel = SPOT_TYPE_LABELS[spot.spot_type] ?? spot.spot_type;
  const statusLabel = SPOT_STATUS_LABELS[spot.status] ?? spot.status;
  const statusStyle = STATUS_STYLES[spot.status] ?? STATUS_STYLES[SpotStatus.Brouillon];
  const totalValidations = spot.positive_validations + spot.negative_validations;

  return (
    <div
      onClick={() => onClick?.(spot)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick(spot);
        }
      }}
      style={{
        backgroundColor: COLORS.white,
        borderRadius: 14,
        padding: 18,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.07)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.12)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.07)';
        }
      }}
    >
      {/* Ligne du haut : icône du type + libellé + badge de statut */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: '#E8F5E8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {typeIcon}
          </div>
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: COLORS.text,
              }}
            >
              {typeLabel}
            </div>
            <div
              style={{
                fontSize: 12,
                color: '#6B7280',
                marginTop: 1,
              }}
            >
              {spot.village_name}
            </div>
          </div>
        </div>

        <span
          style={{
            padding: '4px 10px',
            borderRadius: 20,
            backgroundColor: statusStyle.bg,
            color: statusStyle.color,
            fontSize: 12,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {statusLabel}
        </span>
      </div>

      {/* Espèces */}
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#9CA3AF',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 3,
          }}
        >
          Espèces
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: COLORS.text,
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {spot.species.length > 0 ? spot.species.join(', ') : 'Non renseigné'}
        </div>
      </div>

      {/* Nombre de validations */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          paddingTop: 6,
          borderTop: '1px solid #F3F4F6',
        }}
      >
        <CheckCircle
          size={15}
          color={totalValidations > 0 ? COLORS.secondary : '#D1D5DB'}
        />
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: totalValidations > 0 ? COLORS.secondary : '#9CA3AF',
          }}
        >
          {totalValidations} validation{totalValidations !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
