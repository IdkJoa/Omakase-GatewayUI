# Manual de Instalación y Despliegue — Omakase Security Gateway & Dashboard

> **Versión del Sistema:** v1.0.0  
> **Fecha de Actualización:** Agosto 2026  
> **Destinatarios:** Evaluadores, Administradores de Infraestructura y Desarrolladores DevOps  

---

## 1. Visión General de la Arquitectura

**Omakase Security Gateway** es un ecosistema moderno de Zero Trust API Gateway y Dashboard de Seguridad guiado por eventos, orquestado mediante **.NET Aspire** y desplegable mediante **Docker Compose**.

El ecosistema está compuesto por los siguientes componentes centrales:
- **Omakase.AppHost (.NET Aspire Orchestrator):** Coordinador de microservicios, telemetría y contenedores auxiliares.
- **Omakase.Gateway.API (.NET 8/9 Web API):** Motor Zero Trust que procesa peticiones, valida JWT, evalúa políticas dinámicas y calcula el *Risk Score* en tiempo real.
- **OmakaseUI (Angular SPA):** Dashboard web reactivo para la visualización de métricas, auditoría forense, gestión de políticas y configuración de umbrales de riesgo.
- **Keycloak SSO (Identity Provider):** Servidor OpenID Connect / OAuth2 para gestión de identidades y tokens JWT en el Realm `omakase-gateway`.
- **PostgreSQL Database:** Almacenamiento persistente de políticas de seguridad, logs de auditoría forense, usuarios y perfiles de dispositivos.
- **Redis Cache:** Caché de alta velocidad para sesiones activas, contadores de Rate Limiting y estados de riesgo en caliente.
- **OpenTelemetry Collector & Aspire Dashboard:** Monitoreo distribuido de trazas, métricas y logs estructurados.

---

## 2. Requisitos Previos (Prerequisites)

Para ejecutar la instalación paso a paso en un **equipo limpio**, asegúrese de que el entorno cumpla con las siguientes especificaciones:

### 2.1. Requisitos de Sistema Operativo
- **Windows:** Windows 10/11 64-bit (Build 19041 o superior) con WSL2 habilitado.
- **Linux:** Ubuntu 22.04 LTS / Debian 12 / RHEL 9 (64-bit).
- **macOS:** macOS 13 (Ventura) o superior (Apple Silicon M1/M2/M3 o Intel).

### 2.2. Software Necesario

| Herramienta | Versión Mínima Recomendada | Comando de Verificación |
| :--- | :--- | :--- |
| **Docker Desktop / Engine** | v24.0+ (con Docker Compose v2.20+) | `docker --version` y `docker compose version` |
| **.NET SDK** | .NET 8.0 SDK o .NET 9.0 SDK | `dotnet --version` |
| **.NET Aspire Workload** | v8.0+ | `dotnet workload list` |
| **Node.js** | v18.18.0 o v20.x LTS | `node --version` |
| **pnpm / npm** | pnpm v8+ o npm v9+ | `pnpm --version` o `npm --version` |
| **Git** | v2.34+ | `git --version` |

#### Instalación de Workload de .NET Aspire (si no está instalado):
```bash
dotnet workload install aspire
```

### 2.3. Tabla de Puertos Requeridos

Asegúrese de que los siguientes puertos estén libres en la máquina anfitriona (*Host*):

| Puerto | Servicio | Protocolo / Propósito |
| :--- | :--- | :--- |
| **4200** | OmakaseUI (Angular SPA) | HTTP (Interfaz de Usuario) |
| **5028** | Omakase Gateway API | HTTP (`/api/v1`) |
| **8080** | Keycloak Identity Provider | HTTP (Realms & Admin Console) |
| **5432** | PostgreSQL DB | TCP (Persistencia principal) |
| **6379** | Redis Cache | TCP (Rate limiting & Cache) |
| **18888** | .NET Aspire Dashboard | HTTP (Telemetría & Monitoreo Local) |
| **4317 / 4318** | OpenTelemetry Collector | gRPC / HTTP (Trazas distribuidas) |

---

## 3. Configuración de Variables de Entorno

El sistema utiliza variables de entorno para desacoplar la configuración según el ambiente (**Development** vs **Production**).

### 3.1. Archivo `.env` Principal (Raíz del proyecto / Docker Compose)

Cree un archivo `.env` en la raíz del proyecto basándose en el siguiente esquema:

