FROM node:24.13.1-alpine

# Install Nginx
RUN apk add -U nginx

# Install Dependencies
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn

# Build Application
COPY . ./
RUN yarn build

RUN mkdir -p /var/www/html/ /run/nginx \
  && mv dist/* /var/www/html/

COPY assets/default.conf /etc/nginx/http.d/default.conf


EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
