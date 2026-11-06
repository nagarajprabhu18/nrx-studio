# NRX STUDIO

A full-stack agency website built with Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, and Supabase. The public site reads published work and approved reviews from Supabase. Contact and review submissions are validated on the server, protected by honeypots and per-IP rate limits, and written through server-only code using the service role key. RLS denies direct public inserts. Admin changes require a Supabase Auth session plus an `admin` profile role and are also constrained by database RLS.

## Requirements

- Node.js 20.9+ (Node 22 LTS recommended) and npm
- A Supabase project
- Git and a GitHub account for source hosting (optional for local development)

## Run locally

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env.local` and set:

   - `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
   - `NEXT_PUBLIC_SUPABASE_URL` from Supabase project settings → API
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable/anon key)
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; used after authorization or validation for image uploads and public submissions)
   - `NRX_ADMIN_EMAIL` to the email address of the administrator you provision below
   - `NRX_ADMIN_USERNAME=nrxstudio`

   Never prefix the service-role key with `NEXT_PUBLIC_`, and never commit `.env.local`.

3. In Supabase → SQL Editor, run `supabase/migrations/202611050001_initial_schema.sql`.

4. Create the one administrator in Supabase Dashboard → Authentication → Users → Add user. Use the email set in `NRX_ADMIN_EMAIL`, choose a strong unique password, and confirm the email. Disable public sign-ups in Authentication settings. To map that Auth user to the protected admin role, run this SQL with the Auth user's UUID from the Users page:

   ```sql
   insert into public.profiles (id, username, role)
   values ('AUTH_USER_UUID', 'nrxstudio', 'admin')
   on conflict (id) do update set username = excluded.username, role = 'admin';
   ```

   Do not put the password in SQL, source code, or a shared deployment file. If you must start with a temporary password, set `must_change_password` to `true` in this profile row. The admin will be forced through `/admin/password-reset` before they can access dashboard pages or write APIs. The reset requires a unique password of at least 16 characters.

   ```sql
   update public.profiles
   set must_change_password = true
   where id = 'AUTH_USER_UUID';
   ```

5. Start the app:

   ```sh
   npm run dev
   ```

   Open `http://localhost:3000`. Admin pages live at `/admin/login` and `/admin/dashboard`.

### Database and storage behavior

- Unconfigured Supabase: the public site still renders with contact and pricing defaults; managed content is shown as an empty state. Admin writes and submissions report a clear configuration error.
- `projects` and `templates`: public visitors only read published rows; only authenticated admins can write.
- `reviews`: route submissions are always stored pending after server validation and rate limiting. RLS denies direct public writes. Public reads and rating statistics include approved reviews only. Admins approve, reject, or delete.
- `enquiries`: validated route submissions only; RLS denies direct public writes. Admins can read and delete. The dashboard shows recent enquiries.
- `site_settings`: public read and admin write.
- `project-media`: public read for published website imagery; only admins can upload, edit, or delete. Uploads are limited to JPEG, PNG, WebP, and AVIF up to 5 MB.

## Rate limiting

The public submission endpoints have server-side per-IP limits and honeypot fields. The in-process limiter works for a single process/development. For consistent limits across serverless instances, configure the optional `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` variables. If the Redis limiter is configured but unavailable, requests fail closed. Review content remains pending until approved by an administrator.

## Deploy to Vercel

1. Create an empty GitHub repository. In the project folder, initialize and push the source (replace the URL with your GitHub repository URL):

   ```sh
   git init
   git add .
   git commit -m "Build NRX Studio website"
   git branch -M main
   git remote add origin https://github.com/YOUR_ACCOUNT/nrx-studio.git
   git push -u origin main
   ```

   Do not add `.env.local`; it is excluded by `.gitignore`.
2. In Vercel, choose **Add New → Project**, import the GitHub repository, and keep the Next.js defaults.
3. Add the environment values from `.env.local` in Vercel Project Settings → Environment Variables. Set `NEXT_PUBLIC_SITE_URL` to the production HTTPS domain. Set Supabase values for production and preview environments only if intended.
4. Add the Vercel production and preview URLs to Supabase Auth → URL Configuration → Redirect URLs. This site uses password sign-in without public registration or OAuth redirects.
5. Deploy. Run the migration in the target Supabase project before enabling the production site, then create the admin Auth user and `profiles` row as above.
6. In Supabase Storage, verify the `project-media` bucket and its policies from the migration. Add Upstash Redis variables for distributed public-form rate limits on serverless deployments.

## Useful commands

```sh
npm run dev       # local development
npm run typecheck # TypeScript validation
npm run lint      # ESLint
npm run build     # production build
npm start         # run production build locally
```

## Security notes

- There is no public admin registration flow.
- Admin authorization checks the verified Supabase user and `profiles.role` on the server, then RLS independently protects each table.
- The browser receives only the anon key. `SUPABASE_SERVICE_ROLE_KEY` is imported only by a server-only upload route.
- Admin writes use the user's cookie session and database RLS.
- All public submission fields are schema validated and size bounded on the server.
- Security headers, output escaping, and HTTPS deployment are expected for production. Add an application-specific CSP at deployment once external image domains are known.
