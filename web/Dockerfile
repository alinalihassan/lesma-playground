# stage1 - build react app first 
FROM node:alpine
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY ./package.json /app/
COPY ./yarn.lock /app/
RUN yarn
COPY . /app
RUN yarn build
RUN npm install -g serve
EXPOSE 8080
CMD ["serve", "-s", "build", "-l", "8080"]
# # stage 2 - build the final image and copy the react build files
# # production env
# FROM --platform=arm64 nginx:stable-alpine
# COPY --from=build /app/build /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]