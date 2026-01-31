FROM node:22
WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3200

CMD ["sh", "-c", "npm run migrate && npm run prisma:generate && npm start"]