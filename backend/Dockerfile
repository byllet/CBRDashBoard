FROM node:18-alpine AS dependencies

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production 

FROM node:18-alpine

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 

WORKDIR /app

COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules

COPY --chown=nodejs:nodejs package*.json ./

COPY --chown=nodejs:nodejs src/ ./src

USER nodejs 

ENV NODE_ENV=production
ENV PORT=15001
ENV DB_HOST=cbr-db-container
ENV DB_PORT=5432
ENV DB_USER=postgres
ENV DB_PASSWORD=password
ENV DB_NAME=cbr_db

CMD ["node", "src/app.js"]