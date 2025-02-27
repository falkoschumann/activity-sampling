FROM node:lts AS build
WORKDIR /app
COPY ./ ./
RUN npm install
RUN npm run build

FROM nginx:stable

COPY --from=build /app/dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/spa.conf
