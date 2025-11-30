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

The Dockerfile includes several security and efficiency improvements:

1. **`.dockerignore` file**: Excludes sensitive files (`.env`, `.git`) and unnecessary files from the build context
2. **Pinned pnpm version**: Uses `corepack prepare pnpm@9.15.3 --activate` to ensure consistent builds
3. **Production dependencies only**: Installs only production dependencies with `--prod --frozen-lockfile`
4. **Minimal runtime image**: The runner stage copies only necessary files:
   - `apps/server/dist/` (built application)
   - `apps/server/package.json` (metadata)
   - `node_modules/` (production dependencies)
   - `packages/` (workspace packages if needed at runtime)

This approach reduces the image size, attack surface, and ensures no sensitive files are included in the final image.

*(See the `apps/server/Dockerfile` file created in your codebase for the full content)*

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

## 4. Summary of URLs

*   **Frontend**: `https://moneta.erdhyernando.xyz`
*   **Backend API**: `https://api.moneta.erdhyernando.xyz`

## 5. Potential Issues & Best Practices

*   **CORS**: Ensure your Hono server's CORS middleware includes `https://moneta.erdhyernando.xyz`.
*   **Database Migrations**:
    *   **Option A (Manual)**: Run `pnpm db:migrate` locally pointing to the remote DB (requires exposing DB port, risky).
    *   **Option B (CI/CD)**: Add a step in GitHub Actions to run migrations.
    *   **Option C (Startup Script)**: Update `package.json` start script to run migrations before starting the server: `"start": "pnpm db:migrate && node dist/index.js"`. **(Recommended for simplicity)**.
*   **Resources**: Since you are using a low-spec VPS, ensure your Postgres container has memory limits set in Dokploy to prevent it from being OOM-killed.

