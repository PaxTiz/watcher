import { randomBytes } from "node:crypto";

const SECURITY_HEADERS = {
  // Force HTTPS
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",

  // Prevent browser content type sniffing
  "X-Content-Type-Options": "nosniff",

  // Prevent clickjacking
  "X-Frame-Options": "DENY",

  // Prevent URL leaking for external redirections
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Don't enable useless browser features
  "Permissions-Policy": `camera=(), microphone=(), geolocation=(), payment=(), usb=(), fullscreen=(self "https://www.youtube-nocookie.com" "https://www.youtube.com")`,

  // Don't allow popups except on same origin
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",

  // Don't allow other apps to load ressources
  "Cross-Origin-Resource-Policy": "same-origin",
};

// Non-HTML responses (API, assets) never need to load anything
const DEFAULT_CSP = "default-src 'none'; frame-ancestors 'none'";

// Block unauthorized content sources
const page_csp = (nonce: string) =>
  [
    "default-src 'self';",
    `script-src 'self' 'nonce-${nonce}' https://www.youtube.com;`,
    "style-src 'self' 'unsafe-inline';",
    "img-src 'self' data: blob: https://i.ytimg.com;",
    "media-src 'self' blob:;",
    "worker-src 'self' blob:;",
    "connect-src 'self';",
    "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://player.twitch.tv;",
    "frame-ancestors 'none';",
    "base-uri 'self';",
    "form-action 'self' https://accounts.google.com https://id.twitch.tv;",
    "object-src 'none';",
    "upgrade-insecure-requests",
  ].join(" ");

export default defineNitroPlugin((app) => {
  app.hooks.hook("request", (event) => {
    const headers = { ...SECURITY_HEADERS, "Content-Security-Policy": DEFAULT_CSP };
    event.node.res.setHeaders(new Map(Object.entries(headers)));
  });

  app.hooks.hook("render:html", (html, { event }) => {
    const nonce = randomBytes(16).toString("base64");
    const add_nonce = (chunk: string) =>
      chunk.replaceAll(/<script(?=[\s>])/g, `<script nonce="${nonce}"`);

    html.head = html.head.map(add_nonce);
    html.bodyAppend = html.bodyAppend.map(add_nonce);

    event.node.res.setHeader("Content-Security-Policy", page_csp(nonce));
  });
});
