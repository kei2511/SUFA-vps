---
name: Serene Trust
colors:
  surface: '#f6fafa'
  surface-dim: '#F5F7F7'
  surface-bright: '#f6fafa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f4'
  surface-container: '#ebeeef'
  surface-container-high: '#e5e9e9'
  surface-container-highest: '#dfe3e3'
  on-surface: '#181c1d'
  on-surface-variant: '#3e494a'
  inverse-surface: '#2d3132'
  inverse-on-surface: '#eef1f1'
  outline: '#6e797a'
  outline-variant: '#bdc9ca'
  surface-tint: '#006970'
  primary: '#006067'
  on-primary: '#ffffff'
  primary-container: '#007b83'
  on-primary-container: '#d0fbff'
  inverse-primary: '#7ad5dd'
  secondary: '#006a63'
  on-secondary: '#ffffff'
  secondary-container: '#8bf1e6'
  on-secondary-container: '#006f67'
  tertiary: '#834718'
  on-tertiary: '#ffffff'
  tertiary-container: '#a05f2e'
  on-tertiary-container: '#fff1e9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#96f1fa'
  primary-fixed-dim: '#7ad5dd'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#8ef4e9'
  secondary-fixed-dim: '#71d7cd'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#00504a'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb785'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#6f3808'
  background: '#f6fafa'
  on-background: '#181c1d'
  surface-variant: '#dfe3e3'
  kemenkes-blue: '#00A9E0'
  status-success: '#2E7D32'
  status-error: '#D32F2F'
  status-warning: '#FBC02D'
  status-info: '#0288D1'
  text-muted: '#607D8B'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  question-text:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 30px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  code-invite:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 1.25rem
  gutter: 1rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 1.5rem
  section-gap: 2.5rem
---

## Brand & Style

The design system is centered on **Compassionate Authority**. As a mental health initiative under the Ministry of Health (Kemenkes RI), the interface must balance clinical reliability with human-centric empathy. The target audience includes individuals in potentially vulnerable states, healthcare providers, and administrators. 

The visual style is **Corporate / Modern** with a strong lean toward **Minimalism** to reduce cognitive load. By utilizing generous whitespace, soft transitions, and a structured card-based architecture, the design system minimizes anxiety and guides users through sequential tasks (like screening and counseling) with clarity and calm. The UI should feel supportive, non-judgmental, and inherently professional.

## Colors

The palette is anchored in **Teal and Deep Sea Blue** to evoke trust and tranquility. 

- **Primary**: A deep teal used for primary CTAs and brand identity, providing a sense of stability.
- **Secondary**: A softer aqua-teal for supportive actions and secondary navigation.
- **Surface & Neutrals**: We use a "dimmed" surface strategy (`#F5F7F7`) for backgrounds to reduce screen glare and create a soft environment for reading long-form guidance.
- **Semantic Logic**: Status colors follow standard healthcare conventions (Red for high urgency, Yellow for medium, Green for low/stable) but are slightly desaturated to avoid appearing aggressive.

## Typography

The design system employs a dual-font strategy to balance approachability with functional clarity.

- **Plus Jakarta Sans** is used for headlines and question text. Its soft, rounded terminals feel welcoming and modern, reducing the "clinical" coldness of the app.
- **Inter** is used for all body copy, forms, and technical labels. It provides exceptional legibility at small sizes and maintains a professional, neutral tone for instructions and chat.
- **Reading Comfort**: For the "Guide" sections, a "lega" (wide) line-height (1.6x) is mandated to ensure that users in distress can process information without feeling overwhelmed by dense text blocks.

## Layout & Spacing

This design system utilizes a **fluid grid** with strict contextual margins.

- **Mobile First**: A single-column layout is the standard for mobile, with 20px (`1.25rem`) side margins to give content breathing room.
- **Responsive Adaptations**: On tablets and desktops, the system transitions to a 12-column grid. Chat interfaces use a **70/30 split** (70% chat/content, 30% patient info/meta-data).
- **Sticky Elements**: Headers (for progress tracking in questionnaires) and Input areas (in chat) remain fixed to ensure essential controls are always within reach.
- **Vertical Rhythm**: We use a "generous" spacing model. Sections are separated by larger gaps to prevent the UI from feeling cluttered, which is critical for mental health applications.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows, maintaining a clean and lightweight feel.

- **Surface Levels**: The base background is `surface-dim`. Active content sits on pure white cards (`#FFFFFF`).
- **Cards**: Cards use a subtle 1px border (`#E0E4E4`) and a very soft, diffused shadow (4px blur, 2% opacity) to signify interactability without creating "visual noise."
- **Overlays**: Modals and Toasts use a standard backdrop blur (8px) to keep the user focused on the immediate task while maintaining context of their location in the app.

## Shapes

The shape language is **Rounded**, utilizing a 0.5rem (8px) base radius.

- **Standard Elements**: Buttons and Input fields use the base 8px radius to feel friendly but stable.
- **Large Components**: Main containers and "Section Cards" use `rounded-lg` (16px) to soften the overall appearance of the screen.
- **Avatars**: Always circular to represent the human element.
- **Progress Steppers**: Connecting lines in multi-step forms use a 4px thickness with rounded caps to feel substantial and clear.

## Components

### Buttons & Actions
- **Primary CTA**: High-contrast teal background with white text. Used for "Start Screening" and "Login."
- **Ghost/Secondary**: Transparent background with teal border. Used for "Back to Dashboard" or optional steps.
- **Pill Badges**: Used for urgency levels (e.g., "Urgent", "Medium"). These use the semantic colors with a 10% opacity background and 100% opacity text for high readability.

### Inputs & Feedback
- **Form Fields**: Solid 1px border. On error, the border thickens and changes to `status-error`. Labels are always visible above the field (not as placeholders only) for accessibility.
- **Questionnaire Choices**: When selected, the choice card gains a thick 2px primary color border and a subtle primary-tinted background.

### Navigation & Steppers
- **SUFA Stepper**: A vertical or horizontal path showing 3 distinct steps. Completed steps turn Green; the active step is Blue; upcoming steps are Neutral Grey.
- **Sticky Chat Input**: A clean, white bar at the bottom of the screen with a prominent "Send" arrow icon.

### Feedback Systems
- **Skeleton Screens**: Required for all data-fetching states to reduce perceived latency.
- **Toasts**: Success toasts appear at the top-center; error alerts appear as persistent banners if action is required.