# 🎨 Aarogya Unified Design System

This design specification establishes a premium, consistent visual theme across the Aarogya patient and clinician interfaces.

---

## 🎨 Theme: "Emerald Aura"

The primary theme uses vibrant Emerald greens associated with health, clean Slate greys representing medical professionalism, and glassmorphic translucent layers that keep the interface looking lightweight, responsive, and modern.

### Colors (HSL)
*   **Primary (Emerald)**: `hsl(158, 84%, 37%)` — The core action color.
*   **Primary Focus**: `hsl(158, 84%, 30%)` — Hover and active button states.
*   **Primary Light**: `hsl(158, 84%, 96%)` — Soft backgrounds and tag highlights.
*   **Neutral Dark**: `hsl(215, 25%, 15%)` — Body text.
*   **Neutral Light**: `hsl(210, 40%, 98%)` — Page backgrounds.
*   **Accent Blue**: `hsl(200, 95%, 40%)` — Patient tracking metrics.
*   **Accent Violet**: `hsl(262, 80%, 50%)` — Doctor profile indicators.

---

## 🏛️ Base Component Standards

To keep the UI identical across all pages, components must utilize the following styling guidelines:

### 1. Cards (Glassmorphism & Shadows)
*   **Style**: Pure white or translucent background, thin borders, and soft shadows.
*   **Tailwind Classes**:
    ```html
    bg-white/85 backdrop-blur-md border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300
    ```

### 2. Buttons
*   **Primary Buttons**: High-contrast Emerald backgrounds, white text, and subtle hover scaling.
    ```html
    bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl px-5 py-2.5 transition active:scale-95
    ```
*   **Secondary Buttons**: Light background, grey text, and clear borders.
    ```html
    bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold rounded-xl px-5 py-2.5 transition
    ```

### 3. Form Inputs
*   **Style**: Refined outlines with generous horizontal padding, distinct placeholders, and glowing focus rings.
    ```html
    w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition
    ```

### 4. Tables & Lists
*   **Style**: Aligned columns, clean horizontal separators, and highlighted active/hover items.
    ```html
    divide-y divide-slate-100 bg-white rounded-2xl border border-slate-100 overflow-hidden
    ```

---

## 📈 Queue Indicators

Special priority styles are allocated to tokens and wait timers:
*   **Active Patient**: Emerald border pulse `border-emerald-500 ring-2 ring-emerald-500/10`.
*   **Large Counters**: High contrast monospace weights (`font-mono tracking-tight font-extrabold`).