```env
# ==========================================
# ENTORNO Y GENERALES
# ==========================================
ASPNETCORE_ENVIRONMENT=Production
TZ=UTC

# ==========================================
# KEYCLOAK IDENTITY PROVIDER
# ==========================================
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin_secret_pass
KEYCLOAK_REALM=omakase-gateway
KEYCLOAK_ISSUER=http://localhost:8080/realms/omakase-gateway
KEYCLOAK_CLIENT_ID=omakase-dashboard

# ==========================================
# BASE DE DATOS POSTGRESQL
# ==========================================
POSTGRES_DB=omakasedb
POSTGRES_USER=omakase_user
POSTGRES_PASSWORD=omakase_db_password_2026
ConnectionStrings__OmakaseDb=Host=postgres;Port=5432;Database=omakasedb;Username=omakase_user;Password=omakase_db_password_2026

# ==========================================
# REDIS CACHE
# ==========================================
ConnectionStrings__Redis=redis:6379,abortConnect=false

# ==========================================
# GATEWAY API & CORS
# ==========================================
API_PORT=5028
CORS_ALLOWED_ORIGINS=http://localhost:4200,http://localhost:80

# ==========================================
# UI FRONTEND (ANGULAR)
# ==========================================
NG_APP_API_URL=http://localhost:5028/api/v1
NG_APP_KEYCLOAK_ISSUER=http://localhost:8080/realms/omakase-gateway
```

### 3.2. Configuración de Angular UI (`src/environments/environment.ts`)

Para el entorno local o compilado:

```typescript
export const environment = {
  production: true,
  API_URL: 'http://localhost:5028/api/v1',
  auth: {
    issuer: 'http://localhost:8080/realms/omakase-gateway',
    redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
    clientId: 'omakase-dashboard',
    scope: 'openid profile email',
    showDebugInformation: false,
    requireHttps: false,
  },
};
```

---

## 4. Levantamiento Local con .NET Aspire

.NET Aspire orquesta todos los microservicios, bases de datos y contenedores con un solo comando de ejecución.

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/IdkJoa/Omakase-GatewayUI.git
cd Omakase-GatewayUI
```

### Paso 2: Restaurar Dependencias y Ejecutar con .NET Aspire
```bash
# Restaurar paquetes de la solución .NET
dotnet restore

# Ejecutar el orquestador AppHost
dotnet run --project src/Omakase.AppHost/Omakase.AppHost.csproj
```

### Paso 3: Acceder al Dashboard de .NET Aspire
Una vez ejecutado, el Aspire AppHost imprimirá en la consola la URL del **Dashboard de Aspire** (habitualmente `http://localhost:18888` o con un token de acceso seguro).

Desde este panel podrá inspeccionar:
- Estado de ejecución de `omakase-api`, `keycloak`, `postgres`, `redis` y `omakase-ui`.
- **Logs unificados:** Visualización de consola de todos los microservicios en tiempo real.
- **Trazas (Traces):** Rastreo distribuido de peticiones HTTP entre el Gateway y las dependencias.
- **Métricas:** Consumo de CPU, memoria y rendimiento de endpoints.

### Paso 4: Levantar el Frontend Angular en Modo Desarrollo
En una consola secundaria:
```bash
# Instalar dependencias npm/pnpm
pnpm install   # o npm install

# Iniciar servidor de desarrollo Angular
npm start      # o ng serve
```
Abra el navegador en `http://localhost:4200`.

---

## 5. Generación y Despliegue con Docker Compose mediante `aspire publish`

Para entornos de producción o evaluación aislada sin depender del SDK de .NET instalado en el servidor final, genera los manifiestos de despliegue mediante el publicador de Aspire.

### Paso 5.1. Generar el Manifiesto de Aspire
Ejecute el siguiente comando para compilar el manifiesto JSON declarativo de la infraestructura:

```bash
dotnet run --project src/Omakase.AppHost/Omakase.AppHost.csproj -- --publisher manifest --output-path aspire-manifest.json
```

O utilice la herramienta `aspire publish` / `aspirate` para traducir automáticamente el manifiesto JSON a un archivo `docker-compose.yaml` completo:

```bash
# (Opcional) Instalar aspirate si se desea generación directa de Compose
dotnet tool install -g Aspirate

# Generar archivo docker-compose listo para producción
aspirate generate --manifest aspire-manifest.json --output-format docker-compose
```

### Paso 5.2. Archivo `docker-compose.yml` Generado

El manifiesto produce una configuración equivalente a la siguiente estructura declarativa lista para `docker compose`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: omakase-postgres
    environment:
      POSTGRES_DB: omakasedb
      POSTGRES_USER: omakase_user
      POSTGRES_PASSWORD: omakase_db_password_2026
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U omakase_user -d omakasedb"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: omakase-redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  keycloak:
    image: quay.io/keycloak/keycloak:24.0
    container_name: omakase-keycloak
    command: start-dev --import-realm
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin_secret_pass
    ports:
      - "8080:8080"
    volumes:
      - ./infra/keycloak/realm-export.json:/opt/keycloak/data/import/realm.json
    depends_on:
      postgres:
        condition: service_healthy

  omakase-api:
    build:
      context: .
      dockerfile: src/Omakase.Gateway.API/Dockerfile
    container_name: omakase-api
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__OmakaseDb=Host=postgres;Port=5432;Database=omakasedb;Username=omakase_user;Password=omakase_db_password_2026
      - ConnectionStrings__Redis=redis:6379,abortConnect=false
      - Keycloak__Authority=http://keycloak:8080/realms/omakase-gateway
    ports:
      - "5028:5028"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      keycloak:
        condition: service_started

  omakase-ui:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: omakase-ui
    ports:
      - "4200:80"
    depends_on:
      - omakase-api

