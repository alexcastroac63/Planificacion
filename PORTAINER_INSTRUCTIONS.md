# Guía de Despliegue en Portainer (Stack)

Este proyecto está 100% preparado para ser desplegado como un **Stack de Docker Compose** en **Portainer**.

---

## 🛠️ Archivos de Configuración Incluidos

- **`docker-compose.yml`**: Configuración del servicio y mapeo de puertos (`8080:80`).
- **`Dockerfile`**: Construcción multi-etapa (`Node 20 Alpine` -> `Nginx Alpine`) para optimización de tamaño y rendimiento.
- **`nginx.conf`**: Servidor de archivos estáticos configurado con soporte SPA (Single Page Application), compresión Gzip y cabeceras de seguridad.
- **`.dockerignore`**: Exclusión de archivos innecesarios durante el proceso de build.

---

## 🚀 Opciones de Despliegue en Portainer

### Opción 1: Mediante Repositorio Git (Recomendado)

1. En tu panel de **Portainer**, ve al menú lateral y haz clic en **Stacks**.
2. Haz clic en **+ Add stack**.
3. Ingresa un nombre para el Stack, por ejemplo: `mrp-planificacion`.
4. En la sección **Build method**, selecciona **Repository**.
5. Ingresa la URL del repositorio Git donde subiste este código.
6. En **Repository reference**, ingresa la rama principal (ej. `refs/heads/main` o `main`).
7. En **Compose path**, asegúrate de que esté configurado como `docker-compose.yml`.
8. En las variables de entorno (Environment variables), opcionalmente puedes definir:
   - `PORT`: El puerto externo deseado en el host (por defecto `8080`).
9. Haz clic en **Deploy the stack**.

---

### Opción 2: Mediante el Editor Web de Portainer (Web editor)

1. En **Portainer**, ve a **Stacks** > **+ Add stack**.
2. Asigna un nombre (ej. `mrp-planificacion`).
3. En **Build method**, selecciona **Web editor**.
4. Copia y pega el contenido del archivo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mrp-app:
    build:
      context: .
      dockerfile: Dockerfile
    image: mrp-planificacion-app:latest
    container_name: mrp-planificacion-app
    restart: unless-stopped
    ports:
      - "${PORT:-8080}:80"
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:80/"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
```

5. Si estás usando una imagen previamente construida y subida a Docker Hub u otro registro, puedes reemplazar el bloque `build:` por `image: tu-usuario/mrp-planificacion:latest`.
6. Haz clic en **Deploy the stack**.

---

## 🔍 Verificación e Inspección

Una vez completado el despliegue:
- La aplicación estará disponible en `http://<IP-DE-TU-SERVIDOR>:8080`.
- El contenedor incluye un **Healthcheck** automatizado que valida la salud del servicio Nginx cada 30 segundos.
