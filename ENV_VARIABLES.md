# Environment Variables Configuration

This document explains how to configure the environment variables for the De Elektraman website.

## Setup Instructions

1. Pull the project's variables from Vercel into `.env.local` (the dev server reads this file):
   ```bash
   vercel env pull .env.local --yes
   ```

   Without Vercel access, copy `.env.example` to `.env.local` and fill it in instead.

2. Restart the development server after making changes to `.env.local`.

## Available Environment Variables

### App Configuration

- `NUXT_PUBLIC_APP_NAME` - Company name (used in navbar, footer, page titles)
- `NUXT_PUBLIC_WEBSITE_NAME` - Full website name for SEO
- `NUXT_PUBLIC_COMPANY_DESCRIPTION` - Short company description
- `NUXT_PUBLIC_COMPANY_SLOGAN` - Company slogan/tagline

### Contact Information

- `NUXT_PUBLIC_COMPANY_EMAIL` - Primary email address
- `NUXT_PUBLIC_COMPANY_PHONE` - Phone number (format: +31612345678)
- `NUXT_PUBLIC_COMPANY_PHONE_DISPLAY` - Phone number display format (format: +31 (0) 6 1234 5678)
- `NUXT_PUBLIC_COMPANY_EMERGENCY_PHONE` - Emergency phone number
- `NUXT_PUBLIC_COMPANY_EMERGENCY_PHONE_DISPLAY` - Emergency phone display format
- `NUXT_PUBLIC_COMPANY_ADDRESS` - Company location/address

### Business Hours

- `NUXT_PUBLIC_HOURS_WEEKDAYS` - Opening hours Monday-Friday (e.g., "08:00 - 18:00")
- `NUXT_PUBLIC_HOURS_SATURDAY` - Opening hours Saturday
- `NUXT_PUBLIC_HOURS_SUNDAY` - Opening hours Sunday (e.g., "Gesloten" for closed)
- `NUXT_PUBLIC_HOURS_EMERGENCY` - Emergency service availability (e.g., "24/7")

**Business Hours Feature:** The website automatically detects if visitors are browsing within your business hours and
shows:

- Green "Nu beschikbaar" (Now available) indicator when within business hours
- Gray "Beschikbaar [next opening time]" indicator when outside business hours
- Emergency contact always shows as available if set to "24/7"

### Company Statistics

- `NUXT_PUBLIC_YEARS_EXPERIENCE` - Years of experience (displayed on homepage)
- `NUXT_PUBLIC_HAPPY_CLIENTS` - Number of satisfied clients (displayed on homepage)

### Social Media Links

- `NUXT_PUBLIC_SOCIAL_LINKEDIN` - LinkedIn profile URL
- `NUXT_PUBLIC_SOCIAL_FACEBOOK` - Facebook page URL
- `NUXT_PUBLIC_SOCIAL_INSTAGRAM` - Instagram profile URL

### Contact Form SMTP (Private)

- `NUXT_SMTP_HOST` - SMTP host (Zoho EU: `smtp.zoho.eu`, Zoho global: `smtp.zoho.com`)
- `NUXT_SMTP_PORT` - SMTP port (`465` for SSL, `587` for STARTTLS)
- `NUXT_SMTP_USER` - SMTP username (usually your full Zoho mailbox address)
- `NUXT_SMTP_PASS` - SMTP password or Zoho app password
- `NUXT_SMTP_FROM_NAME` - Display name used in outgoing mail
- `NUXT_CONTACT_TO` - Inbox that receives contact form submissions

### Portfolio Admin (Private)

The client manages portfolio projects at `/admin`. Projects are stored in the Supabase table
`elektraman_portfolio`, photos in the public Storage bucket `elektraman-portfolio`, and accounts in
`elektraman_admin_accounts`.

- `NUXT_SESSION_PASSWORD` - At least 32 random characters, encrypts the login cookie (`openssl rand -hex 32`).
  Changing it signs everyone out

Accounts are created, and passwords reset, with:

```bash
npm run admin:account -- <username>             # live site
npm run admin:account -- <username> --env dev   # local development
```

It prints a generated password once; save it in a password manager. A reset also lifts a lockout and signs that
account out everywhere. Once signed in, anyone can change their own password under "Wachtwoord wijzigen".

After 5 wrong passwords an account is locked for 30 minutes; other accounts are unaffected. Signing out deletes
the cookie and ends that account's sessions on every device. Uploaded photos that are removed, undone or
left unsaved are deleted again; anything missed is removed on a save more than an hour later.
- `SUPABASE_URL` - Set by the Vercel Supabase integration
- `SUPABASE_SECRET_KEY` - Set by the Vercel Supabase integration; server-side only

Until both admin variables are set, `/admin` shows that it is not configured. Until the first save, the site shows the
built-in projects. Local development (`npm run dev`) reads and writes a separate `dev` copy and `dev/` photo folder,
so testing never changes the live portfolio.

## Usage in Code

The environment variables are accessible throughout the application via the `useCompanyInfo()` composable:

```vue

<script setup lang="ts">
  const companyInfo = useCompanyInfo()
</script>

<template>
  <div>
    <p>{{ companyInfo.appName }}</p>
    <p>{{ companyInfo.email }}</p>
    <p>{{ companyInfo.phoneDisplay }}</p>
  </div>
</template>
```

## Where Variables Are Used

- **Navbar**: Company name and logo alt text
- **Footer**: Company name, description, contact info, social media links
- **Contact Page**: Phone numbers, email, business hours
- **Homepage**: Company statistics (years of experience, happy clients)
- **All Pages**: Via the composable for any custom usage

## Important Notes

- All variables prefixed with `NUXT_PUBLIC_` are exposed to the client-side
- Variables without `NUXT_PUBLIC_` stay server-side and are safe for SMTP credentials
- The `.env` file should never be committed to version control
- Always use `.env.example` as a template for new setups
- Changes to environment variables require a server restart
- Phone numbers should be in international format for the `tel:` links (+31...)
- Display formats can include spaces and parentheses for readability

## Development vs Production

For production deployments, set these environment variables in your hosting platform's configuration:

- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Build & Deploy → Environment
- Other platforms: Consult their documentation for environment variable configuration
