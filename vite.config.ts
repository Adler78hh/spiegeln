import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

/**
 * Nur Inhalte von der eigenen Adresse; Bilder auch als data:/blob: (Tierbilder,
 * Fotos, Zeichnungen). Keine Verbindungen zu fremden Servern.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join("; ");

export default defineConfig(({ mode }) => {
  // „Spiegeln gratis“ und „Zerlegen“ landen in Unterordnern der Vollversion
  // (gratis/, zerlegen/), jede Ausgabe mit eigenem Service Worker.
  const gratis = mode === "gratis";
  const zerlegen = mode === "zerlegen";
  const sub = gratis || zerlegen;
  const name = zerlegen ? "Zerlegen" : gratis ? "Spiegeln gratis" : "Spiegeln";
  const description = zerlegen
    ? "Blitzsehen, Zerlegen und Muster – Lern-App für die Grundschule"
    : "Achsensymmetrie entdecken – Lern-App für Klasse 1 und 2";
  return {
    base: "./",
    build: { outDir: sub ? `dist/${mode}` : "dist" },
    // Zerlegen hat eigene App-Symbole.
    publicDir: zerlegen ? "public-zerlegen" : "public",
    plugins: [
      react(),
      {
        name: "content-security-policy",
        apply: "build",
        transformIndexHtml: (html) =>
          html.replace(
            '<meta charset="UTF-8" />',
            `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`,
          ),
      },
      {
        name: "edition-title",
        transformIndexHtml: (html) =>
          html
            .replace("<title>Spiegeln</title>", `<title>${name}</title>`)
            .replace('content="Spiegeln"', `content="${name}"`)
            .replace(
              'content="Achsensymmetrie entdecken – Lern-App für Klasse 1 und 2"',
              `content="${description}"`,
            ),
      },
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: "auto",
        includeAssets: ["icon.svg", "apple-touch-icon.png"],
        manifest: {
          id: sub ? `./${mode}` : "./",
          name,
          short_name: name,
          description,
          lang: "de",
          start_url: "./",
          scope: "./",
          display: "standalone",
          orientation: "any",
          background_color: "#f6f1e7",
          theme_color: "#f6f1e7",
          icons: [
            { src: "pwa-192.png", sizes: "192x192", type: "image/png" },
            { src: "pwa-512.png", sizes: "512x512", type: "image/png" },
            {
              src: "pwa-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          // Alles, was die App braucht, wird beim ersten Besuch gespeichert.
          globPatterns: ["**/*.{js,css,html,svg,png,webmanifest}"],
          navigateFallback: "index.html",
          // Gratisversion und Zerlegen haben ihren eigenen Service Worker.
          navigateFallbackDenylist: sub ? [] : [/\/gratis\//, /\/zerlegen\//],
          globIgnores: sub ? [] : ["gratis/**", "zerlegen/**"],
          cleanupOutdatedCaches: true,
        },
      }),
    ],
    test: {
      include: ["src/**/*.test.ts"],
    },
  };
});
