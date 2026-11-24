# Adi Narayanan, personal website

A one-page personal site built with Next.js (App Router), React 19, TypeScript and Tailwind CSS v4.
Every illustration is drawn live on a canvas by a small pixel-art engine. There is no backend: the
whole site is static.

## Run it locally

```bash
npm install
npm run dev   # http://localhost:3000
```

Other scripts:

- `npm run build`: production build
- `npm run start`: serve the production build
- `npm run typecheck`: type-check without emitting

## Where things live

| Path | What it is |
| --- | --- |
| `lib/data.ts` | All copy: headline, projects, eras, about, stack, links. |
| `components/site/` | The page sections (Hero, Work, Eras, About, Contact), the section rail and their pieces. |
| `components/pixel/` | `PixelField` (the ambient hero/contact field) and `PixelScene` (the project diagrams). |
| `lib/scenes/` | One file per animated scene, drawn with the tiny `Gfx` renderer in `engine.ts`. |
| `lib/pixel.ts` | Noise, dithering and masks shared by the live field and the generated OG image. |
| `app/opengraph-image.tsx` | Social card, generated at build time. |

## Things to find

- **DJ mode:** type `dj` anywhere, or press play on the DJing card. A short house loop is synthesized
  in the browser (`lib/dj.ts`, no audio files); the pixel fields pulse, a spectrum runs along the
  bottom and the section rail becomes a level meter. Escape stops it.
- **Time travel:** drag along the eras timeline (or focus it and use the arrow keys) to pull the
  "now" marker back. The chapters you were in at that moment light up.
- **Redacted:** the stealth chapter stays under marker bars. Hovering decodes about half of it.

## Editing content

Change text in `lib/data.ts`. To add a project, add an entry to `projects` or `moreProjects`. Then
point its `scene` at an existing scene, or add a new scene under `lib/scenes/` and register it in
`lib/scenes/index.ts`.

## Environment variables

None are required. `NEXT_PUBLIC_SITE_URL` (see `.env.example`) sets the canonical URL if you use a
custom domain.

## Deploying

The site is built for Vercel: import the repo and deploy. If you add a custom domain, set
`NEXT_PUBLIC_SITE_URL` to it so canonical URLs, OG tags, `robots.txt` and the sitemap point at it.
