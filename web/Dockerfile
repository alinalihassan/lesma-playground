# Specify a base image
FROM node:alpine

WORKDIR '/app'

# Install some depenendencies
COPY package.json .
RUN yarn install
COPY . .

# Uses port which is used by the actual application
ENV PORT=8080
EXPOSE 8080

# Default command
CMD ["yarn", "run", "start"]