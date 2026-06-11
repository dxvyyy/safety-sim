# Car Safety Sandbox Simulator — Design Specification

**Project:** Chasing Horsepower 2026 · LEAF Academy Term E
**Version:** 1.0
**Purpose:** This is the single source of truth for the visual and interaction design of the simulator. Every screen, component, color, and motion rule is defined here. Build against this document. When something is unspecified, follow the *spirit* stated in the Design Philosophy rather than inventing a new pattern.

---

## 1. Design Philosophy

The north star is: **make complex things feel simple and inevitable.** A non-expert should leave understanding how car safety works, and feel that it was effortless to learn. The reference standard is the calm, considered clarity of a well-made Apple or ASML experience.

Five principles govern every decision:

1. **One idea per screen.** Never show a parameter, number, or explanation until it is relevant. Complexity is revealed progressively, never front-loaded.
2. **Calm surface, deep interior.** The surface is spacious and quiet and invites interaction. Technical depth is always available one click away, never forced on the viewer.
3. **Plain language over jargon.** "Pulled you 12 cm back into the seat" — not "pretensioner actuation." The real number stays; the framing becomes human.
4. **Motion teaches, never decorates.** Animation is only used to explain causality or sequence (e.g. revealing safety systems in the order they fired). No bounce, no flourish, no motion that doesn't carry meaning.
5. **Color is earned.** The interface is near-monochrome. The accent does structural work; semantic colors (green/red/yellow) appear only to convey outcome meaning, so when red appears after a fatal crash, it lands.

The emotional arc of the whole experience is a journey through contrast: **calm light configuration → warm dark kinetic simulation → light results that resolve into a single earned color.** This contrast is intentional and is the spine of the storytelling.

---

## 2. Color Tokens

Define these as CSS custom properties on `:root`. Use the token names everywhere; never hard-code hex values in components.

### Ground (warm paper — the base of all light screens)

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#F7F4EE` | Page background on all light screens |
| `--surface` | `#FFFFFF` | Cards, raised panels |
| `--surface-sunken` | `#F1EDE5` | Inset wells, secondary metric backgrounds |

### Ink (warm near-black — text and primary actions)

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#1A1714` | Primary text, primary buttons, headings |
| `--ink-secondary` | `#5C554E` | Body text, secondary labels |
| `--ink-tertiary` | `#938B82` | Captions, hints, eyebrow labels, disabled |

### Hairlines (low-contrast borders)

| Token | Value | Use |
|---|---|---|
| `--hairline` | `rgba(26,23,20,0.10)` | Default borders, section dividers |
| `--hairline-strong` | `rgba(26,23,20,0.18)` | Hover borders, emphasis |

### Ember (the accent — engaged states, primary CTAs on dark, active controls)

| Token | Hex | Use |
|---|---|---|
| `--ember-50` | `#FBF0EA` | Tint backgrounds, hover fills on light |
| `--ember-100` | `#F5D9CB` | Selected-card tint |
| `--ember-300` | `#E89B73` | Light-mode borders on tinted elements |
| `--ember` | `#D8572A` | Core accent — engaged toggles, active selection ring, accent buttons |
| `--ember-600` | `#B8431C` | Hover / pressed accent |
| `--ember-800` | `#7C2D14` | Ember text on light tint backgrounds |
| `--ember-900` | `#4A1B0C` | Darkest, rare |

### Stage (warm dark — Launch hero + Simulation stage only)

| Token | Hex | Use |
|---|---|---|
| `--stage` | `#211C18` | Dark section background (hero, sim stage) |
| `--stage-elevated` | `#2A241F` | Panels/cards on the dark stage |
| `--stage-text` | `#F5EDE8` | Primary text on dark |
| `--stage-muted` | `#B0A09A` | Secondary text on dark |
| `--stage-hairline` | `rgba(245,237,232,0.12)` | Borders on dark |

### Semantic — outcome meaning ONLY (never decorative)

| Meaning | Core | Light bg | Text on light bg |
|---|---|---|---|
| Safe / survived (`--safe`) | `#2F8F5B` | `#E8F3EC` | `#1A5435` |
| Fatal / severe (`--fatal`) | `#C73E33` | `#FBEAE8` | `#7A2019` |
| Near-miss / caution (`--warn`) | `#E0A516` | `#FCF3DD` | `#6B4D08` |

