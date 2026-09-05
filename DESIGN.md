# DealFlow360 - Design System & Visual Guidelines

Inspired by Odoo's clean enterprise aesthetics, DealFlow360 uses a structured, semantic design token system to ensure visual consistency, accessibility, and financial clarity across all surfaces.

---

## 1. Visual Character

The UI must feel:
- **Precise**: High data density with clean tabular alignments and crisp borders.
- **Trustworthy**: Clear status hierarchy, explicit policy explanations, and predictable state indicators.
- **Operational**: Designed for fast workflows (Sales Reps, Managers, Finance Leaders).
- **Financially Credible**: Unambiguous numbers, distinct margin/discount indicators, pair risk colors with explicit text labels and severity levels.
- **Calm & Intelligent**: Purposeful palette, balanced whitespace using an 8px grid system.

---

## 2. Color Tokens

### Primary Brand (Odoo-Inspired Enterprise Purple/Plum)
| Token | Hex Value | Description & Usage |
| :--- | :--- | :--- |
| `primary` / `--color-primary` | `#714B67` | Core Brand color, primary action buttons, active navigation states |
| `primary-hover` / `--color-primary-hover` | `#5F3D56` | Hover state for primary buttons and interactive elements |
| `primary-light` / `--color-primary-light` | `#F3E9F1` | Subtle background tint, active tab indicators, selected table rows |
| `primary-dark` / `--color-primary-dark` | `#374151` | Dark primary accents, high-contrast toggle headers |

### Secondary Palette
| Token | Hex Value | Description & Usage |
| :--- | :--- | :--- |
| `secondary` / `--color-secondary` | `#6C757D` | Secondary text, subtle icons, border accents |
| `secondary-light` / `--color-secondary-light` | `#F8F9FA` | Light gray surface background, table headers, container fills |
| `secondary-dark` / `--color-secondary-dark` | `#374151` | Dark text emphasis, dark card headers |

### Status & Feedback Colors
*Note: Risk and status must always pair color with text labels, numeric scores, and explicit explanations.*
| Token | Hex Value | Soft Background | Usage / Meaning |
| :--- | :--- | :--- | :--- |
| `success` / `--color-success` | `#28A745` | `#DCFCE7` / `#F0FDF4` | Approved quotes, low commercial risk, positive margin impact |
| `warning` / `--color-warning` | `#F59E0B` | `#FEF3C7` / `#FFFBEB` | Under review, moderate risk, policy threshold warnings |
| `danger` / `--color-danger` | `#DC3545` | `#FEE2E2` / `#FEF2F2` | Rejected, high risk violation, blocked deals, severe margin leak |
| `info` / `--color-info` | `#17A2B8` | `#E0F2FE` / `#F0F9FF` | In progress, submitted quotes, active fulfillment planning |

### Backgrounds & Surfaces
| Token | Hex Value | Description |
| :--- | :--- | :--- |
| `page-bg` / `--color-bg-page` | `#FFFFFF` | Main application viewport background |
| `surface` / `--color-surface` | `#F8F9FA` | Card containers, modal content, section panels |
| `muted-bg` / `--color-bg-muted` | `#F1F3F5` | Secondary card fills, disabled control backgrounds |
| `sidebar-bg` / `--color-sidebar` | `#1E293B` | Dark enterprise sidebar navigation |

### Text Colors
| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `text-primary` / `--color-text-primary` | `#212529` | Main body text, page titles, table cell primary text |
| `text-secondary` / `--color-text-secondary` | `#6C757D` | Subtitles, label text, secondary data points |
| `text-muted` / `--color-text-muted` | `#ADB5BD` | Disabled text, input placeholders, caption subtext |
| `text-inverse` / `--color-text-inverse` | `#FFFFFF` | Text on primary buttons, badges, and dark sidebars |

### Data Visualization & Charts
| Token | Hex Value | Color Name | Usage |
| :--- | :--- | :--- | :--- |
| `chart-blue` / `--color-chart-blue` | `#3B82F6` | Blue | Pipeline volume, total quotes |
| `chart-green` / `--color-chart-green` | `#22C55E` | Green | Closed deals, target margins |
| `chart-orange` / `--color-chart-orange` | `#F97316` | Orange | Pending approvals, high discount volume |
| `chart-purple` / `--color-chart-purple` | `#8B5CF6` | Purple | Upsell revenue, recurring ARR |
| `chart-pink` / `--color-chart-pink` | `#EC4899` | Pink | Anomaly flags, contract overrides |

---

## 3. Elevation & Shadows

| Token | Box Shadow Definition | Application |
| :--- | :--- | :--- |
| `shadow-none` | `none` | Flat inputs, inline badges |
| `shadow-sm` | `0 1px 2px 0 rgba(0, 0, 0, 0.05)` | Standard buttons, input focus states |
| `shadow-default` (`shadow`) | `0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)` | Standard cards, section containers |
| `shadow-md` | `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)` | Dropdown menus, popovers, floating bars |
| `shadow-lg` | `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)` | Modals, major focus dialogs, drawer panels |

---

## 4. Typography System

**Font Family**: `Inter`, system-ui, -apple-system, sans-serif

### Weight Scale
- **Light (`300`)**: Subtle captions, fine subtext.
- **Regular (`400`)**: Standard body text, form field text, table values.
- **Medium (`500`)**: Subheadings, table headers, tab titles, badge labels.
- **Semibold (`600`)**: Card headers, section titles, primary button text.
- **Bold (`700`)**: Page titles, metric highlights, key modal headings.

