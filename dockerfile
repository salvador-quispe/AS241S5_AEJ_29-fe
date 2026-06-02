FROM node:20-alpine AS build

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build -- --configuration production

FROM nginx:alpine

# Copia los archivos del build de Angular (browser)
COPY --from=build /app/dist/apifron/browser /usr/share/nginx/html

# Angular con SSR genera index.csr.html — lo renombramos a index.html
RUN mv /usr/share/nginx/html/index.csr.html /usr/share/nginx/html/index.html

# Config nginx para que el routing de Angular funcione
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
