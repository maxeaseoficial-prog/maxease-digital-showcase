# Plan: Redesign Portfolio/Projects Area for `/sites`

The goal is to replace the current YouTube video-based showcase in the `/sites` route with a premium, interactive "WebsiteShowcase" component. This component will feature built-in (HTML/CSS) mockups for Desktop and Mobile, hosting interactive iframes of the real sites.

## Proposed Changes

### 1. Identify Data and Remove Legacy Content
- Identify the existing projects data in `src/routes/index.tsx`.
- Remove the YouTube-based showcase logic from the `Sites` component in `src/routes/index.tsx`.
- Clean up unused imports and arrays related to the old YouTube videos in `/sites`.

### 2. Create Reusable Showcase Component
- Create a new component `WebsiteShowcase` (or similar) within `src/routes/index.tsx` (or a separate file if it grows too large, but keeping it in `index.tsx` for now to match current patterns).
- **Mockup Construction:** Build minimalist, premium frames for Desktop (Monitor) and Mobile (Smartphone) using Tailwind CSS.
- **Iframe Logic:**
  - **Desktop:** Viewport scale strategy (e.g., simulate 1440px width scaled down to fit the mockup) to avoid mobile breakpoints.
  - **Mobile:** Viewport simulation (e.g., 390px width).
  - **Interactivity:** Ensure iframes are interactive (scroll, clicks) while providing a "Explore Project" hint.
- **Performance:** Implement `loading="lazy"` and an `IntersectionObserver` (or `framer-motion` viewport detection) to only mount iframes when in view.

### 3. Implement Fallback Strategy
- Detect if a site allows embedding (or define a list of projects with fallback assets).
- If blocked by CSP/X-Frame-Options, show a high-quality static preview (if available) or a styled placeholder with an "Open Project" link.

### 4. Layout & Motion
- **Composition:** 70-75% Monitor, 25-30% Smartphone with slight overlap for depth.
- **Motion:** Staggered entry animation using Framer Motion (opacity + translate).
- **Responsive Design:** 
  - Desktop: Side-by-side/Overlapping.
  - Tablet/Mobile: Stacked vertically or toggle-able views to avoid horizontal overflow and "scroll traps".

### 5. Update `/sites` Route
- Pass the actual project data (URLs, titles, descriptions) to the new `WebsiteShowcase` component.

## Technical Details

- **Visual Style:** Navy deep background, graphite/navy frames, subtle blue MaxEase accents.
- **Interactivity:** `pointer-events-auto` on iframes with a clear "Visit Site" link.
- **Accessibility:** Proper `title` tags for iframes and accessible links.

## Success Criteria
- [ ] No more YouTube videos on `/sites`.
- [ ] Real, interactive sites visible inside custom mockups.
- [ ] Desktop and Mobile versions of the same URL shown simultaneously.
- [ ] Smooth entry animations and no performance lag.
- [ ] Fallback working for restricted domains.
- [ ] `/audiovisual` remains unchanged.
