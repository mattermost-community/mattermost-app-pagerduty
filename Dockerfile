FROM node:16.1

WORKDIR /mattermost-app-trello
COPY package.json .
RUN npm install
COPY . .

CMD [ "npm", "start" ]
