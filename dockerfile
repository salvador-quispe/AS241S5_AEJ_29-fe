FROM node:20-alpine AS build

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build -- --configuration production

# Angular SSR genera index.csr.html, lo copiamos como index.html
RUN cp /app/dist/apifron/browser/index.csr.html /app/dist/apifron/browser/index.html

FROM nginx:alpine

COPY --from=build /app/dist/apifron/browser /usr/share/nginx/html

RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
