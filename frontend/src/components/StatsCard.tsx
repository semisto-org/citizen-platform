import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  color?: string;
  trend?: { value: number; label?: string };
}

const COLORS = {
  text: '#1A1A1A',
  white: '#FFFFFF',
};

export default function StatsCard({
  icon,
  label,
  value,
  color = '#2D5F2D',
  trend,
}: StatsCardProps) {
  const isPositive = trend ? trend.value >= 0 : undefined;

  return (
    <div
      style={{
        backgroundColor: COLORS.white,
        borderRadius: 14,
        padding: 20,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.07)',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        minWidth: 200,
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.10)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.07)';
      }}
    >
      {/* Icône */}
      <div
        style={{
          width: 48,
          height: 48,
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

      {/* Contenu */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: COLORS.text,
            lineHeight: 1.2,
          }}
        >
          {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
        </div>
        <div
          style={{
            fontSize: 13,
            color: '#6B7280',
            fontWeight: 500,
            marginTop: 2,
          }}
        >
          {label}
        </div>
      </div>

      {/* Indicateur de tendance */}
      {trend !== undefined && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              padding: '3px 8px',
              borderRadius: 20,
              backgroundColor: isPositive ? '#ECFDF5' : '#FEF2F2',
              color: isPositive ? '#059669' : '#DC2626',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {isPositive && '+'}
            {trend.value}%
          </div>
          {trend.label && (
            <span
              style={{
                fontSize: 11,
                color: '#9CA3AF',
                marginTop: 3,
              }}
            >
              {trend.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
