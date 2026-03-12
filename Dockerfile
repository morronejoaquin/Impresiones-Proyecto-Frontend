# Etapa de construcción
FROM node:20-alpine AS build
WORKDIR /app

# 1. Copiamos los archivos de dependencias desde la subcarpeta Workspace
COPY Workspace/package*.json ./
RUN npm install --legacy-peer-deps

# 2. Copiamos TODO el contenido de la subcarpeta Workspace al contenedor
# Esto asegura que el package.json y angular.json queden en /app
COPY Workspace/ .

# 3. Ahora sí encontrará el script "build" en el package.json copiado
RUN npm run build -- --configuration=production

# Etapa de servidor Nginx
FROM nginx:alpine

# Limpiamos archivos por defecto
RUN rm -rf /usr/share/nginx/html/*

# Copiamos la configuración (asegúrate que nginx.conf esté junto al Dockerfile)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos los archivos generados
# Según tu angular.json, el nombre es Workspace
COPY --from=build /app/dist/Workspace/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]