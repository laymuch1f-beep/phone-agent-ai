FROM node:20-bullseye 
WORKDIR /usr/src/app 
COPY package*.json ./ 
RUN npm ci --include=dev 
COPY . . 
RUN npm install --include=dev "&&" chmod +x node_modules/.bin/nest "&&" npx nest build 
EXPOSE 3000 
CMD ["npm", "run", "start:prod"] 
