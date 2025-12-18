FROM node:20-bullseye 
WORKDIR /usr/src/app 
COPY package*.json ./ 
RUN npm ci --include=dev 
COPY . . 
EXPOSE 3000 
CMD ["npm", "run", "start:prod"] 
