FROM node:22-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package.json package-lock.json ./

RUN npm install

# Copy the rest of the application
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
