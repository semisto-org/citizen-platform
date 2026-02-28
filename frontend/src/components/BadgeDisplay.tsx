import {
  Award,
  Search,
  Map,
  Camera,
  TreeDeciduous,
  Star,
  Shield,
  Heart,
  Zap,
  Users,
  Eye,
  Sprout,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { Badge } from '../types';

interface BadgeDisplayProps {
  badge: Badge;
  size?: 'small' | 'large';
}

const COLORS = {
  primary: '#2D5F2D',
  secondary: '#4A8C3F',
  gold: '#E8B130',
  white: '#FFFFFF',
};

const ICON_MAP: Record<string, (s: number) => ReactNode> = {
  search: (s) => <Search size={s} />,
  map: (s) => <Map size={s} />,
  camera: (s) => <Camera size={s} />,
  tree: (s) => <TreeDeciduous size={s} />,
  star: (s) => <Star size={s} />,
  shield: (s) => <Shield size={s} />,
  heart: (s) => <Heart size={s} />,
  zap: (s) => <Zap size={s} />,
  users: (s) => <Users size={s} />,
  eye: (s) => <Eye size={s} />,
  sprout: (s) => <Sprout size={s} />,
  award: (s) => <Award size={s} />,
};

function resolveIcon(iconSlug: string, iconSize: number): ReactNode {
  const factory = ICON_MAP[iconSlug];
  return factory ? factory(iconSize) : <Award size={iconSize} />;
}

export default function BadgeDisplay({ badge, size = 'small' }: BadgeDisplayProps) {
  const isLarge = size === 'large';
  const iconSize = isLarge ? 24 : 16;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isLarge ? 12 : 6,
        backgroundColor: `${COLORS.primary}10`,
        borderRadius: isLarge ? 14 : 20,
        padding: isLarge ? '14px 18px' : '5px 12px',
        border: `1px solid ${COLORS.primary}25`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(45, 95, 45, 0.12)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
      title={badge.description}
    >
      {/* Icône du badge */}
      <div
        style={{
          width: isLarge ? 40 : 26,
          height: isLarge ? 40 : 26,
          borderRadius: isLarge ? 10 : 13,
          backgroundColor: `${COLORS.primary}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: COLORS.primary,
          flexShrink: 0,
        }}
      >
        {resolveIcon(badge.icon, iconSize)}
      </div>

      {/* Nom + description */}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: isLarge ? 15 : 12,
            fontWeight: 700,
            color: COLORS.primary,
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {badge.name}
        </div>
        {isLarge && badge.description && (
          <div
            style={{
              fontSize: 12,
              color: '#6B7280',
              marginTop: 3,
              lineHeight: 1.4,
            }}
          >
            {badge.description}
          </div>
        )}
      </div>
    </div>
  );
}
