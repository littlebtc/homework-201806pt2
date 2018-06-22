FROM node:6-stretch
RUN curl -o- -L https://yarnpkg.com/install.sh | bash
RUN mkdir /app
ADD package.json /app
ADD yarn.lock /app
WORKDIR /app
RUN yarn
ADD . /app
RUN yarn babel index.js --out-file app.js
CMD ["node", "app.js"]

