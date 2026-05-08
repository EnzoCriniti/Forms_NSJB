FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY frontend ./frontend
COPY shared ./shared

ENV NSJB_API_PROXY_TARGET=http://backend:8787

EXPOSE 5173

CMD ["npm", "run", "dev:client", "--", "--host", "0.0.0.0", "--port", "5173", "--strictPort"]
