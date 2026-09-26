# ── Build ──────────────────────────────────────────────────────────────
# npm plutôt que pnpm (préférence par défaut du projet) : le fetch du
# binaire pnpm par corepack (registry.npmjs.org/@pnpm/exe...) s'est révélé
# indisponible dans cet environnement de build - npm est fourni avec
# l'image Node, aucune étape réseau supplémentaire. package-lock.json déjà
# présent dans le dépôt (les deux lockfiles coexistent).
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Figées au build (Vite inline les import.meta.env.* dans le bundle,
# impossible à changer après coup sans rebuild). Surchargeables via
# docker-compose.yml (build.args) sans toucher ce Dockerfile.
ARG VITE_API_URL=http://localhost:8000/api
ARG VITE_KKIAPAY_PUBLIC_KEY=
ARG VITE_KKIAPAY_SANDBOX=true
ARG VITE_PLATFORM_NAME=Totché
ARG VITE_COMPANY_NAME="Sen Impact Technologies"
ARG VITE_CONTACT_EMAIL=ajustinsena@gmail.com
ARG VITE_CONTACT_TEL="+229 01 67 75 88 20"
ARG VITE_CONTACT_ADRESSE="Cotonou, Bénin"
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_KKIAPAY_PUBLIC_KEY=$VITE_KKIAPAY_PUBLIC_KEY
ENV VITE_KKIAPAY_SANDBOX=$VITE_KKIAPAY_SANDBOX
ENV VITE_PLATFORM_NAME=$VITE_PLATFORM_NAME
ENV VITE_COMPANY_NAME=$VITE_COMPANY_NAME
ENV VITE_CONTACT_EMAIL=$VITE_CONTACT_EMAIL
ENV VITE_CONTACT_TEL=$VITE_CONTACT_TEL
ENV VITE_CONTACT_ADRESSE=$VITE_CONTACT_ADRESSE

RUN npm run build

# ── Serve ──────────────────────────────────────────────────────────────
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
