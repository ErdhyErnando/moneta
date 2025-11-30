# Deployment Guide for Moneta

## 1. Recommended Architecture: Hybrid Approach

Given your constraint of a **low-spec VPS**, the best approach is to decouple the frontend and backend.

*   **Frontend**: **Cloudflare Pages**
    *   **Why?** Serves static assets from a global CDN, zero load on your VPS, free SSL, and automatic builds from GitHub.
*   **Backend**: **VPS with Dokploy**
    *   **Why?** You need a persistent server for the Hono API and local PostgreSQL database. Dokploy manages the container orchestration easily.
*   **Database**: **Local PostgreSQL (via Dokploy)**
    *   **Why?** Keeps data close to the backend, low latency, and free (no managed DB costs).

### Architecture Diagram

```mermaid
graph TD
    User[User Browser]
    
    subgraph Cloudflare
        CF[Cloudflare Pages]
        Frontend[React Frontend]
    end
    
    subgraph VPS [Your VPS (Dokploy)]
        Traefik[Traefik / Proxy]
        Backend[Hono Server]
        DB[(PostgreSQL)]
    end
    
    User -->|https://moneta.erdhyernando.xyz| CF
    CF --> Frontend
    Frontend -->|API Calls| Traefik
    Traefik -->|http://localhost:3000| Backend
    Backend -->|TCP 5432| DB
```

---

## 2. Backend Deployment (VPS + Dokploy)

We will use **GitHub Actions** to build the Docker image and push it to **GitHub Container Registry (GHCR)**. Dokploy will then pull this pre-built image. This prevents your VPS from crashing during resource-intensive builds.

### Step 2.1: Create the Dockerfile

Create a file at `apps/server/Dockerfile`. This uses `turbo prune` to optimize the build context.

*(See the `apps/server/Dockerfile` file created in your codebase for the content)*

### Step 2.2: Configure GitHub Actions

Create a file at `.github/workflows/deploy-server.yml` to build and push the image.

```yaml
name: Deploy Server

on:
  push:
    branches: ["main"]
    paths:
      - "apps/server/**"
      - "packages/**"
      - "package.json"
      - "pnpm-lock.yaml"
      - "turbo.json"

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}-server

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Log in to the Container registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata (tags, labels) for Docker
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=raw,value=latest
            type=sha

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/server/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
```

### Step 2.3: Configure Dokploy

1.  **Login to Dokploy**.
2.  **Create a Project** (e.g., `moneta`).
3.  **Create a Service**:
    *   **Type**: `Docker` (or `Application` -> `Docker Image`).
    *   **Image**: `ghcr.io/erdhyernando/moneta-server:latest` (Adjust username if different).
    *   **Username**: Your GitHub Username.
    *   **Password**: A GitHub Personal Access Token (Classic) with `read:packages` scope.
4.  **Environment Variables**:
    *   `DATABASE_URL`: `postgresql://user:password@host:5432/dbname` (Use the internal network address of your Postgres container in Dokploy).
    *   `CORS_ORIGIN`: `https://moneta.erdhyernando.xyz`
5.  **Network / Domain**:
    *   **Domain**: `api.moneta.erdhyernando.xyz` (or just `moneta-api.erdhyernando.xyz`).
    *   **Container Port**: `3000`.
6.  **Deploy**.

---

## 3. Frontend Deployment (Cloudflare Pages)

Cloudflare Pages is the easiest way to deploy the Vite React app.

### Step 3.1: Setup Cloudflare Pages

1.  Go to the **Cloudflare Dashboard** -> **Workers & Pages**.
2.  Click **Create Application** -> **Pages** -> **Connect to Git**.
3.  Select your repository (`moneta`).
4.  **Configure Build**:
    *   **Framework Preset**: `Vite`
    *   **Build Command**: `pnpm turbo build --filter=web` (or just `npm run build` inside the web directory if you configure the root directory).
    *   **Better Setup for Monorepo**:
        *   **Root Directory**: `apps/web`
        *   **Build Command**: `npm run build` (This runs `vite build`)
        *   **Output Directory**: `dist`
5.  **Environment Variables**:
    *   `VITE_API_URL`: `https://api.moneta.erdhyernando.xyz` (The domain you set in Dokploy).

