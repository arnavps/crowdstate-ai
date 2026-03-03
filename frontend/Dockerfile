FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build step is optional for development, but for monorepo setup we'll include it
# RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"]
