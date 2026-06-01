# Dockerfile para GVOX - Plataforma de Juegos
FROM node:20-alpine

# Configurar directorio de trabajo
WORKDIR /app

# Copiar archivos de la aplicacion
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm install --production

# Copiar el resto de los archivos
COPY . .

# Exponer el puerto
EXPOSE 3000

# Variable de entorno para el puerto
ENV PORT=3000

# Comando para iniciar la aplicacion
CMD ["node", "server.js"]
