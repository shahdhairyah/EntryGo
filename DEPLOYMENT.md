# Deployment Guide for entrygo.live

This project is a zero-build, ultra-fast static web application powered by HTML5, modern CSS, vanilla ES modules, and Supabase.

---

## 1. Hosting Options (Choose one)

### Option A: Vercel (Recommended)
1. Push this folder to your GitHub / GitLab repository.
2. Go to [vercel.com](https://vercel.com) and click **Add New Project**.
3. Import the repository.
   - **Framework Preset**: Other
   - **Build Command**: None (leave empty)
   - **Output Directory**: `.` (root)
4. Go to **Settings → Domains** and add `entrygo.live` (and `www.entrygo.live`).
5. Set your DNS records at your domain registrar as shown by Vercel.

### Option B: Netlify
1. Go to [netlify.com](https://netlify.com) and click **Add new site → Import an existing project**.
2. Select your repository.
3. Build command: None | Publish directory: `.`
4. In **Site Configuration → Domain management**, add custom domain `entrygo.live`.

### Option C: Cloudflare Pages
1. In Cloudflare dashboard → **Workers & Pages** → **Create application** → **Pages**.
2. Connect Git repository.
3. Build preset: None | Output directory: `/`.
4. Custom Domains → `entrygo.live`.

### Option D: Traditional VPS (Nginx / Apache / Caddy)
Point your web root to this directory. Nginx configuration example:
```nginx
server {
    listen 80;
    server_name entrygo.live www.entrygo.live;
    root /var/www/entrygo;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

---

## 2. Supabase Configuration for `entrygo.live`

To ensure magic sign-in links and Google authentication work on your live domain:

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project (`nkcmgcunnrqulocdwgxr`).
3. Navigate to **Authentication** → **URL Configuration**.
4. Set:
   - **Site URL**: `https://entrygo.live`
   - **Redirect URLs**:
     - `https://entrygo.live/**`
     - `https://www.entrygo.live/**`
     - `http://localhost:8000/**` (for local development)
5. Under **Authentication** → **Providers**:
   - Ensure **Email** is enabled.
   - If using **Google**, add `https://entrygo.live` to the Authorized redirect URIs in Google Cloud Console: `https://<your-project-id>.supabase.co/auth/v1/callback`.

---

## 3. Verify Database Permissions

Make sure you have run `schema.sql` in your Supabase SQL Editor. If you encounter pass creation errors, run:

```sql
GRANT INSERT (event_id, name, contact) ON public.gp_passes TO authenticated;
GRANT SELECT, DELETE ON public.gp_passes TO authenticated;
```