### Step 3.2: Domain Configuration

1.  In Cloudflare Pages, go to **Custom Domains**.
2.  Add `moneta.erdhyernando.xyz`.
3.  Cloudflare will automatically handle the DNS records if you are using Cloudflare DNS.

---

## 4. DNS Configuration (Cloudflare)

You need to configure DNS records in Cloudflare to point your domains to the correct services.

### Step 4.1: Frontend Domain (Cloudflare Pages)

When you add a custom domain in Cloudflare Pages (Step 3.2), Cloudflare **automatically creates** the necessary DNS records. However, if you need to verify or manually configure:

1.  Go to **Cloudflare Dashboard** → **DNS** → **Records**.
2.  You should see a **CNAME** record:
    *   **Type**: `CNAME`
    *   **Name**: `moneta` (or `@` if using root domain)
    *   **Target**: `<your-pages-project>.pages.dev` (automatically set by Cloudflare Pages)
    *   **Proxy status**: ✅ **Proxied** (orange cloud icon)

> [!NOTE]
> Cloudflare Pages handles this automatically. You typically don't need to create this record manually.

### Step 4.2: Backend API Subdomain (VPS)

For `api.moneta.erdhyernando.xyz` to point to your VPS, you need to **manually create** an **A record**:

1.  Go to **Cloudflare Dashboard** → **DNS** → **Records**.
2.  Click **Add record**.
3.  Configure the record:
    *   **Type**: `A`
    *   **Name**: `api.moneta` (this creates `api.moneta.erdhyernando.xyz`)
    *   **IPv4 address**: `<YOUR_VPS_IP_ADDRESS>` (e.g., `203.0.113.45`)
    *   **Proxy status**: ✅ **Proxied** (orange cloud icon - recommended for DDoS protection and SSL)
    *   **TTL**: `Auto`
4.  Click **Save**.

> [!IMPORTANT]
> Replace `<YOUR_VPS_IP_ADDRESS>` with your actual VPS public IP address.

### Step 4.3: Verify DNS Propagation

After adding the DNS records, verify they are working:

```bash
# Check frontend domain
nslookup moneta.erdhyernando.xyz

# Check API subdomain
nslookup api.moneta.erdhyernando.xyz
```

Both should resolve to IP addresses. If proxied through Cloudflare, they will show Cloudflare's IP addresses, not your actual VPS IP.

### Step 4.4: SSL/TLS Configuration

1.  Go to **Cloudflare Dashboard** → **SSL/TLS**.
2.  Set encryption mode to **Full (strict)** for maximum security.
3.  Cloudflare will automatically provision SSL certificates for both domains.

> [!TIP]
> Dokploy (via Traefik) will automatically handle SSL certificates for `api.moneta.erdhyernando.xyz` using Let's Encrypt when you configure the domain in Dokploy.

### DNS Records Summary

After configuration, your DNS records should look like this:

| Type  | Name        | Target/Value                    | Proxy Status |
|-------|-------------|---------------------------------|--------------|
| CNAME | `moneta`    | `<project>.pages.dev`           | Proxied      |
| A     | `api.moneta`| `<YOUR_VPS_IP>`                 | Proxied      |

---

## 5. Summary of URLs

*   **Frontend**: `https://moneta.erdhyernando.xyz`
*   **Backend API**: `https://api.moneta.erdhyernando.xyz`

## 6. Potential Issues & Best Practices

*   **CORS**: Ensure your Hono server's CORS middleware includes `https://moneta.erdhyernando.xyz`.
*   **Database Migrations**:
    *   **Option A (Manual)**: Run `pnpm db:migrate` locally pointing to the remote DB (requires exposing DB port, risky).
    *   **Option B (CI/CD)**: Add a step in GitHub Actions to run migrations.
    *   **Option C (Startup Script)**: Update `package.json` start script to run migrations before starting the server: `"start": "pnpm db:migrate && node dist/index.js"`. **(Recommended for simplicity)**.
*   **Resources**: Since you are using a low-spec VPS, ensure your Postgres container has memory limits set in Dokploy to prevent it from being OOM-killed.

