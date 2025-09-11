Favicons in this app

- Put your site icon files in `public/` so Vite serves them at the root.
- Supported files (use any that you have):
  - `favicon.ico` (ICO, multi-size, broadest compatibility)
  - `favicon.png` (recommend 32×32 or 48×48)
  - `favicon.svg` (crisp on all DPIs; modern browsers)
  - `apple-touch-icon.png` (usually 180×180 for iOS home screen)

The HTML includes link tags for ICO, PNG, SVG, and Apple Touch. Browsers will pick the best match automatically if the file exists.

Replace the placeholder files that say "Couldn't find the requested file ..." with real image files. If you only have a PNG, name it `public/favicon.png` and it will be used.

