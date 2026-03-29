# Design System: The Cinematic Editorial Framework

## 1. Overview & Creative North Star
**Creative North Star: "The Master’s Desk"**

This design system moves beyond the utility of a standard text editor to create an environment that feels like a physical, high-end writing studio. We are blending the rigorous precision of a typewriter with the fluid, collaborative nature of modern digital workflows. 

To achieve this, we reject the "web template" aesthetic. Our layouts prioritize **intentional asymmetry**—where the script stays grounded in the center while collaborative tools float with a lighter, glass-like presence. We avoid rigid grids in favor of **Tonal Grouping**, using shifts in paper-like textures to define functional zones rather than heavy borders. The result is a high-precision tool that feels quiet, authoritative, and premium.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a "Modern Classic" intellectualism: Deep Indigo for authority, Warm Grey for the focus-intensive canvas, and Muted Gold for the "Director’s Note" moments of action.

### The "No-Line" Rule
**Explicit Instruction:** You are prohibited from using `1px solid` borders for sectioning or layout containers. 
Structure must be achieved through:
- **Background Shifts:** Placing a `surface-container-low` sidebar against a `surface` main area.
- **Negative Space:** Using the spacing scale (e.g., `8` or `12`) to create a natural "gutter" that the eye perceives as a boundary.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of paper and glass.
*   **The Base:** `surface` (#fbf9f6) is your desk.
*   **The Canvas:** The editor uses `surface-container-low` (#f5f3f0) to provide a warm, eye-friendly contrast for long-form writing.
*   **The Floating UI:** Collaborative panels use `surface-container-lowest` (#ffffff) with a `40%` opacity and a `12px` backdrop-blur to create a "Glassmorphism" effect that feels light and modern.

### Signature Textures
For Primary CTAs and the Header, do not use a flat indigo. Apply a **Subtle Deep Gradient**:
*   **Start:** `primary-container` (#1e2a5e)
*   **End:** `primary` (#061449) 
*   **Angle:** 135 degrees. This adds a "weighted" feel to the top of the interface, anchoring the screen.

---

## 3. Typography
We utilize a dual-font architecture to distinguish between the "Interface" (The Tool) and the "Content" (The Craft).

*   **UI Typography (Inter):** Used for navigation, labels, and metadata. 
    *   **Display/Headline:** Use `headline-sm` for section titles with tight letter-spacing (-0.02em) to create a refined, editorial look.
    *   **Labels:** `label-md` should always be in All-Caps with `+0.05em` letter-spacing when used for category headers to evoke a "script binder" aesthetic.
*   **The Script (Courier Prime):** Reserved strictly for the editor canvas. It represents the "truth" of the screenplay. It should never be used for UI elements like buttons or menus.

---

## 4. Elevation & Depth
Depth in this system is a result of **Tonal Layering**, not structural scaffolding.

### The Layering Principle
To separate a comment thread from the script:
1.  **Script Layer:** `surface-container-low`
2.  **Comment Card:** `surface-container-lowest`
3.  **Result:** The white card naturally "lifts" off the warm grey background without a single line being drawn.

### Ambient Shadows
For floating modals or pop-overs, use **Ambient Shadows**:
*   **Values:** `0 12px 32px rgba(27, 28, 26, 0.06)`
*   **Logic:** We use a tiny fraction of the `on-surface` color (a deep charcoal) rather than pure black to keep the shadow feeling like a natural occlusion of light.

### The "Ghost Border" Fallback
If a boundary is required for accessibility in a dense area, use a **Ghost Border**:
*   **Token:** `outline-variant`
*   **Opacity:** `20%`
*   **Rule:** Never use a 100% opaque border. It breaks the "high-end editorial" feel.

---

## 5. Components

### Buttons
*   **Primary:** Indigo gradient (Primary-Container to Primary) with `on-primary` text. Use `rounded-md` (0.375rem) to maintain a crisp, professional edge.
*   **Secondary:** `tertiary-fixed` (#ffddb2) background with `on-tertiary-fixed` text. This muted gold should be used sparingly for "Collaborative Actions" (e.g., Share, Invite).
*   **Tertiary:** Transparent background with `on-surface-variant` text. High-padding `px-4` to ensure a large hit-target without visual clutter.

### Cards & Script Modules
*   **Rule:** Forbid the use of divider lines. 
*   **Implementation:** Separate scenes or revisions using a `1.5rem` (Spacing 6) vertical gap. Use a subtle `surface-variant` color shift on hover to indicate interactivity.

### Collaborative Chips
*   **Style:** `surface-container-highest` background with `on-surface` text. 
*   **Detail:** Add a 2px left-accent border in `tertiary` (Muted Gold) to indicate active presence or a "Director’s Note."

### Input Fields
*   **Default State:** `surface-container-low` background, no border, `rounded-sm`.
*   **Active State:** A `2px` "Ghost Border" at 40% opacity and a subtle `0.125rem` Indigo glow.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical margins. If the script is centered, let the "Revision History" live in a wider right margin to give the eyes room to breathe.
*   **Do** use `surface-dim` for "inactive" or "archived" content to push it visually further away into the background.
*   **Do** use `tertiary` (Muted Gold) for "Finalized" or "Approved" statuses to provide a warm, rewarding visual cue.

### Don't
*   **Don't** use pure black (#000000) for text. Always use `on-surface` (#1b1c1a) to maintain the "ink on paper" softness.
*   **Don't** use standard "Information Blue" for alerts. Use the `primary` Indigo for all authoritative system messaging.
*   **Don't** use `9999px` (Full) roundedness for anything other than status dots. We want a "precision-cut" look, so stick to `sm` (0.125rem) and `md` (0.375rem).

---

## 7. Collaborative Component: "The Revision Ghost"
For the collaborative nature of this app, we introduce the **Revision Ghost**. When a collaborator is typing, their cursor is a thin line of `tertiary` (Gold), and their ghost-text appears at 50% opacity in `primary-fixed-dim` (Indigo). This differentiates "Proposed Text" from "Final Script" without the need for intrusive highlight boxes.