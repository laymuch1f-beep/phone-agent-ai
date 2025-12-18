FROM node:20-bullseye 
WORKDIR /usr/src/app 
COPY package*.json ./ 
RUN npm ci --include=dev 
RUN find /usr/src/app/node_modules/.bin -type f -exec chmod +x {} \; 
COPY . . 
RUN /usr/src/app/node_modules/.bin/nest build 
EXPOSE 3000 
CMD ["npm", "run", "start:prod"] 
