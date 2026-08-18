# Etapa 1: gera o bundle de producao.
FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY frontend ./frontend
COPY shared ./shared

# vite.config.js le GIT_COMMIT para carimbar a versao na interface. Dentro do
# build nao existe .git, entao o valor vem de fora; sem ele o fallback e "dev".
ARG GIT_COMMIT=dev
ENV GIT_COMMIT=$GIT_COMMIT

RUN npx vite build --config frontend/vite.config.js

# Etapa 2: serve os arquivos estaticos. O servidor de desenvolvimento do Vite
# nao vai para producao: aqui roda nginx, que tambem encaminha /api ao backend.
FROM nginx:alpine

COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY docker/frontend/nginx.conf.template /etc/nginx/templates/default.conf.template

ENV NGINX_ENVSUBST_FILTER=NSJB_
ENV NSJB_API_PROXY_TARGET=http://backend:8787

EXPOSE 5173