> **Discipline note:** Active safety systems that are toggled ON use `--ember` (engaged = accent). In the Results screen, systems are recolored by *whether they helped*: a system that helped shows `--safe`, a missing system that hurt the outcome shows `--fatal`. Ember never appears in the same view as a results verdict color competing for attention — verdict colors win.

### Dark mode

Out of scope for v1. The contrast arc (light ↔ warm dark) is the design; a separate dark mode is not required. Do not build one unless explicitly requested later.

---

## 3. Typography

Load **Inter** for UI text and **IBM Plex Mono** for data readouts (both via Google Fonts). Two weights only: 400 (regular) and 500 (medium). Never use 600+ — it reads heavy. Sentence case everywhere; never Title Case, never ALL CAPS except eyebrow labels.

| Role | Font | Size | Weight | Spacing | Notes |
|---|---|---|---|---|---|
| Display (hero) | Inter | 40–56px | 500 | -0.5px | Launch screen only; scales down on mobile |
| H1 (screen title) | Inter | 24px | 500 | -0.2px | One per screen |
| H2 (section) | Inter | 18px | 500 | 0 | |
| Body | Inter | 15–16px | 400 | 0 | line-height 1.7 |
| Eyebrow label | Inter | 12px | 500 | 1.5px | UPPERCASE, `--ink-tertiary` |
| Metric number | IBM Plex Mono | 32–40px | 500 | -0.5px | Big quiet numbers (stats, impact speed) |
| Data readout | IBM Plex Mono | 13px | 400 | 0 | Physics values, distances |
| Caption | Inter | 12–13px | 400 | 0 | `--ink-tertiary` |

The **eyebrow + big-number + caption** stack is a signature pattern (e.g. "IMPACT SPEED" / "42 km/h" / "above pedestrian fatality threshold"). Reuse it for all headline metrics.

---

## 4. Spacing & Layout

8px base grid. Use these steps only: **4, 8, 12, 16, 24, 32, 48, 64px.**

- Component-internal gaps: 8, 12, 16px
- Vertical section rhythm: 24, 32, 48px
- Screen outer padding: 32px desktop, 20px mobile
- Max content width: 640px for single-column reading screens (Builder, Preview, Results narrative); full-bleed for the Simulation stage.

### Radii

| Token | Value | Use |
|---|---|---|
| `--r-sm` | 6px | Buttons, badges, inputs |
| `--r-md` | 8px | Small cards, wells |
| `--r-lg` | 12px | Cards, panels |
| `--r-xl` | 16px | Hero container, large feature blocks |
| pill | 999px | Toggle tracks only |

### Elevation

No drop shadows anywhere except: (a) functional focus rings `0 0 0 3px var(--ember-100)`, and (b) the frosted header may use a single hairline bottom border, no shadow. Depth comes from the paper/surface/hairline relationship, not shadows.

---

## 5. Components

### Frosted header (persistent, all screens)

- Height 56px, sits at top.
- Background `rgba(247,244,238,0.72)` with `backdrop-filter: blur(12px)`. On the dark Simulation stage, `rgba(33,28,24,0.72)` instead.
- Bottom border `0.5px solid var(--hairline)`.
- Left: project mark ("CHASING HORSEPOWER" eyebrow style) + current screen name in `--ink-secondary`.
- Right: contextual action (e.g. progress, or "View analysis").
- This translucent header is a deliberate signature detail — keep it.

### Primary button

- Light screens: background `--ink`, text `--surface`, `--r-sm`, padding 12px 28px, 15px/500.
- Dark stage: background `--ember`, text `--stage` (dark text on ember for contrast), same metrics.
- Hover: light → `#000`; ember → `--ember-600`. Active: `scale(0.98)`. Transition 150ms ease.
- Trailing arrow icon `ti-arrow-right` at 16px for forward navigation.

### Secondary / ghost button

- Transparent background, `0.5px solid var(--hairline-strong)` border, text `--ink-secondary`.
- Hover: background `--surface-sunken`. Active: `scale(0.98)`.

### Card

- Background `--surface`, `0.5px solid var(--hairline)`, `--r-lg`, padding 16px 20px.
- Hover (when interactive): border → `--hairline-strong`, 150ms.

### Selectable card (typology, vehicle, etc.)

