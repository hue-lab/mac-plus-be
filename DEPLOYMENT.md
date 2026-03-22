# Deployment with Dokploy

## Why the flow changed

The previous production flow published the backend image to GitHub Packages / GHCR and then pulled it on the server.
If the server in Minsk cannot complete a TLS handshake with `https://ghcr.io/v2/`, deployment breaks before the app even starts.

The repository is now prepared for a registry-free flow:

- Dokploy clones this repository directly from GitHub.
- Dokploy builds the `backend` image locally on the target server from `Dockerfile`.
- MongoDB still runs from the public `mongo` image.
- Application and database data are stored in Docker named volumes instead of bind mounts from the git checkout.

## Recommended Dokploy setup

1. Create a new `Docker Compose` service in Dokploy.
2. Connect the GitHub repository and select the `main` branch.
3. Point Dokploy to the repository `docker-compose.yml`.
4. Enable `Auto Deploy`.
5. Add the required environment variables in Dokploy:
   - `JWT_SECRET`
   - `PORT`
   - `MONGODB_URI`
   - `MONGODB_USER`
   - `MONGODB_PASSWORD`
   - `MONGODB_NAME`
   - `MONGODB_PORT`
   - `TG_TOKEN`
   - `TG_CHAT_ID`
6. Deploy the stack from Dokploy.

## What changed in compose

- `backend` now uses `build:` instead of `image: ghcr.io/...`
- `MONGODB_URL` now targets the Compose service name `database`
- `backend-storage` persists uploaded files
- `mongodb-data` persists MongoDB data

## CI/CD flow now

- GitHub Actions only runs CI (`npm ci` + `npm run build`)
- Deployment is triggered by Dokploy from the Git push

If your Dokploy project is not connected through the GitHub App, use Dokploy's webhook/API as the deploy trigger instead of pushing Docker images to a registry.
