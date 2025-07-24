FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5001

CMD ["sh", "-c", "npm run db:deploy && npm run db:seed && npm run dev"]

