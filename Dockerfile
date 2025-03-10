FROM node:23-alpine3.20 as build
ENV VITE_SOCKET_BASE_URL=''
WORKDIR /var/build

RUN corepack enable pnpm

COPY package*.json .

RUN pnpm i

COPY . .

RUN pnpm build

FROM caddy:2.9.1-alpine

WORKDIR /var/app
COPY Caddyfile /etc/caddy

COPY --from=build /var/build/dist  .

EXPOSE 80