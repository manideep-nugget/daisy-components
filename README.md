# Fluent Studio

A stakeholder showcase of 18 interactive component families and three enterprise blocks, built with open-source Fluent UI React, TypeScript, and Vite.

Run `npm install`, then `npm run dev` to open the showcase. `npm run build` checks TypeScript and creates the production build; `npm run lint` runs Oxlint.

Appearance supports Light, Dark, and System, with independently authored teal, blue, and purple accents. Only theme preferences are stored in the browser. Project and settings demos use local sample data and reset on reload.

Reusable pieces live in `src/components`, enterprise compositions in `src/components/blocks`, and the provider and palettes in `src/theme`. The screenshot is a visual reference only; the app contains no Fabric packages or assets.

Tabster is pinned to 8.8.0 to keep Fluent's keyboard-focus dependencies on a single compatible Keyborg version.
