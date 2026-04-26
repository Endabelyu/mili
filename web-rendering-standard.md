# Web Rendering Standard
**Based on Google Lighthouse + MAANG Engineering Practices**

> Use this standard as the baseline for every production web release. Targets align with Google's Core Web Vitals assessment and the internal engineering bars held at Amazon, Meta, Apple, Netflix, and Google.

---

## 1. Core Web Vitals Targets

| Metric | Full name | Target (Good) | Fail threshold |
|--------|-----------|--------------|----------------|
| **LCP** | Largest Contentful Paint | ≤ 2.5s | > 4s |
| **INP** | Interaction to Next Paint | ≤ 100ms | > 200ms |
| **CLS** | Cumulative Layout Shift | ≤ 0.1 | > 0.25 |
| **TTFB** | Time to First Byte | ≤ 200ms | > 600ms |
| **FCP** | First Contentful Paint | ≤ 1.8s | > 3s |

**Lighthouse score target:** ≥ 90 on mobile (simulated 4G, Moto G4 class device).

---

## 2. Performance Standard

### 2.1 Bundle size limits

| Resource type | Budget (gzip) |
|---------------|--------------|
| JavaScript per route | ≤ 150 KB |
| CSS initial load | ≤ 50 KB |
| Total page weight | ≤ 500 KB |
| Third-party JS | ≤ 100 KB |

Run `lighthouse-ci` on every PR and fail the build on regressions.

```json
// budget.json
{
  "budgets": [{
    "resourceSizes": [
      { "resourceType": "script", "budget": 150 },
      { "resourceType": "total",  "budget": 500 }
    ],
    "timings": [
      { "metric": "first-contentful-paint", "budget": 1500 }
    ]
  }]
}
```

### 2.2 Main thread

- Keep **Total Blocking Time (TBT) < 200ms**.
- Break long tasks (> 50ms) using `scheduler.postTask()` or `setTimeout(0)` to yield.
- Never use synchronous XHR or `document.write`.
- Defer or async all non-critical scripts.

```js
// Yield between heavy tasks to unblock the main thread
async function processItems(items) {
  for (const item of items) {
    processItem(item);
    await scheduler.yield(); // or: await new Promise(r => setTimeout(r, 0))
  }
}
```

### 2.3 JavaScript

- **Code-split at the route level.** Each page loads only its own JS.
- Use dynamic imports for modals, charts, and features behind flags.
- Tree-shake — no barrel re-exports from large libraries.
- Avoid polyfills for modern browsers unless the analytics data demands them.

```js
// Next.js / React — lazy load heavy components
const HeavyChart = dynamic(
  () => import('./HeavyChart'),
  { loading: () => <Skeleton />, ssr: false }
);
```

---

## 3. Memory & Heap Size Standard

### 3.1 Total heap size thresholds

| Heap size | Status | Action |
|-----------|--------|--------|
| < 50MB | ✅ Aman — normal untuk web app biasa | Monitor rutin |
| 50MB – 150MB | ⚠️ Perhatikan — cek apakah ada leak | Ambil heap snapshot, bandingkan |
| > 150MB | 🚨 Kemungkinan ada masalah serius | Investigasi segera |

> **Contoh:** Snapshot ~38MB → masih sangat aman ✅

### 3.2 Yang lebih penting dari angka — trend-nya!

Angka heap saja tidak cukup. Yang harus diperhatikan adalah **pola naik-turunnya**:

```
Stabil / naik-turun  →  ✅  GC bekerja normal
Naik terus (tidak pernah turun)  →  🚨  leak!
```

Cara baca heap snapshot secara berurutan:

```
Snapshot 1  →  34MB
Snapshot 2  →  38MB
Snapshot 3  →  38MB  (stabil)    →  ✅  normal
Snapshot 3  →  45MB  (naik lagi) →  ⚠️  investigate!
```

Jika angka terus naik tanpa pernah kembali turun setelah GC, itu tanda **memory leak** — bukan sekadar pemakaian memori yang tinggi.

### 3.3 Standar per jenis app

| Jenis aplikasi | Heap target |
|----------------|------------|
| Landing page / simple web | < 30MB |
| Dashboard / medium app | < 80MB |
| Complex SPA (Gmail level) | < 150MB |
| Mobile web | < 50MB _(RAM terbatas!)_ |

