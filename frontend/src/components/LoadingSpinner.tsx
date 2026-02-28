import { Leaf } from 'lucide-react';

const COLORS = {
  primary: '#2D5F2D',
  secondary: '#4A8C3F',
  background: '#F5F0E8',
};

export default function LoadingSpinner() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 80,
        gap: 20,
      }}
    >
      {/* Anneau de chargement avec icône au centre */}
      <div
        style={{
          position: 'relative',
          width: 56,
          height: 56,
        }}
      >
        {/* Anneau extérieur tournant */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: `4px solid ${COLORS.background}`,
            borderTopColor: COLORS.primary,
            borderRightColor: COLORS.secondary,
            borderRadius: '50%',
            animation: 'loading-spin 0.9s linear infinite',
          }}
        />
        {/* Icône feuille au centre */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Leaf size={20} color={COLORS.primary} />
        </div>
      </div>

      <span
        style={{
          fontSize: 15,
          fontWeight: 500,
          color: '#6B7280',
          letterSpacing: 0.3,
        }}
      >
        Chargement...
      </span>

      <style>{`
        @keyframes loading-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
