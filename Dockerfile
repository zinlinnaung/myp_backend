
FROM node:18


WORKDIR /app


COPY package*.json ./


RUN npm install --legacy-peer-deps

COPY . .


RUN npm run build

# Install PM2 globally
RUN npm install -g pm2



EXPOSE 7056

# Run the NestJS application
CMD ["pm2-runtime", "dist/main.js"]
