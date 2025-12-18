FROM node:20-bullseye 
WORKDIR /usr/src/app 
COPY package*.json ./ 
RUN npm ci --include=dev 
RUN chmod +x node_modules/.bin/nest 
RUN rm -rf dist 
COPY . . 
RUN npm run build 
EXPOSE 3000 
CMD ["npm", "run", "start:prod"] 
