FROM node:22
WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build
RUN npm run migrate
RUN npm run prisma:generate

EXPOSE 3200

CMD ["npm", "start"]