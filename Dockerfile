FROM node:16.18.1

ENV APP_PORT=$APP_PORT

COPY . /app

WORKDIR /app


RUN cd /app && yarn cache clean && yarn install

RUN yarn prisma

RUN yarn run build

EXPOSE $APP_PORT

COPY ./entrypoint.sh /

ENTRYPOINT ["sh", "/entrypoint.sh" ]