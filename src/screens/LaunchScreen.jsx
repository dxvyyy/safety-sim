import { useBreakpoint } from '../lib/breakpoint.js';

const METRICS = [
  { number: '13',   label: 'Crash types'    },
  { number: '20',   label: 'Real vehicles'  },
  { number: '100%', label: 'Real physics'   },
];

export default function LaunchScreen({ onStart }) {
  const mobile = useBreakpoint() === 'mobile';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--stage)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: mobile ? '64px 20px' : '80px 32px',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Subtle static grid — ≤4% opacity, no animation */}
      <svg
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.035, pointerEvents: 'none' }}
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="var(--stage-text)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Content column */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 440,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: mobile ? 24 : 32,
        textAlign: 'center',
      }}>

        {/* Eyebrow */}
        <div style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: 'var(--stage-muted)',
        }}>
          Chasing Horsepower · Leaf Academy
        </div>

        {/* Display headline */}
        <div style={{
          fontFamily: 'var(--font-sans)',
          fontSize: mobile ? 36 : 46,
          fontWeight: 500,
          letterSpacing: '-0.5px',
          lineHeight: 1.2,
          color: 'var(--stage-text)',
        }}>
          Every crash is a conversation between physics and engineering
        </div>

        {/* Quiet sentence */}
        <div style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 16,
          fontWeight: 400,
          lineHeight: 1.7,
          color: 'var(--stage-muted)',
          maxWidth: 380,
        }}>
          Configure a scenario, run the physics, read the investigation.
        </div>

        {/* Primary CTA — ember on dark */}
        <button
          onClick={onStart}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 15,
            fontWeight: 500,
            background: 'var(--ember)',
            color: 'var(--stage)',
            border: 'none',
            borderRadius: 'var(--r-sm)',
            padding: '12px 28px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginTop: mobile ? 8 : 16,
            transition: 'background 150ms ease, transform 150ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--ember-600)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--ember)'; }}
          onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          Begin
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>

        {/* Metric blocks row */}
        <div style={{
          display: 'flex',
          gap: 12,
          width: '100%',
          marginTop: mobile ? 8 : 16,
        }}>
          {METRICS.map(({ number, label }) => (
            <div key={label} style={{
              flex: 1,
              padding: '16px 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: mobile ? 28 : 32,
                fontWeight: 500,
                letterSpacing: '-0.5px',
                color: 'var(--stage-text)',
                lineHeight: 1,
              }}>
                {number}
              </div>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: 'var(--stage-muted)',
              }}>
                {label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
