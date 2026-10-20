# Star-free mountain background

Final project asset: `frontend/public/images/mountain-starless.webp` (1536×1024, 76,296 bytes).

Edit target: `frontend/public/images/quiet-stone.jpg`. The original is unchanged.

Tool: built-in `image_gen` editing. The generated PNG was inspected, then encoded to WebP at quality 84 with the project's existing Sharp dependency. Image content was not changed during encoding. The final background is displayed in grayscale by the component's CSS.

Exact final edit prompt:

> Edit target: the provided mountain night photograph. Remove EVERY star, bright dot, speck, the Milky Way band, and the diagonal shooting star from the SKY ONLY. Replace the whole sky with a clear, smooth, dark neutral charcoal night sky, with a very subtle natural gradient slightly lighter near the horizon. The sky must be completely empty and starless, with no clouds, galaxies, nebulae, noise-like speckling, or other objects. Preserve the exact original mountain ridgelines, snowy rocky surfaces, forest silhouettes, framing, and photographic realism. Keep the landscape fixed in its original position; do not redesign or move the mountains. Output the full photograph without text, UI, borders, or overlays. This is a background asset behind a separate animated star layer. No green or teal tint.

All visible star points in the website's sky are drawn separately in `PracticeStars`, making their motion, density, twinkling, and pause state controllable. The canvas is decorative and does not intercept button clicks.
