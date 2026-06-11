const GROUPS = [
  {
    label: 'Ground',
    swatches: [
      { name: '--paper',          hex: '#F7F4EE', dark: false },
      { name: '--surface',        hex: '#FFFFFF', dark: false },
      { name: '--surface-sunken', hex: '#F1EDE5', dark: false },
    ],
  },
  {
    label: 'Ink',
    swatches: [
      { name: '--ink',           hex: '#1A1714', dark: true },
      { name: '--ink-secondary', hex: '#5C554E', dark: true },
      { name: '--ink-tertiary',  hex: '#938B82', dark: true },
    ],
  },
  {
    label: 'Hairlines',
    swatches: [
      { name: '--hairline',        hex: 'rgba(26,23,20,0.10)', dark: false },
      { name: '--hairline-strong', hex: 'rgba(26,23,20,0.18)', dark: false },
    ],
  },
  {
    label: 'Ember',
    swatches: [
      { name: '--ember-50',  hex: '#FBF0EA', dark: false },
      { name: '--ember-100', hex: '#F5D9CB', dark: false },
      { name: '--ember-300', hex: '#E89B73', dark: false },
      { name: '--ember',     hex: '#D8572A', dark: true  },
      { name: '--ember-600', hex: '#B8431C', dark: true  },
      { name: '--ember-800', hex: '#7C2D14', dark: true  },
      { name: '--ember-900', hex: '#4A1B0C', dark: true  },
    ],
  },
  {
    label: 'Stage',
    swatches: [
      { name: '--stage',          hex: '#211C18', dark: true },
      { name: '--stage-elevated', hex: '#2A241F', dark: true },
      { name: '--stage-text',     hex: '#F5EDE8', dark: false },
      { name: '--stage-muted',    hex: '#B0A09A', dark: false },
    ],
  },
  {
    label: 'Semantic — safe',
    swatches: [
      { name: '--safe',      hex: '#2F8F5B', dark: true  },
      { name: '--safe-bg',   hex: '#E8F3EC', dark: false },
      { name: '--safe-text', hex: '#1A5435', dark: true  },
    ],
  },
  {
    label: 'Semantic — fatal',
    swatches: [
      { name: '--fatal',      hex: '#C73E33', dark: true  },
      { name: '--fatal-bg',   hex: '#FBEAE8', dark: false },
      { name: '--fatal-text', hex: '#7A2019', dark: true  },
    ],
  },
  {
    label: 'Semantic — warn',
    swatches: [
      { name: '--warn',      hex: '#E0A516', dark: true  },
      { name: '--warn-bg',   hex: '#FCF3DD', dark: false },
      { name: '--warn-text', hex: '#6B4D08', dark: true  },
    ],
  },
];

function Swatch({ name, hex, dark }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 100 }}>
      <div style={{
        width: '100%', height: 56,
        background: `var(${name})`,
        borderRadius: 'var(--r-md)',
        border: '0.5px solid var(--hairline)',
      }} />
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-secondary)', lineHeight: 1.4 }}>
        {name}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-tertiary)' }}>
        {hex}
      </div>
    </div>
  );
}

