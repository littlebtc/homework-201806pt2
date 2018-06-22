FROM node:10-stretch
RUN curl -o- -L https://yarnpkg.com/install.sh | bash
RUN mkdir /app
ADD package.json /app
ADD yarn.lock /app
WORKDIR /app
RUN yarn
ADD . /app
CMD ["node", "index.js"]

