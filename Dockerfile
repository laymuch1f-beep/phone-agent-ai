FROM node:20-alpine 
WORKDIR /usr/src/app 
COPY package*.json ./ 
RUN npm ci --include=dev 
RUN chmod +x node_modules/.bin/nest 
COPY . . 
RUN npm run build 
EXPOSE 3000 
CMD ["npm", "run", "start:prod"] 