### 3.4 Cara cek heap di browser

```js
// Chrome DevTools — console
performance.memory.usedJSHeapSize / 1024 / 1024 + ' MB';

// Atau buka: DevTools → Memory tab → Take heap snapshot
// Bandingkan 3 snapshot setelah interaksi yang sama
```

Langkah investigasi leak:
1. Buka DevTools → **Memory** tab
2. Ambil **Snapshot 1** (baseline)
3. Lakukan aksi berulang (navigasi, buka-tutup modal, scroll)
4. Ambil **Snapshot 2** dan **Snapshot 3**
5. Bandingkan: jika heap terus naik → cari retained objects di snapshot comparison view

---

## 4. Loading Strategy

### 4.1 LCP element

The **Largest Contentful Paint element** (usually the hero image or H1) must:

1. Be preloaded with `<link rel="preload">`.
2. Use `fetchpriority="high"` on the `<img>` tag.
3. Never be lazy-loaded.

```html
<link rel="preload" as="image" href="/hero.webp" fetchpriority="high" />

<img
  src="/hero.webp"
  fetchpriority="high"
  loading="eager"
  width="1200"
  height="630"
  alt="Hero image description"
/>
```

### 4.2 Images below the fold

Every image not in the initial viewport must use:

```html
<img
  src="/product.webp"
  loading="lazy"
  decoding="async"
  width="400"
  height="300"
  alt="Product thumbnail"
/>
```

> **Always provide explicit `width` and `height`.** This allows the browser to reserve space and prevents CLS.

### 4.3 Image formats

Serve images in priority order using `<picture>`:

```html
<picture>
  <source srcset="img.avif" type="image/avif" />
  <source srcset="img.webp" type="image/webp" />
  <img src="img.jpg" alt="Description" width="800" height="600" />
</picture>
```

Format savings vs JPEG at equivalent quality: AVIF ~50%, WebP ~30%.

### 4.4 Fonts

```css
@font-face {
  font-family: 'BrandFont';
  src: url('/fonts/brand.woff2') format('woff2');
  font-display: swap;          /* show fallback immediately */
  unicode-range: U+0000-00FF;  /* latin subset only */
}
```

- Only load weights and styles you actually use.
- Self-host fonts whenever possible — avoids cross-origin DNS round-trips.
- Preload the most critical weight: `<link rel="preload" as="font" href="/fonts/brand.woff2" crossorigin>`.

### 4.5 Prefetch next navigation

```html
<!-- Speculation Rules API (Chrome 109+) -->
<script type="speculationrules">
{
  "prefetch": [{ "urls": ["/dashboard", "/checkout"] }]
}
</script>

<!-- Fallback -->
<link rel="prefetch" href="/dashboard" />
```

---

## 5. Layout Stability (CLS)

> **CLS > 0.1 fails the Core Web Vitals assessment.** Test on slow networks and low-end devices.

### 5.1 Reserve space for dynamic content

Every ad slot, embed, or async-injected element must have reserved dimensions:

```css
/* Ad slot */
.ad-slot {
  min-height: 250px;
  contain: layout;
}

/* Image placeholder before load */
.img-wrapper {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #f0f0f0;
}
```

### 5.2 CSS isolation

Use `contain` on panels that update independently to limit reflow scope:

```css
.widget-card {
  contain: layout style paint;
}
```

### 5.3 Skeleton screens (MAANG standard)

Replace spinners with skeleton placeholders that match the target layout:

```css
.skeleton {
  background: linear-gradient(
    90deg,
    #e9e9e9 25%,
    #f5f5f5 50%,
    #e9e9e9 75%
  );
  background-size: 200%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 5.4 Animations — GPU compositing only

Only animate `transform` and `opacity`. Never animate `width`, `height`, `top`, `left`, `margin`, or `padding` on the main thread.

```css
/* ❌ Triggers layout on every frame */
.btn:hover {
  width: 120px;
  margin-left: 8px;
}

