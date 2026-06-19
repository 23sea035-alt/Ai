---
name: Aether Intelligence
colors:
  surface: '#0e1323'
  surface-dim: '#0e1323'
  surface-bright: '#34394a'
  surface-container-lowest: '#080d1d'
  surface-container-low: '#161b2b'
  surface-container: '#1a1f30'
  surface-container-high: '#25293a'
  surface-container-highest: '#2f3446'
  on-surface: '#dee1f9'
  on-surface-variant: '#c9c4d8'
  inverse-surface: '#dee1f9'
  inverse-on-surface: '#2b3041'
  outline: '#928ea1'
  outline-variant: '#484555'
  surface-tint: '#c9bfff'
  primary: '#c9bfff'
  on-primary: '#2e009c'
  primary-container: '#917eff'
  on-primary-container: '#28008a'
  inverse-primary: '#5d3fe0'
  secondary: '#8fd8ff'
  on-secondary: '#003548'
  secondary-container: '#00c1fd'
  on-secondary-container: '#004b65'
  tertiary: '#ffb77d'
  on-tertiary: '#4d2600'
  tertiary-container: '#d57a1e'
  on-tertiary-container: '#432100'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e5deff'
  primary-fixed-dim: '#c9bfff'
  on-primary-fixed: '#1a0063'
  on-primary-fixed-variant: '#441cc8'
  secondary-fixed: '#c2e8ff'
  secondary-fixed-dim: '#75d1ff'
  on-secondary-fixed: '#001e2b'
  on-secondary-fixed-variant: '#004d67'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#0e1323'
  on-background: '#dee1f9'
  surface-variant: '#2f3446'
  accent-glow: '#B388FF'
  surface-gradient-start: '#0B1020'
  surface-gradient-mid: '#121A35'
  surface-gradient-end: '#1A1F4B'
  glass-stroke: rgba(255, 255, 255, 0.12)
  glass-fill: rgba(255, 255, 255, 0.04)
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
  title-md:
    fontFamily: Sora
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Manrope
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Manrope
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.1em
  caption:
    fontFamily: Manrope
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-margin: 20px
  gutter: 16px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 40px
---

## Brand & Style

The design system is centered on the concept of "Luminous Intelligence"—an experience that feels both ethereal and deeply grounded in human connection. It targets a sophisticated audience seeking an AI companion that feels like a premium digital entity rather than a utility tool.

The aesthetic is **Futuristic Glassmorphism**. It leverages high-depth translucency, vibrant background blurs, and "light-leak" accents to simulate a multi-dimensional interface. The interface should feel like a sentient layer of light floating over a deep, infinite void. Interaction is characterized by organic transitions, soft glows that respond to touch, and a sense of weightlessness.

## Colors

The color palette utilizes a **Deep Dark Gradient** foundation to create a sense of vastness and mystery. 

- **Primary & Secondary:** These are the "energy" colors. Use the Purple (#7B61FF) for core actions and the Blue Neon (#00C2FF) for secondary intelligence cues or data visualizations.
- **Accent Glow:** This color should be reserved for interactive feedback and "aura" effects around the AI persona.
- **Background Strategy:** Do not use flat colors. All views should utilize the defined gradient (`#0B1020` to `#1A1F4B`) with a subtle noise texture (3-5% opacity) to prevent banding and add a tactile, premium feel.

## Typography

This design system uses a trio of typefaces to balance futurism with readability.

- **Sora** (Headlines): Chosen for its geometric precision and modern "tech-luxury" feel. Use it for all major headings and display text.
- **Manrope** (Body): Provides a human-centric, highly legible experience for long-form AI chat and descriptions.
- **JetBrains Mono** (Labels): Used sparingly for technical metadata, timestamps, and "system status" indicators to reinforce the AI architecture theme.

**Visual Treatment:** Headlines should occasionally use a subtle linear gradient (White to Primary) to add depth.

## Layout & Spacing

This design system follows a **Fluid Content Model** optimized for high-end mobile devices. 

- **Grid:** Use a 4-column grid for mobile with 20px side margins. 
- **Floating Architecture:** Most elements should not touch the edges of the screen. Instead, use "floating cards" with a consistent margin from the screen edge to create a sense of the UI hovering in space.
- **Safe Areas:** Strictly adhere to iOS safe areas, but allow background blurs and gradients to bleed into the notch and home indicator areas for full immersion.

## Elevation & Depth

Depth is not communicated via traditional black shadows, but through **Tonal Luminance and Backdrop Blurs**.

- **Surface Levels:** 
  - *Base:* Deep gradient background.
  - *Level 1 (Cards):* Glassmorphism surface (10% white opacity) with `backdrop-filter: blur(20px)`.
  - *Level 2 (Modals/Popovers):* 15% white opacity with `backdrop-filter: blur(40px)` and a 1px inner stroke of `glass-stroke`.
- **Glow Effects:** Instead of drop shadows, use "Outer Glows" for active elements. Use the primary color at 20% opacity with a 30px blur to make active buttons appear as if they are emitting light onto the background.

## Shapes

The shape language is inspired by **Apple's Squircle (Continuous Curvature)**. 

- **Standard Containers:** Use 24px (1.5rem) for main cards to match the friendly yet sophisticated "iOS 26" aesthetic.
- **Buttons:** Fully pill-shaped (rounded-full) to provide a soft, tactile target that feels distinct from the structured grid.
- **Interactive Strokes:** All glass containers must feature a 1px border. The top and left borders should be slightly brighter than the bottom and right to simulate a light source coming from the top-left.

## Components

- **The Aura Button:** The primary call-to-action is a pill-shaped button with a gradient fill (Primary to Secondary). It features an animated "border-flow" glow that rotates slowly when the AI is processing.
- **Glass Cards:** Use for chat bubbles and dashboard widgets. They should feature a "frost" texture and a subtle 1px white border at 12% opacity.
- **Input Field:** A minimalist, bottom-docked bar that appears floating. It uses a high-blur glass effect and contains a "Waveform" indicator that reacts to voice or text input.
- **Chips:** Small, semi-transparent capsules used for suggested replies. On hover/tap, they should transition from glass to a solid Neon Blue glow.
- **Floating Modals:** Use "Sheet" patterns for settings, but ensure they don't cover the full screen; keep the background "Aura" visible to maintain context.
- **Persona Avatar:** AI avatars should never be static circles. They should be "Orb" components with internal mesh gradients and soft, pulsating glow animations that sync with the AI's "heartbeat" or speech patterns.