FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY backend ./backend
COPY shared ./shared
COPY docker/db/DDL-POSTGRESQL-INICIAL.sql ./docker/db/DDL-POSTGRESQL-INICIAL.sql

ENV NSJB_API_PORT=8787

EXPOSE 8787

CMD ["node", "backend/index.mjs"]
