# Design System Specification: Modern Professional Screenwriting

## 1. Overview & Creative North Star: "The Digital Vellum"
The Creative North Star for this design system is **The Digital Vellum**. 

Screenwriting is an act of structured dreaming. This system moves away from the "gray-box" utility of legacy software and towards an editorial, high-end environment that feels like a premium physical writing room. We break the "template" look by using intentional asymmetry—offsetting the main manuscript against a wider gutter for notes—and employing high-contrast typography scales that make the UI feel like a published monograph rather than a database. By utilizing deep tonal depth instead of borders, we create a "focus funnel" that draws the eye naturally to the cursor.

## 2. Color & Tonal Surface Strategy
Our palette is rooted in the "Ink and Shadow" philosophy. We use deep charcoals to recede and soft whites to advance, with **Primary (#adc6ff)** acting as our "Electric Ink" to highlight the creative path.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or layout containment. 
*   **Correction:** Define boundaries solely through background color shifts. For example, the script navigator should sit on `surface_container_low`, while the main writing canvas sits on `surface`. This creates a sophisticated, seamless transition that feels architectural rather than "webby."

### Surface Hierarchy & Nesting
Treat the UI as a series of nested physical layers. 
*   **Base Layer:** `surface` (#131314) is your global floor.
*   **Structural Sections:** Use `surface_container_low` (#1b1b1c) for sidebars or secondary panels.
*   **Active Focus Areas:** Use `surface_container_highest` (#353436) for active modals or pop-overs.
*   **The Inset Rule:** To denote a "well" (like a search bar or code snippet), use `surface_container_lowest` (#0e0e0f).

### The Glass & Gradient Rule
To prevent the dark theme from feeling "flat" or "heavy," floating elements (like formatting bars or floating action buttons) must use **Glassmorphism**.
*   **Implementation:** Use `surface_variant` at 60% opacity with a `backdrop-filter: blur(20px)`.
*   **CTAs:** Use a subtle linear gradient from `primary` (#adc6ff) to `primary_container` (#005bc2) at a 135-degree angle to give buttons a "lit from within" glow.

## 3. Typography: The Editorial Contrast
We employ a "Dual-Tone" typographic approach: **Manrope** for the authoritative UI and **Plus Jakarta Sans** (treated with generous tracking) for the supportive metadata. (Note: The editor itself should utilize a high-end Monospace font—standard for screenwriting—but the UI framing follows the scale below).

*   **Display (Manrope):** Use for "Moment of Impact" screens (e.g., Title Page, Act Breaks). Large, bold, and airy.
*   **Headline & Title (Manrope):** Defines the "Modern Professional" tone. Use `headline-sm` (1.5rem) for Scene Headings in the navigator.
*   **Body (Plus Jakarta Sans):** Used for dialogue notes, character bios, and settings. This sans-serif provides a "Creative Focus" that contrasts against the rigid grid of the screenplay.
*   **Labels (Inter):** High-utility, small-scale text for technical metadata (FPS, Page Count, Scene Numbers). Use `label-md` (0.75rem).

## 4. Elevation & Depth: Tonal Layering
We do not use structural lines. We use light.

*   **The Layering Principle:** Depth is achieved by "stacking." A card does not get a border; it gets a slightly higher surface tier. A `surface_container_high` card sitting on a `surface_container` background creates a soft, natural lift.
*   **Ambient Shadows:** For floating menus or "The Script Page" view, use an ultra-diffused shadow: `box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4)`. The shadow color must be a tinted version of the background to ensure it feels like an occlusion of light rather than a dark stain.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., input focus), use `outline_variant` (#424752) at **20% opacity**. Never use 100% opaque lines.

## 5. Components: Style & Execution

### The Manuscript Card
*   **Style:** No borders. Background `surface_container_low`. 
*   **Spacing:** Use `spacing.8` (2.75rem) for internal padding to give the text "room to breathe."
*   **Interaction:** On hover, transition the background to `surface_container`.

### Primary Action Buttons
*   **Shape:** `roundedness.md` (0.375rem) for a professional, slightly sharp edge.
*   **Color:** Gradient of `primary` to `primary_container`. 
*   **Text:** `on_primary` (#002e69), All-Caps, `label-md` weight.

### Form Inputs & Text Areas
*   **Background:** `surface_container_lowest`.
*   **Focus State:** A "Glow" effect using a 1px `primary` shadow with 40% opacity. No solid stroke.
*   **Labeling:** Labels should be `body-sm` using `on_surface_variant` (#c2c6d4), positioned exactly `spacing.1` above the input.

### The Focus-Mode Toolbar (Special Component)
A floating, glassmorphic bar located at the bottom center of the viewport.
*   **Material:** `surface_bright` at 70% opacity + Blur.
*   **Radius:** `roundedness.full`.
*   **Spacing:** `spacing.1.5` between icons.

## 6. Do’s and Don’ts

### Do:
*   **Do** use `spacing.16` (5.5rem) or `spacing.20` (7rem) for "Executive White Space" between major sections.
*   **Do** use `tertiary` (#ffb691) sparingly for "Creative Spark" moments—like a new comment or a breakthrough note.
*   **Do** favor asymmetry. If the left sidebar is 240px, let the right sidebar be 320px to break the "standard app" feel.

### Don't:
*   **Don't** use dividers (`<hr>`). Use a `spacing.4` gap or a background color shift instead.
*   **Don't** use pure black (#000000). Always use our `background` (#131314) to maintain the "Ink" softness.
*   **Don't** use sharp corners for secondary elements. Stick to the `roundedness` scale to ensure the "Creative Focus" feels approachable.