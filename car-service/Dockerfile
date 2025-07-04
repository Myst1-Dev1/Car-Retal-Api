FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p uploads

RUN npm run build

EXPOSE 4000

CMD ["npm", "start"]