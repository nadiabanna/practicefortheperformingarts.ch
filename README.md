# Practice for the Performing Arts website

A fully static, self-hosted rebuild of [practicefortheperformingarts.ch](https://www.practicefortheperformingarts.ch/),
migrated off Squarespace and ready for **GitHub Pages**. No build step, no framework, no tracking,
and no external requests on page load: the only outbound request is to **Formspree**, and only when
a visitor submits the contact or booking form.

## Structure

```
index.html                      Home
about/                          About (team bios + FAQ)
work-with-us/                   How we work
services/                       Services (medical + Alexander Technique)
treatment-costs/                Insurance & tarifs
booking/                        Appointment request (Formspree)
contact-us/                     Contact form (Formspree)
privacy-policy/                 Privacy policy (GitHub Pages + Formspree)
terms-and-conditions/           Terms & conditions
consultation/, book-session/    301-style redirects → /booking/
assets/css/styles.css           Design system
assets/js/main.js               Nav, scroll reveal, Formspree AJAX
assets/fonts/                   Self-hosted Marcellus + PT Serif (woff2)
assets/img/                     Optimised images (webp) + brand shapes
favicon.*, icon-*, apple-touch-icon.png, site.webmanifest
CNAME, robots.txt, sitemap.xml, 404.html, .nojekyll
```

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy to GitHub Pages

1. Create a repository and push these files to the default branch.
2. In **Settings → Pages**, set **Source: Deploy from a branch**, branch `main`, folder `/ (root)`.
3. The included `CNAME` sets the custom domain to `www.practicefortheperformingarts.ch`.
   In your DNS, point `www` (CNAME) to `<username>.github.io`, and add the four GitHub Pages
   `A` records (185.199.108.153, .109.153, .110.153 and .111.153) for the apex if you also use the bare domain.
4. Enable **Enforce HTTPS** once the certificate is issued.

## Forms (Formspree)

Both forms POST to `https://formspree.io/f/mgopanob`. They submit via `fetch` (AJAX) with a graceful
fallback to a normal POST if JavaScript is unavailable. A hidden `_gotcha` honeypot guards against spam.

## Assets & licensing

- **Fonts:** Marcellus and PT Serif (Google Fonts, SIL Open Font License), self-hosted.
- **Photography:** Unsplash images (Unsplash License) plus the practice’s own brand graphics and
  portraits. Some photography courtesy of In Her Image Photography.
- All assets are stored locally; the site references no Squarespace, CDN, or third-party domains.

## SEO

Per-page titles and descriptions, canonical URLs, Open Graph / Twitter cards, `MedicalBusiness` and
`FAQPage` JSON-LD, `sitemap.xml`, `robots.txt`, semantic HTML and self-hosted fonts with
`font-display: swap`.