/* ✅ GPU composited — no layout */
.btn:hover {
  transform: scaleX(1.05) translateX(4px);
}
```

---

## 6. Accessibility (WCAG 2.2 AA minimum)

| Rule | Requirement | Common failure |
|------|------------|----------------|
| Color contrast — body text | ≥ 4.5:1 | Light gray on white |
| Color contrast — large text (18px+) | ≥ 3:1 | Low contrast headings |
| Focus visible | Visible ring on all interactive elements | `outline: none` with no replacement |
| Alt text | All informative images | `alt=""` on meaningful images |
| Keyboard navigation | All actions keyboard-accessible | Click-only modals |
| ARIA labels | Icon-only buttons and inputs | Unlabelled icon buttons |
| Heading hierarchy | h1 → h2 → h3, no skipping levels | h1 followed by h4 |

### Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Focus ring

Never remove focus outlines without providing a visible replacement:

```css
/* System-aware, high-contrast */
:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}

/* Remove only for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}
```

---

## 7. SEO & Crawlability

### 7.1 Meta tags — every page

```html
<title>Page Title — Site Name</title>
<meta name="description" content="Concise 150-char description." />
<link rel="canonical" href="https://example.com/page" />

<!-- Open Graph -->
<meta property="og:title"       content="Page Title" />
<meta property="og:description" content="Description" />
<meta property="og:image"       content="https://example.com/og.jpg" />
<meta property="og:type"        content="article" />

<!-- Twitter Card -->
<meta name="twitter:card"  content="summary_large_image" />
<meta name="twitter:title" content="Page Title" />
<meta name="twitter:image" content="https://example.com/og.jpg" />
```

### 7.2 Internationalization

```html
<link rel="alternate" hreflang="en" href="https://example.com/en/page" />
<link rel="alternate" hreflang="id" href="https://example.com/id/page" />
<link rel="alternate" hreflang="x-default" href="https://example.com/page" />
```

### 7.3 Structured data (JSON-LD)

Add schema on every content and product page for rich results:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Page Title",
  "image": "https://example.com/image.jpg",
  "author": { "@type": "Person", "name": "Author Name" },
  "datePublished": "2025-01-15",
  "dateModified": "2025-04-01"
}
</script>
```

---

## 8. Caching & Network

| Resource | Cache-Control directive |
|----------|------------------------|
| HTML pages | `no-cache` (revalidate every request) |
| JS/CSS with content hash | `max-age=31536000, immutable` |
| Images | `max-age=86400, stale-while-revalidate=604800` |
| API responses | `no-store` (for user data) |
| Static fonts | `max-age=31536000, immutable` |

Always use content-hashed filenames for JS and CSS assets so you can set `immutable` with confidence.

---

## 9. Security Headers

The following headers must be set on every response:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; ...
```

---

## 10. Pre-Release Checklist

### Performance
- [ ] Lighthouse mobile score ≥ 90
- [ ] LCP ≤ 2.5s on simulated 4G
- [ ] CLS ≤ 0.1 with no ad or embed shifts
- [ ] INP ≤ 100ms on all interactive elements
- [ ] JS bundle < 150 KB gzip per route
- [ ] LCP resource preloaded with `fetchpriority="high"`
- [ ] All below-fold images: `loading="lazy"` + `width`/`height` set
- [ ] Images served as WebP or AVIF
- [ ] Fonts: woff2, `font-display: swap`, latin subset
- [ ] All animations use only `transform` + `opacity`
- [ ] Performance budget defined in `budget.json` and enforced in CI

### Accessibility & SEO
- [ ] All informative images have meaningful `alt` text
- [ ] Color contrast ≥ 4.5:1 for all body text
- [ ] Full keyboard navigation with logical tab order
- [ ] Focus indicator visible on all interactive elements
- [ ] Heading hierarchy is sequential (h1→h2→h3)
- [ ] `prefers-reduced-motion` respected
- [ ] `canonical` tag and OG meta on every page
- [ ] JSON-LD schema on content and product pages
- [ ] `hreflang` set for every language variant

### Security
- [ ] HTTPS enforced with HSTS header
- [ ] CSP header configured
- [ ] `X-Content-Type-Options: nosniff` set
- [ ] No sensitive data in client-side JS or localStorage

---

## Reference

- [Google Lighthouse docs](https://developer.chrome.com/docs/lighthouse/)
- [web.dev Core Web Vitals](https://web.dev/vitals/)
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [Speculation Rules API](https://developer.chrome.com/docs/web-platform/prerender-pages)
- [Schema.org structured data](https://schema.org/)
