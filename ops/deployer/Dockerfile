FROM node:22-alpine
RUN apk add --no-cache docker-cli
WORKDIR /app
COPY server.mjs button.js projects.json ./
EXPOSE 8080
CMD ["node", "server.mjs"]
