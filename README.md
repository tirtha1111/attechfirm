# A&T TECH FIRM — Website (Vesper UI)

Building Digital Solutions for a Better Tomorrow.

A modern, single-page marketing website for **A&T TECH FIRM**, built with the
"Vesper" design language: pure black canvas, liquid-metal nav pills, glass
buttons, Instrument Serif italic accent words, scroll-reveal animations, and a
cinematic hero video background.

---

## What's inside

| File | Purpose |
| --- | --- |
| `public/vesper.html` | **The whole website.** A single self-contained HTML file (66 KB) with inline CSS + IIFE JavaScript. All A&T TECH FIRM content: Hero, Services (9 cards), Founders (Tirtharaj + Aditya), Why Choose Us (6 cards), Process (5 steps), Featured Project (Apex Chemistry), Pricing (3 packages), FAQ (8 items), Contact (info + working form), Footer. |
| `src/app/page.tsx` | Next.js route that serves `vesper.html` inside a fixed full-viewport iframe. |
| `src/app/layout.tsx` | Minimal black-shell root layout with A&T metadata + favicon. |
| `src/app/globals.css` | Tailwind 4 + design tokens (kept for the Next.js shell; the iframe is self-styled). |
| `package.json` | Dependencies & scripts (`dev`, `build`, `lint`). |
| `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `components.json` | Standard Next.js 16 + Tailwind 4 + shadcn/ui config. |
| `public/logo.svg`, `public/robots.txt` | Static assets. |

---

## Run it locally

```bash
bun install
bun run dev
```

Then open <http://localhost:3000>.

> The site is a **single self-contained HTML file** (`public/vesper.html`).
> You can also open that file directly in a browser — no server needed.

---

## Deploy to GitHub

1. Create a new repository on GitHub (e.g. `at-tech-firm`).
2. From this folder:
   ```bash
   git init
   git add .
   git commit -m "feat: A&T TECH FIRM website (Vesper UI)"
   git branch -M main
   git remote add origin https://github.com/<you>/at-tech-firm.git
   git push -u origin main
   ```
3. (Optional) Deploy on Vercel / Netlify — import the repo and it just works.

---

## Design tokens

```css
--bg:      #000000;   /* pure black, forced 3 layers deep */
--text:    #ffffff;
--muted:   #9a9a9a;   /* Instrument Serif italic accent */
--stat:    #d8d8d8;
--border:  rgba(255,255,255,0.16);
--card:    rgba(255,255,255,0.035);
```

Fonts: **Inter** (UI) + **Instrument Serif** italic (accents), loaded via Google Fonts.

---

## Sections (in order)

1. **Hero** — video bg, badge, H1 with serif-italic accent, lede, 2 CTAs, 3 stats
2. **Services** — 9 cards (Web Dev, Database, SEO, Cloud, UI/UX, Mobile, API, Analytics, Maintenance)
3. **Founders** — Tirtharaj Saha (Founder & CEO) + Aditya (Co-founder & CTO)
4. **Why Choose Us** — 6 cards
5. **Our Process** — 5 steps (Discover → Plan → Design → Build → Launch)
6. **Featured Project** — Apex Chemistry
7. **Pricing** — 3 packages (Starter, Growth, Enterprise)
8. **FAQ** — 8 collapsible items
9. **Contact** — info rows + working form (client-side validation)
10. **Footer** — links, socials, copyright

---

© A&T TECH FIRM. All rights reserved.
