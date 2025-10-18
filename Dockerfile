FROM node:22-alpine

RUN apk add --no-cache python3 make g++ unixodbc unixodbc-dev

WORKDIR /app
COPY package*.json ./
RUN npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-timeout 600000 && \
    npm config set registry https://registry.npmjs.org/ && \
    npm install --legacy-peer-deps
COPY . . 
RUN npm run build 
CMD [ "npm", "run", "start:dev" ]