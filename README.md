# Drop Log

A tiny eye-drop dosing tracker (Exocin + FML) with a real backend, deployed
free on Cloudflare Pages. No server to manage, no credit card.

## What's in this folder

- `index.html` — the whole frontend (one file, no build step)
- `functions/api/state.js` — the backend API (a Cloudflare Pages Function)
- `wrangler.toml` — config reference for the KV binding

## How the data flows

The frontend calls `GET /api/state` to load your schedule + check-ins, and
`POST /api/state` every time you tap a checkbox or "I just took this dose".
The function reads/writes a single JSON blob in Cloudflare KV (a free
key-value store). There's no login — anyone with the URL can see/edit it,
same as a shared doc. That's fine for personal use; don't share the link
publicly.

---

## Deploy steps (about 5 minutes)

### 1. Create a GitHub repo
1. Go to https://github.com/new
2. Name it `drop-log` (or anything you like), keep it **Private** if you
   prefer, click **Create repository**.
3. On the empty repo page, click **uploading an existing file** and drag in
   all three items from this folder (`index.html`, the `functions` folder,
   `wrangler.toml`). Commit.

   (If you're comfortable with git on your machine instead:)
   ```bash
   cd drop-log
   git init
   git add .
   git commit -m "Initial drop log"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/drop-log.git
   git push -u origin main
   ```

### 2. Create the KV namespace (your "database")
1. Go to https://dash.cloudflare.com → sign up free if you don't have an
   account → **Workers & Pages** → **KV** in the left sidebar.
2. Click **Create a namespace**, name it `drop-log` (any name works), create.
3. Leave this tab open — you'll need it in step 4.

### 3. Create the Pages project
1. Still in the Cloudflare dashboard: **Workers & Pages** → **Create** →
   **Pages** tab → **Connect to Git**.
2. Authorize GitHub if prompted, pick your `drop-log` repo.
3. Build settings: framework preset **None**, build command **(leave blank)**,
   build output directory **`/`** (just a single slash — it's a static file,
   nothing to build).
4. Click **Save and Deploy**. It'll deploy in under a minute and give you a
   URL like `drop-log-xyz.pages.dev`.

### 4. Connect the KV namespace to the Pages project
1. Open your new Pages project → **Settings** → **Functions** →
   **KV namespace bindings** → **Add binding**.
2. Variable name: `DROP_LOG_KV` (must match exactly, this is what
   `functions/api/state.js` looks for).
3. KV namespace: pick the one you created in step 2.
4. Save. Then go to the **Deployments** tab and **Retry deployment** (or just
   push any small change to GitHub) so the binding takes effect.

### 5. Use it
Open your `*.pages.dev` URL on your phone, add it to your home screen
(Share → Add to Home Screen on iOS), and you're set. Every checkbox tap and
"I just took this dose" now saves to Cloudflare's KV store — it'll be there
no matter what device or browser you open the link from.

---

## Optional: custom domain
In the Pages project → **Custom domains** → add a domain or subdomain you
own (e.g. `drops.yourdomain.com`) and follow the DNS prompts. Not required —
the free `.pages.dev` URL works fine on its own.

## Notes
- This stores one shared state blob — fine for one person tracking their own
  doses. It is **not** multi-user/multi-patient out of the box.
- No authentication on the API route. Don't post the link publicly.
- All times are based on the browser's local clock/timezone.
