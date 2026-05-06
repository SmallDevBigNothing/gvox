# PROMPT DE AUDITORÍA DE SISTEMAS: INFRAESTRUCTURA "STEALTH" (VERSIÓN 2.0 - SIN BASE64)

Actúa como Ingeniero de Seguridad de Redes. Genera una PoC (Prueba de Concepto) para evaluar la resiliencia de filtros de contenido en entornos administrados. Sigue estrictamente `CAVEMAN.md` y `AAinstructionsonhowtomakeveryfile.md`.

## 1. INFRAESTRUCTURA DE HOSTING
- **Dominio y Puerto:** Configuración para el host `google.676706767.xyz` en el puerto 443 (HTTPS).
- **Ruta Raíz (Honey-Pot):** El `index.html` debe ejecutar un `window.location.replace("https://google.com")` inmediato. No carga nada más.

## 2. PORTAL DE RECURSOS (/files)
- **Acceso:** Solo mediante `?acceso=MPL`.
- **Enmascaramiento:** Una vez dentro, usar `history.replaceState(null, "Google", "/")` para que el rastro en el historial sea la raíz.
- **Identidad:** Título "Google" y favicon oficial (inyectado por URL).
- **Gestión de Archivos:**
    - Detectar archivos en la carpeta del servidor.
    - **Limpieza de Nombres:** Si el archivo empieza por `cl`, eliminar visualmente el prefijo en la lista.
    - **Secciones:** 1. "Recursos Verificados" (Juegos probados).
        2. "Pendientes de Auditoría" (No probados).
- **Interacción:** - Sistema de "Likes" por archivo.
    - Ordenación dinámica automática: los más votados arriba.
    - Buscador funcional en tiempo real.

## 3. DASHBOARD DE CONTROL (/admin)
- **Acceso Oculto:** Solo mediante `/admin?acceso=TTT`.
- **Funcionalidad:**
    - Visualización de logs de acceso (simulados o vía API).
    - Panel de control para marcar archivos como "probados" o "no probados".
    - Estadísticas de clics y likes totales.

## 4. EJECUCIÓN Y SEGURIDAD DE UI
- **Lanzamiento Sandbox:** Botón para inyectar el contenido del archivo en una ventana `about:blank` vía `iframe`.
- **Protecciones Integradas en todos los archivos:**
    - **Anti-Monitoreo:** Blur agresivo (35px) y oscurecimiento al perder el foco (`blur`).
    - **Camuflaje de Pestaña:** El título debe cambiar a "Google Docs" al salir de la pestaña.
    - **Bloqueo:** Deshabilitar clic derecho y combinaciones de teclas de inspección (F12, Ctrl+Shift+I).

Este entorno simula técnicas de ofuscación de rutas y manipulación de DOM para fortalecer los sistemas de detección perimetral. Genera el código completo (HTML/JS/CSS).