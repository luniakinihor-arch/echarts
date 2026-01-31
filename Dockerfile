FROM node:22
WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ENV PORT 3200

EXPOSE 3200

CMD ["sh", "-c", "npm run migrate && npm run prisma:generate && npm run dev"]