- Default: card as above, with a leading Tabler outline icon at 22px in `--ink-tertiary`.
- Selected: border becomes `2px solid var(--ember)`, icon becomes `--ember`. (2px is the only allowed exception to the 0.5px border rule, used solely for selection.) No fill change — keep it quiet.
- Contains: icon, name (15px/500 `--ink`), one ≤5-word hook (13px `--ink-secondary`).

### Metric block (the signature stat)

- Eyebrow label (12px/500/uppercase `--ink-tertiary`).
- Number (IBM Plex Mono, 32px/500, color = `--ink` normally, or a semantic color in results).
- Optional caption (12px `--ink-tertiary`).
- Sits on `--surface-sunken`, `--r-md`, padding 16px. Used in grids of 2–4 with 12px gap.

### Toggle (active/passive systems)

- Track: pill, 36×20px. Off = `--hairline-strong` fill. On = `--ember` fill.
- Knob: 14px white circle, slides left↔right, 150ms ease.
- Label left, toggle right. Label color `--ink` when on, `--ink-secondary` when off.

### Slider

- Track 4px, `--hairline-strong`. Filled portion `--ember`. Thumb 18px white circle with `0.5px solid var(--hairline-strong)`.
- Label row above: name left (`--ink-secondary`), live value right (IBM Plex Mono, `--ink`).
- Always set `step` so the readout emits round values. Round every displayed number.

### Progress bar (Builder steps)

- Four equal segments, 3px tall, 6px gap, pill ends.
- Completed/current segment `--ink`; upcoming `--hairline`. No numbered pills — the bar alone communicates position, with a quiet "Step 2 of 4" eyebrow above.

### Eyebrow label

- 12px/500, uppercase, 1.5px letter-spacing, `--ink-tertiary`. Sits above titles and metrics. The connective tissue of the whole system.

### Badge / pill

- 11–12px, padding 3px 9px, `--r-sm`. On a semantic tint background, text uses that family's dark text token. Engaged state uses `--ember-50` bg + `--ember-800` text.

---

## 6. Motion

Allowed properties: `opacity`, `transform` (translateY, scale). Nothing else animates.

| Motion | Duration | Easing | Use |
|---|---|---|---|
| State/hover | 150ms | `ease` | Buttons, toggles, card borders |
| Screen transition | 300ms | `cubic-bezier(0.16,1,0.3,1)` | Fade + 8px upward slide between routes |
| Reveal stagger | 500ms per item, 600ms gap | `ease` | Results layered-defense reveal |
| Number count-up | 600ms | `ease-out` | Big metric numbers settling on final value |

The **Results reveal** is the single most important motion in the app. Safety systems appear one at a time, on a timeline, in the order they fired during the crash. The realization assembles in the viewer's mind because they watch it build. This is the "wow" moment — give it room and correct pacing. After all items reveal, a closing synthesis line fades in ("No single system saved you — they worked as one").

Respect `prefers-reduced-motion`: when set, skip stagger and count-ups; show final states immediately.

---

## 7. Screens

The flow is a sequence, but each screen is reachable by URL and a shared scenario link can deep-link to any point.

Routes: `/` (launch) · `/builder` · `/preview` · `/simulation` · `/results`

### 7.1 Launch (`/`) — dark stage

- Full `--stage` background. Optional very subtle static grid texture at ≤4% opacity (no animation).
- Centered: eyebrow ("CHASING HORSEPOWER · LEAF ACADEMY"), a display-size editorial statement that frames the thesis (e.g. "Every crash is a conversation between physics and engineering"), one quiet sentence, one ember primary button ("Begin"), and a row of three metric blocks (13 crash types / 20 real vehicles / 100% real physics) in `--stage` styling.
- Generous vertical space. Confidence is in the emptiness.

### 7.2 Builder (`/builder`) — light, 4 steps

Single column, max 640px. Frosted header shows "Scenario Builder" + "Step N of 4". Progress bar below header. Each step asks **one** question in plain words, shows sensible defaults so the user can always proceed, and hides advanced controls until requested.

- **Step 1 — Typology.** "What kind of crash?" Show the 4 most common types as selectable cards in a responsive grid; a quiet "Show all 13 types" expands the grid in place. Each card: icon + name + ≤5-word hook. First option selected by default.
- **Step 2 — Vehicle.** "Your vehicle." Type (cards), then sliders: speed, mass, tire condition, brake efficiency; tire type select; occupants; EV toggle (revealing an EV note when on). Show the loaded typology as a quiet reference card.
- **Step 3 — Conditions.** "Road, weather, scenario." Surface, road quality, geometry, weather (with a live μ/visibility readout well), obstacle type, distance, reaction time. Include a small **live physics preview** well that updates as sliders move (effective μ, reaction dist, brake dist, total stop, predicted outcome).
- **Step 4 — Systems.** "Safety systems." Two columns: Active (prevention) and Passive (survival) toggles; crumple-zone star rating; contextual notes when AEB on / belt off. On mobile, columns stack.

