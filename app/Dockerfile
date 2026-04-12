# -- build stage --
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# -- runtime stage --
FROM nginx:stable-alpine
# Only substitute API_UPSTREAM; otherwise envsubst mangles nginx’s $uri / $host (see invalid variable name errors).
ENV API_UPSTREAM=api:1442
# Dockerfile: use $$ so the image env value ends with a literal $ (awk end-of-string)
ENV NGINX_ENVSUBST_FILTER=^API_UPSTREAM$$
COPY --from=build /app/dist /usr/share/nginx/html
COPY default.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 80