function TypeRow({ label, sample, style, note }) {
  return (
    <div style={{ padding: '16px 0', borderBottom: '0.5px solid var(--hairline)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 24, flexWrap: 'wrap' }}>
        <div style={style}>{sample}</div>
        <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-tertiary)' }}>{label}</span>
          {note && <span style={{ fontSize: 10, color: 'var(--ink-tertiary)' }}>{note}</span>}
        </div>
      </div>
    </div>
  );
}

export default function TokenTest() {
  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh', padding: '48px 32px', maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500, letterSpacing: '1.5px', color: 'var(--ink-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>
          Design token verification
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 24, fontWeight: 500, letterSpacing: '-0.2px', color: 'var(--ink)', marginBottom: 6 }}>
          Color tokens + typography
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--ink-secondary)', lineHeight: 1.7 }}>
          Confirms §2 color tokens and §3 type scale load correctly. CSS vars resolve via <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>:root</code>, Tailwind utilities via <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>@theme</code>.
        </div>
      </div>

      {/* ── Color tokens ── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 500, color: 'var(--ink)', marginBottom: 24 }}>
          Color tokens
        </div>
        {GROUPS.map(g => (
          <div key={g.label} style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-tertiary)', marginBottom: 12 }}>
              {g.label}
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {g.swatches.map(s => <Swatch key={s.name} {...s} />)}
            </div>
          </div>
        ))}
      </div>

      {/* ── Tailwind class smoke-test ── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 500, color: 'var(--ink)', marginBottom: 16 }}>
          Tailwind utility smoke-test
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-tertiary)', marginBottom: 16 }}>
          These boxes use Tailwind classes (<code style={{ fontFamily: 'var(--font-mono)' }}>bg-*</code> / <code style={{ fontFamily: 'var(--font-mono)' }}>text-*</code>). If they render correctly, <code style={{ fontFamily: 'var(--font-mono)' }}>@theme</code> is wired up.
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div className="bg-paper text-ink rounded-md" style={{ padding: '8px 14px', fontSize: 12, border: '0.5px solid var(--hairline)' }}>bg-paper · text-ink</div>
          <div className="bg-ember text-surface rounded-md" style={{ padding: '8px 14px', fontSize: 12 }}>bg-ember · text-surface</div>
          <div className="bg-stage text-stage-text rounded-md" style={{ padding: '8px 14px', fontSize: 12 }}>bg-stage · text-stage-text</div>
          <div className="bg-safe-bg text-safe-text rounded-md" style={{ padding: '8px 14px', fontSize: 12 }}>bg-safe-bg · text-safe-text</div>
          <div className="bg-fatal-bg text-fatal-text rounded-md" style={{ padding: '8px 14px', fontSize: 12 }}>bg-fatal-bg · text-fatal-text</div>
          <div className="bg-warn-bg text-warn-text rounded-md" style={{ padding: '8px 14px', fontSize: 12 }}>bg-warn-bg · text-warn-text</div>
          <div className="font-sans bg-surface-sunken text-ink-secondary rounded-md" style={{ padding: '8px 14px', fontSize: 12, border: '0.5px solid var(--hairline)' }}>font-sans</div>
          <div className="font-mono bg-surface-sunken text-ink-secondary rounded-md" style={{ padding: '8px 14px', fontSize: 12, border: '0.5px solid var(--hairline)' }}>font-mono</div>
        </div>
      </div>

      {/* ── Type scale ── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 500, color: 'var(--ink)', marginBottom: 8 }}>
          Type scale (§3)
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-tertiary)', marginBottom: 24 }}>
          Inter for UI · IBM Plex Mono for data. Weights 400 and 500 only.
        </div>

        <TypeRow
          label="Display · Inter 48px/500 / -0.5px"
          sample="Every crash tells a story"
          style={{ fontFamily: 'var(--font-sans)', fontSize: 48, fontWeight: 500, letterSpacing: '-0.5px', color: 'var(--ink)', lineHeight: 1.1 }}
        />
        <TypeRow
          label="H1 · Inter 24px/500 / -0.2px"
          sample="Scenario builder"
          style={{ fontFamily: 'var(--font-sans)', fontSize: 24, fontWeight: 500, letterSpacing: '-0.2px', color: 'var(--ink)' }}
        />
        <TypeRow
          label="H2 · Inter 18px/500"
          sample="Road and weather conditions"
          style={{ fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 500, color: 'var(--ink)' }}
        />
        <TypeRow
          label="Body · Inter 15px/400 / lh 1.7"
          sample="The crumple zone absorbed 42% of the kinetic energy before it reached the occupant cell."
          style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 400, color: 'var(--ink-secondary)', lineHeight: 1.7, maxWidth: 520 }}
        />
        <TypeRow
          label="Eyebrow · Inter 12px/500 / 1.5px / UPPERCASE"
          sample="IMPACT SPEED"
          style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-tertiary)' }}
        />
        <TypeRow
          label="Metric number · IBM Plex Mono 36px/500 / -0.5px"
          sample="42 km/h"
          style={{ fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 500, letterSpacing: '-0.5px', color: 'var(--ink)' }}
        />
        <TypeRow
          label="Data readout · IBM Plex Mono 13px/400"
          sample="d_reaction = 18.6 m · d_brake = 31.4 m · μ_eff = 0.712"
          style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 400, color: 'var(--ink-secondary)' }}
        />
        <TypeRow
          label="Caption · Inter 12px/400"
          sample="Above pedestrian fatality threshold. Euro NCAP reference data."
          style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 400, color: 'var(--ink-tertiary)' }}
        />

        {/* Signature stack */}
        <div style={{ marginTop: 32, background: 'var(--surface-sunken)', borderRadius: 'var(--r-md)', padding: 16, display: 'inline-block' }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-tertiary)', marginBottom: 4 }}>
            Impact speed
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 500, letterSpacing: '-0.5px', color: 'var(--ink)', lineHeight: 1 }}>
            42 km/h
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 400, color: 'var(--ink-tertiary)', marginTop: 4 }}>
            Above pedestrian fatality threshold
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-tertiary)', marginTop: 8 }}>↑ Eyebrow + metric-number + caption signature stack</div>
      </div>

      {/* ── Radius tokens ── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 500, color: 'var(--ink)', marginBottom: 16 }}>
          Border radii (§4)
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {[['--r-sm', 6], ['--r-md', 8], ['--r-lg', 12], ['--r-xl', 16]].map(([v, px]) => (
            <div key={v} style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 40, background: 'var(--ember-100)', border: '0.5px solid var(--ember-300)', borderRadius: `var(${v})`, marginBottom: 8 }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-tertiary)' }}>{v}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-tertiary)' }}>{px}px</div>
            </div>
          ))}
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 40, background: 'var(--ember-100)', border: '0.5px solid var(--ember-300)', borderRadius: 999, marginBottom: 8 }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-tertiary)' }}>pill</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-tertiary)' }}>999px</div>
          </div>
        </div>
      </div>

      {/* Stage dark panel */}
      <div style={{ background: 'var(--stage)', borderRadius: 'var(--r-xl)', padding: 32, marginBottom: 48 }}>
        <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--stage-muted)', marginBottom: 8 }}>
          Stage context
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 24, fontWeight: 500, color: 'var(--stage-text)', marginBottom: 12 }}>
          Warm dark surface
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--stage-muted)', lineHeight: 1.7, maxWidth: 480 }}>
          This is the Launch and Simulation stage background. Ember accent reads clearly against this warm near-black.
        </div>
        <button style={{ marginTop: 20, background: 'var(--ember)', color: 'var(--stage)', border: 'none', borderRadius: 'var(--r-sm)', padding: '12px 28px', fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
          Begin →
        </button>
      </div>

    </div>
  );
}