Footer: ghost "Back" left, ink "Continue/Review" right.

### 7.3 Preview (`/preview`) — light

- "Ready to simulate." Three cards: the typology (with its color accent), the user's full configuration summary, and the real-world vehicle match (name, Euro NCAP stars, mass, AEB status, one-line note, % match).
- A predicted-outcome banner (uses `--safe` or `--fatal` tint) showing total stopping distance vs obstacle distance.
- One ember primary button: "Run simulation." Caption: the engine will animate 4 camera angles in real time.

### 7.4 Simulation (`/simulation`) — dark stage

- Full `--stage` background — this is the kinetic heart, warm dark so the crash visualization reads like dusk/headlights.
- **Main camera** large on the left/top. **Four switchable camera thumbnails** (Top-down, Side, Driver POV, Rear chase) — clicking a thumbnail promotes it to main with a 300ms transition. Active thumbnail gets a 2px `--ember` border + "ACTIVE" tag.
- Below main: a thin progress bar (`--ember` fill) and a 4-up live physics strip (reaction dist, brake dist, impact speed, ΔV).
- When the run completes, the frosted header reveals an ember "View full analysis" button. On mobile, the thumbnail strip moves below the main view as a horizontal scroll row.

### 7.5 Results (`/results`) — light, the payoff

The investigative report. Structure top to bottom:

1. **Verdict header** — eyebrow (typology · speed), then the outcome in a semantic color ("You survived" `--safe` / "Fatal outcome" `--fatal`), plus injury-risk level on the right.
2. **The layered-defense reveal** (signature motion) — the safety systems that determined the outcome, appearing one at a time on a millisecond timeline, in plain language with the real number embedded. Closes with a synthesis line.
3. **Crash dynamics** — metric blocks (stopping distance, impact speed, KE, ΔV).
4. **Contributing factors** + **To survive this scenario** (only on collision).
5. **Field investigation notes** — a short auto-generated narrative in the voice of a crash investigator.
6. **Real-world parallel** — the NHTSA/IIHS/Euro NCAP context, clearly labelled as an educational approximation, plus "what this crash informs" engineering reforms.
7. **Physics deep dive** — collapsed by default; expands to the full raw calculation table for those who want it.

Footer actions: "Simulate again", "Change scenario", "New simulation".

Optional future echo of the ASML site's quiz: a "What would you change?" prompt that re-runs with one altered variable and shows the outcome shift. Nice-to-have, not v1-blocking.

---

## 8. Responsive Behavior

Mobile-first. Breakpoints: mobile `<640px`, tablet `640–1024px`, desktop `>1024px`.

- **Mobile:** everything single column, full-width controls, comfortable touch targets (min 44px). Builder grids → 1 column. Simulation camera thumbnails → horizontal scroll strip beneath the main view. Results → single column; deep-dive grid → 1 column.
- **Tablet:** two columns where the desktop uses more. Builder typology grid → 2 columns. Results → may stay single column for readability.
- **Desktop:** as specified above.

Sliders, toggles, and selects must be fully usable by touch. Test the Builder and Results on a real phone — they carry the most content.

---

## 9. Implementation Notes (for Claude Code)

- Stack: React + React Router (URL routes already wired) + Tailwind, built with Vite. Persist `cfg` and `res` to `sessionStorage` so refresh restores state.
- Put the tokens in §2 into the Tailwind theme (or CSS variables consumed by Tailwind) so components reference token names, not raw hex.
- Keep the existing physics engine, typology data, and vehicle database untouched — this spec changes only the presentation layer.
- Build the modular file structure: `constants/` (tokens, physics constants, typologies, vehicles), `physics/engine.js`, `components/ui/`, `components/cameras/`, `components/sprites/`, `screens/`.
- Round every number that reaches the screen.
- Honor `prefers-reduced-motion`.
- Icons: Tabler outline set only, sized 16–22px.

When in doubt on anything unstated, return to the five principles in §1.
