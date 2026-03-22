FROM node:18-alpine3.18 AS base
WORKDIR /opt/app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:18-alpine3.18 AS runtime
WORKDIR /opt/app
ENV NODE_ENV=production

COPY --from=build /opt/app/package.json ./package.json
COPY --from=build /opt/app/package-lock.json ./package-lock.json
COPY --from=build /opt/app/node_modules ./node_modules
COPY --from=build /opt/app/dist ./dist
COPY --from=build /opt/app/certs ./certs

EXPOSE 5000

CMD ["node", "dist/main.js"]
