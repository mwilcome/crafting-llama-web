# 🎨 SCSS Architecture – The Crafting Llama

## 📁 Structure

```

styles/
├── \_theme.scss           # Design tokens (colors, spacing, typography)
├── \_utilities.scss       # Mixins, helper functions
├── \_base.scss            # Base element resets and HTML defaults
├── final-extends.scss    # Extendable shared class styles (btn, card, etc.)
├── ui/                   # UI component layouts (layout, typography, etc.)
├── index.scss            # Centralized `@forward` layer

```

---

## 🎯 Token System

### Colors (`$color-*`)
- `$color-accent`, `$color-bg`, `$color-muted`, `$color-error`, `$color-surface`, `$color-gray-100`

### Spacing (`$space-*`)
- `$space-xs` to `$space-2xl`, aligned to `4px` increments

### Typography
- `$font-xs` to `$font-2xl`, `$font-heading`, `$font-body`
- `$weight-normal`, `$weight-medium`, `$weight-semibold`, `$weight-bold`

### Radius & Shadows
- `$radius-sm`, `$radius-md`, `$radius-lg`, `$radius-full`
- `$shadow-sm`, `$shadow-md`, `$shadow-lg`, `$shadow-xl`

---

## ✅ Global Utilities

These are available globally and can be extended via `@extend` or used directly:

- `.btn`, `.btn-primary`, `.btn-outline`
- `.card`, `.section`, `.container`

> Use `@extend .btn-primary !optional;` or prefer utility mixins for large layouts.

---

## 🧩 Component SCSS Guidelines

- Always use `@use '../index' as *;`
- Prefer class scoping like `.order-summary`, `.variant-card`, etc.
- Avoid `var(--*)`, inline hex, or pixel spacing.
- Use mixins/utilities from `_utilities.scss` when possible.

---
