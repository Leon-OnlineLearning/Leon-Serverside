FROM node:16.3-slim

WORKDIR /code

COPY ["package.json", "package-lock.json*", "./"]

# minor update suggested by node
# RUN npm install -g npm@7.6.3 
RUN npm install

# error at application running remove when image update
# RUN chown -R 1000:1000 "/root/.npm"
COPY . .

USER node

# the symlinks won't doesn't work in shared env
# this workaround runs tsc from npx
CMD [ "npm", "run", "dev_docker"]