volumes:
  postgres_data:
```

### Paso 5.3. Levantar Todo el Entorno con Docker Compose

Para poner en marcha la totalidad del sistema con un solo comando en un equipo limpio:

```bash
docker compose up -d --build
```

Verifique que todos los contenedores estén en estado `Running`:
```bash
docker compose ps
```

---

## 6. Verificación Post-Despliegue (Post-Deployment Check)

Siga esta lista de comprobación sintética para confirmar la salud y operatividad completa del entorno:

### 6.1. Verificación de Healthchecks de APIs y Servicios

1. **Gateway API Health:**
   ```bash
   curl -I http://localhost:5028/health
   # Respuesta esperada: HTTP/1.1 200 OK
   ```

2. **Endpoint de Métricas del Gateway:**
   ```bash
   curl http://localhost:5028/api/v1/metrics/health
   ```

3. **Keycloak OpenID Discovery Endpoint:**
   ```bash
   curl http://localhost:8080/realms/omakase-gateway/.well-known/openid-configuration
   # Respuesta esperada: JSON con endpoints 'authorization_endpoint', 'token_endpoint', etc.
   ```

4. **Frontend Angular UI:**
   Navegue a `http://localhost:4200`. Debería cargar la pantalla de bienvenida / login SSO de Omakase Gateway.

### 6.2. Flujo End-to-End de Verificación

1. Abra `http://localhost:4200` en su navegador.
2. Inicie sesión utilizando el usuario de prueba preconfigurado:
   - **Usuario:** `security.officer@omakase.local`
   - **Contraseña:** `Omakase2026!`
3. Acceda al módulo **Dashboard** y verifique la recepción de métricas de tráfico.
4. Vaya a **Audit Forense** y confirme que se cargan los eventos y logs del sistema.

---

## 7. Guía de Solución de Problemas Comunes (Troubleshooting)

### 🔴 Problema 1: Puerto ocupado (`Address already in use` / `port is already allocated`)
- **Causa:** Otro proceso local está utilizando los puertos `8080`, `5028`, `5432` o `4200`.
- **Solución:**
  Identifique el proceso conflictivo y deténgalo:
  - En **Windows (PowerShell):**
    ```powershell
    Get-NetTCPConnection -LocalPort 8080 | Select-Object OwningProcess
    Stop-Process -Id <PID> -Force
    ```
  - En **Linux/macOS:**
    ```bash
    sudo lsof -i :8080
    sudo kill -9 <PID>
    ```

### 🔴 Problema 2: Error de Token JWT / Issuer Mismatch en Keycloak
- **Causa:** La API o el Frontend intentan validar un token con una URL de emisor distinta (p. ej. `localhost` vs `keycloak` dentro de Docker).
- **Solución:**
  Asegúrese de que la variable `KEYCLOAK_ISSUER` o `Keycloak__Authority` coincida exactamente entre la configuración del frontend, la API y el contenedor de Keycloak. En entornos locales Docker, habilite la resolución de nombres de host agregando `127.0.0.1 keycloak` a su archivo `hosts` si se accede externamente.

### 🔴 Problema 3: Bloqueo de Peticiones por CORS (Cross-Origin Resource Sharing)
- **Causa:** El cliente Angular en `http://localhost:4200` realiza peticiones a `http://localhost:5028` y la API rechaza el origen.
- **Solución:**
  Verifique que en `appsettings.json` o la variable de entorno `CORS_ALLOWED_ORIGINS` de `omakase-api` esté incluida la URL del frontend:
  ```json
  "AllowedOrigins": [ "http://localhost:4200", "http://localhost:80" ]
  ```

### 🔴 Problema 4: Error de Conexión a PostgreSQL en el Arranque Inicial
- **Causa:** El contenedor de la API levanta antes de que la base de datos PostgreSQL haya completado la inicialización del esquema.
- **Solución:**
  Los contenedores están configurados con `healthcheck` y `depends_on: condition: service_healthy`. Si el error persiste, ejecute las migraciones manualmente:
  ```bash
  dotnet ef database update --project src/Omakase.Infrastructure
  ```

### 🔴 Problema 5: `aspire publish` / `aspirate` no encuentra el proyecto AppHost
- **Causa:** Ejecución del comando fuera del directorio raíz.
- **Solución:**
  Asegúrese de ejecutar el comando desde la carpeta donde se encuentra la solución `.sln` apuntando directamente al proyecto `src/Omakase.AppHost/Omakase.AppHost.csproj`.

---
*Manual redactado y estructurado para garantía de reproductibilidad en entornos de evaluación.*
