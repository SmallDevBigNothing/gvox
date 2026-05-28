# GVOX - Plataforma de Juegos

Plataforma web para gestionar y jugar juegos HTML5 con sistema de likes, verificacion y dashboard de administracion.

## Despliegue en Render

Este proyecto esta configurado para desplegarse en [Render](https://render.com).

### Configuracion automatica

1. Conecta tu repositorio de GitHub a Render
2. Selecciona este repositorio y la rama `render`
3. Render detectara automaticamente el `render.yaml` y configurara:
   - Runtime: Node.js
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Puerto: 3000 (configurable via `PORT` env var)

### Configuracion manual (si es necesario)

- **Nombre del servicio**: gvox-web
- **Region**: Selecciona la mas cercana a tus usuarios
- **Rama**: `render`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Variables de entorno**: 
  - `PORT`: 3000 (opcional, Render lo configura automaticamente)

## Estructura del proyecto

- `server.js`: Servidor Express con APIs y rutas
- `package.json`: Dependencias (express, cors)
- `files/`: Carpeta con archivos HTML de juegos
- `data.json`: Base de datos de likes, usuarios y reportes
- `index.html`: Pagina principal
- `games.html`: Plataforma de juegos
- `admin`: Dashboard de administracion (requiere parametro `acceso=TTT`)

## APIs disponibles

- `GET /api/games`: Lista todos los juegos disponibles
- `GET /api/file/:filename`: Obtiene un archivo en base64
- `GET /api/user`: Genera o verifica un userId
- `GET /api/user/likes/:userId`: Obtiene likes de un usuario
- `POST /api/like`: Añade o quita un like a un juego
- `GET /api/likes`: Obtiene todos los likes por juego
- `POST /api/log`: Registra actividad
- `POST /api/report`: Reporta un juego
- `DELETE /api/report/:id`: Elimina un reporte
- `POST /api/verify`: Verifica/desverifica un juego

## Rutas principales

- `/`: Pagina principal (index.html)
- `/files?acceso=MPL`: Plataforma de juegos
- `/admin?acceso=TTT`: Dashboard de administracion
- `/static/`: Archivos estaticos de juegos

## Notas

- Render proporciona HTTPS automaticamente, no es necesario configurar certificados SSL.
- El sistema de archivos en Render es efimero. Para persistencia de `data.json`, considera usar una base de datos externa o el servicio de Persistent Disk de Render.
- Los archivos en la carpeta `files/` se sirven como estaticos en `/static/`.
