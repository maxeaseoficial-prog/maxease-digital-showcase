# Redesign Phase 2: Premium Editorial Studio

Transition the MAXEASE Digital website into a high-end digital studio aesthetic, inspired by the "LinkedInPro" reference, focusing on strong graphic masses, integrated photography, and editorial composition.

## Phase 1: Style & Tokens Refinement
- Update `src/styles.css` to include `--color-off-white` and refine `--brand-blue` / `--brand-deep` saturation.
- Standardize spacing and radius tokens.
- Add utility for large brand typography ("MAXEASE" watermark).

## Phase 2: Navbar & Hero (Light Direction)
- Modify `Navbar` for clear background:
    - Logo: Switch to dark version or use filter for legibility on white.
    - Links: Navy/Slate.
    - CTA: Solid blue button.
- Redesign `Hero` in `src/routes/index.tsx`:
    - Background: Off-white with a large "MAXEASE" watermark or brand symbol.
    - Layout: 45% text (left), 55% visual (right).
    - Composition: Integrate Henrique's photo with system interfaces and geometric blue shapes (not floating cards).
    - Asymmetric and editorial feel.

## Phase 3: Transition & Services (Blue Block)
- Insert a **Navy Faixa** between Hero and Services:
    - Text: "ESTRATÉGIA · DESIGN · TECNOLOGIA · AUDIOVISUAL".
    - Overlapping the transition.
- Redesign `Services` section:
    - Background: Solid `brand-blue`.
    - Content: White text for contrast.
    - Cards: Grid with numbers, real assets (screenshots/frames), and clean typography.
    - Remove glassmorphism in favor of solid/subtle borders.

## Phase 4: Intermediate CTA & Social Proof
- Add an **Overlapping CTA card** (Off-white) between Services and the next section.
- Compact the `Clients` (Confiança) section:
    - Metrics row (compact).
    - Grid of logos (larger presence, monochrome with hover color).

## Phase 5: About (Integrated Composition)
- Redesign `About` section:
    - Asymmetric split: Photo (left) integrated/touching a large blue block (right).
    - Editorial text placement within the blue block.

## Phase 6: Final CTA & Footer (Navy Finish)
- Refine `CTA` section: Large headline, navy/blue composition.
- Redesign `Footer`:
    - Background: `brand-deep` (Navy).
    - White/Silver text and icons.
    - Compact vertical layout.

## Phase 7: Subpages & QA
- Apply the same visual language to `/sites` and `/audiovisual` routes.
- Thorough responsive testing across all viewports (Mobile first).
- Verify all animations (Reveal, Stagger) are subtle and controlled.

## Technical Details
- Use `framer-motion` for reveal and layout transitions.
- Ensure `QuoteModal` UI matches the new clean editorial look.
- Maintain all existing business logic and Supabase integration.
- Strictly avoid: particles, glow effects, neon, and AI-generated avatars.
