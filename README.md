# De Elektraman

![De Elektraman](public/logo.png)

Website for De Elektraman, an electrical services company: installations, maintenance and a 24/7 fault service. A
Nuxt 4 site with the services, a portfolio of finished jobs and a contact form that mails the company directly. The
client keeps the portfolio up to date himself through a small admin page at `/admin`. Live at
[deelektraman.com](https://deelektraman.com).

## Stack

| | |
|---|---|
| Framework | Nuxt 4 (`srcDir` is `app/`), Vue 3, TypeScript |
| Styling | Tailwind CSS 4 via `@tailwindcss/vite`, Motion for animation |
| Data | Supabase: the portfolio table, admin accounts and a storage bucket for photos |
| Mail | Nodemailer over SMTP (Zoho) for the contact form |
| Hosting | Vercel, with Speed Insights and Analytics |

## Getting started

```bash
vercel env pull .env.local --yes   # or: cp .env.example .env.local and fill it in
npm install                        # postinstall runs `nuxt prepare`
npm run dev                        # http://localhost:3000, reads .env.local
```

```bash
npm run build     # production build -> .output/
npm run preview   # serve that build locally
```

Every variable is explained in [ENV_VARIABLES.md](ENV_VARIABLES.md). Company details (name, phone numbers, opening
hours, statistics) are `NUXT_PUBLIC_*` variables, so the same code can run for another company. SMTP and Supabase
credentials have no `NUXT_PUBLIC_` prefix and stay on the server.

## Portfolio admin

The portfolio lives in Supabase, not in the repository, so the client can add projects without a deploy.

- Projects are one row in the `elektraman_portfolio` table; photos go to the `elektraman-portfolio` bucket.
- Accounts are in `elektraman_admin_accounts`. Create one, or reset a password and lift a lockout, with
  `npm run admin:account -- <username>` (add `--env dev` for the local database). It prints the new password once.
- Sign-in uses an encrypted cookie (`NUXT_SESSION_PASSWORD`, 32+ characters) and locks after repeated failed logins.
- Saves check `updated_at`, so two people editing at once can't overwrite each other.

Until the admin variables are set, `/admin` says it isn't configured.

## Opening hours

`useBusinessHours()` reads the configured hours (`"08:00 - 18:00"`, or `Gesloten` for closed) and works out whether the
company is open right now; the contact card shows the result as a live status.

## Project structure

| Path | |
|---|---|
| `app/pages/` | Home, services, portfolio, contact, privacy, terms and the admin page |
| `app/components/` | Navbar, footer, hero, service cards, call to action and the other sections |
| `app/composables/` | `useCompanyInfo` (company details from runtime config) and `useBusinessHours` |
| `app/assets/css/main.css` | Tailwind entry and the site's design tokens |
| `server/api/contact.post.ts` | Sends the contact form through SMTP |
| `server/api/portfolio.get.ts` | Public portfolio, read from Supabase |
| `server/api/admin/` | Login, logout, password change, session and portfolio/photo saves |
| `server/utils/` | Supabase client, portfolio storage, password hashing and admin sessions |
| `shared/types/` | Types shared by the app and the server |
| `scripts/admin-account.ts` | Creates or resets an admin account |
| `public/` | Logo, certification logos, favicons and static images |
