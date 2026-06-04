FROM node:20-alpine
RUN apk update && apk add --no-cache tmux curl
WORKDIR /app
