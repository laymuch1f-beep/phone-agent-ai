FROM node:20-bullseye 
WORKDIR /usr/src/app 
COPY package*.json ./ 
RUN npm ci --include=dev 
RUN rm -rf dist node_modules   # ? CLEAN BOTH
RUN npm ci --include=dev       # ? REINSTALL
COPY . . 
RUN npx nest build 
EXPOSE 3000 
CMD ["npm", "run", "start:prod"] 
