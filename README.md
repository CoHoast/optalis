# Optalis Healthcare

Monorepo containing the Optalis Healthcare marketing website and admissions dashboard.

## Structure

```
optalis/
├── marketing/     # Static HTML marketing site (68 pages)
└── dashboard/     # Next.js admissions portal
```

## Marketing Site

Static HTML/CSS website for Optalis Healthcare.

- **Tech:** Pure HTML, CSS, JavaScript
- **Pages:** 68 pages (services, 40 locations, resources, blog)
- **Deploy:** Static site hosting

### Local Development
```bash
cd marketing
python3 -m http.server 8080
# Open http://localhost:8080
```

## Dashboard

Next.js application for patient admissions management.

- **Tech:** Next.js 15, TypeScript, Tailwind CSS
- **Features:** Document intake, AI extraction display, approval workflow
- **PWA:** Configured for mobile install

### Local Development
```bash
cd dashboard
npm install
npm run dev
# Open http://localhost:3000
```

### Build
```bash
npm run build
npm run start
```

## Railway Deployment

### Marketing Site
- Root Directory: `/marketing`
- Build Command: (none - static)
- Start Command: (static site)

### Dashboard
- Root Directory: `/dashboard`
- Build Command: `npm run build`
- Start Command: `npm run start`

## Environment Variables (Dashboard)

None required for demo. For production:
- `NEXTAUTH_URL` - Dashboard URL
- `NEXTAUTH_SECRET` - Auth secret
- `DATABASE_URL` - Database connection (future)

---

© 2026 Optalis Healthcare
