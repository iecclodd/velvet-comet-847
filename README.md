# Velvet Comet 847

Azaan Noman’s portfolio. The project name is temporary.

Website: [velvet-comet-847.vercel.app](https://velvet-comet-847.vercel.app/)

Static portfolio with an interactive manta ray pond, responsive navigation, dark and light themes, and reduced-motion support. Content is based on the supplied Azaan Noman CV.

The silver-blue pixel manta is extracted from the user's selected concept image. Every ray keeps that original palette, with individualized spot patterns, wing rhythms, curiosity, boldness, cruise speed, and circling direction. A 20-node chain uses fixed-length links and damped angular joints, so turns travel gradually from head to tail. Head acceleration is eased, and wakes follow the visible trailing chain. Slow pointer movements attract curious rays; fast nearby movements startle them. Rays slow down and surface slightly while investigating a gentle cursor. Clicking or tapping open water drops food, attracts rays, and produces expanding ASCII ripples. Wakes, schooling, depth, and food consumption run in the simulation. A keyboard-accessible feed button is available in the skip-navigation sequence. Animation can be paused from navigation or the page footer.

The water has a very faint blue-green wash, a static procedural grain, and a capped field of tiny suspended particles. Nearby pointer movement gently stirs the particles. These effects are drawn behind the animals and dim beneath text; the original charcoal composition and ray palette remain intact.

The four navigation links remain visible at every screen size in a compact, translucent dock. Active links have a quiet fill and short underline, with theme and motion controls grouped separately.

The pond interaction and ASCII water model in `dist/pond.js` is adapted from the public browser-delivered reference at https://www.daoho.dev/; the animal rasterizer and app integration use the selected manta artwork. Reference analytics are excluded. The reference's colors and home-page composition are reproduced with the user's content; navigation uses a compact responsive dock.

Serve the `dist/` directory with any static server. There are no build dependencies.

The website uses hash routes: `#home`, `#research`, `#projects`, and `#about`. Research entries support deep links, such as `#research/flywire`.

Fonts: Geist Mono (Vercel) and Instrument Serif (Rodrigo Fuenzalida), distributed under the SIL Open Font License. Original font licenses are included under `dist/assets/`.

## Deployment

Vercel serves `dist/` as a static site. No dependency installation, build step, environment variables, or backend services are required. The production branch is `main`.