### Size & Line-Height Scale
| Class | Font Size | Line Height | Example / Recommended Use |
| :--- | :--- | :--- | :--- |
| `text-5xl` | `48px` (`3rem`) | `60px` (`3.75rem`) | Display title (`DealFlow360` hero banner) |
| `text-4xl` | `36px` (`2.25rem`) | `44px` (`2.75rem`) | Dashboard headers (`Sales Pipeline`) |
| `text-3xl` | `30px` (`1.875rem`) | `38px` (`2.375rem`) | Entity title (`Opportunity Details`, Quote #) |
| `text-2xl` | `24px` (`1.5rem`) | `32px` (`2rem`) | Card headers (`Customer Information`) |
| `text-xl` | `20px` (`1.25rem`) | `28px` (`1.75rem`) | Section titles (`Line Items`, `Approval Chain`) |
| `text-lg` | `18px` (`1.125rem`) | `26px` (`1.625rem`) | Sub-section headers (`Card Title`) |
| `text-base` | `16px` (`1rem`) | `24px` (`1.5rem`) | Standard body text, main input text |
| `text-sm` | `14px` (`0.875rem`) | `20px` (`1.25rem`) | Form field labels, table cell content, secondary text |
| `text-xs` | `12px` (`0.75rem`) | `16px` (`1rem`) | Captions, status badges, helper subtext, timestamps |

---

## 5. Spacing System (8px Grid)

Consistent rhythm across margins, paddings, and component gaps:
- `4px` (`spacing-1` / `0.25rem`): Micro gaps, badge paddings
- `8px` (`spacing-2` / `0.5rem`): Small gaps, button vertical padding
- `12px` (`spacing-3` / `0.75rem`): Form field padding, compact card gaps
- `16px` (`spacing-4` / `1rem`): Standard container padding, form field spacing
- `24px` (`spacing-6` / `1.5rem`): Card padding, section gaps
- `32px` (`spacing-8` / `2rem`): Major panel padding, grid spacing
- `48px` (`spacing-12` / `3rem`): Page section margins
- `64px` (`spacing-16` / `4rem`): Outer layout margins

---

## 6. Border Radius

| Token | Value | Applied Elements |
| :--- | :--- | :--- |
| `radius-none` (`rounded-none`) | `0px` | Full-bleed tables, grid dividers |
| `radius-sm` (`rounded-sm`) | `4px` | Tags, tooltips, small status pills |
| `radius-default` (`rounded`) | `6px` | Buttons, text inputs, select boxes |
| `radius-md` (`rounded-md`) | `8px` | Cards, dropdown menus, alert boxes |
| `radius-lg` (`rounded-lg`) | `12px` | Modals, major summary containers |
| `radius-full` (`rounded-full`) | `9999px` | User avatars, circular progress nodes, pill tags |

---

## 7. Borders & Dividers

- **Default Border**: `1px solid #E5E7EB` (`border-gray-200`) - standard card borders, table dividers.
- **Hover Border**: `1px solid #D1D5DB` (`border-gray-300`) - input hover, card hover state.
- **Focus Border**: `2px solid #714B67` (`border-primary`) - focused inputs, active selection outlines.
- **Error Border**: `1px solid #DC3545` (`border-danger`) - form field validation errors.

---

## 8. Core Component Patterns

### Buttons
- **Primary**: Background `#714B67`, Text `#FFFFFF`, Hover `#5F3D56`. Used for main workflow actions (e.g., *Submit Quote*, *Approve Deal*, *Confirm Order*).
- **Secondary**: Background `#F8F9FA`, Border `1px solid #E5E7EB`, Text `#212529`. Used for secondary choices (e.g., *Cancel*, *Save Draft*).
- **Success**: Background `#28A745`, Text `#FFFFFF`. Used for positive actions (e.g., *Approve*).
- **Warning**: Background `#F59E0B`, Text `#FFFFFF`. Used for review actions.
- **Danger**: Background `#DC3545`, Text `#FFFFFF`. Used for destructive or rejection actions (e.g., *Reject Deal*).
- **Outline**: Transparent background, Border `1px solid #E5E7EB`, Text `#212529`.
- **Ghost**: Transparent background, Text `#6C757D`, Hover background `#F8F9FA`.

### Status Badges & Tags
- **Draft**: Soft Gray (`#F1F3F5` BG, `#6C757D` Text)
- **Submitted / In Progress**: Soft Blue (`#E0F2FE` BG, `#17A2B8` Text)
- **Under Review**: Soft Yellow (`#FEF3C7` BG, `#D97706` Text)
- **Approved**: Soft Green (`#DCFCE7` BG, `#166534` Text)
- **Rejected**: Soft Red (`#FEE2E2` BG, `#991B1B` Text)

### Banners & Alerts
- **Success Alert**: Green border `#28A745`, Soft green BG `#F0FDF4`, Dark green text `#166534`.
- **Warning Alert**: Yellow border `#F59E0B`, Soft yellow BG `#FFFBEB`, Dark yellow text `#92400E`.
- **Error Alert**: Red border `#DC3545`, Soft red BG `#FEF2F2`, Dark red text `#991B1B`.

---

## 9. Code Implementation Reference

All design tokens are implemented in `apps/web/src/styles/index.css` using standard CSS Custom Properties and Tailwind CSS v4 `@theme` bindings.

