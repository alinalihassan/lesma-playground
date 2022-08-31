FROM node:alpine
WORKDIR /app
COPY ./package.json /app/
COPY ./package-lock.json /app/
RUN npm ci --legacy-peer-deps
COPY . /app
RUN npm run build
RUN npm install -g serve
EXPOSE 8080
CMD ["serve", "-s", "build", "-l", "8080"]