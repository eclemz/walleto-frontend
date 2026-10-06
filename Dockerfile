FROM node:22-alpine AS builder

RUN rm -rf /var/cache/apk/* && apk update && apk upgrade

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build


FROM node:22-alpine AS runner

RUN rm -rf /var/cache/apk/* && apk update && apk upgrade

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./

RUN rm -rf /usr/local/lib/node_modules/npm \
    /usr/local/bin/npm \
    /usr/local/bin/npx

USER node

EXPOSE 3000

CMD ["node_modules/.bin/next", "start"]