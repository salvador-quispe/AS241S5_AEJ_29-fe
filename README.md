# Apifron — AS241S5_AEJ_29-fe

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.9.

## CI/CD Pipelines

Este repositorio cuenta con **dos pipelines** de integración y despliegue continuo, ambos se activan al hacer push o pull request a la rama `develop`.

### Pipeline 1 — GitHub Actions + Docker Hub (`dockerhub-ci.yml`)

Construye la imagen Docker del frontend y la publica en Docker Hub.

| Paso | Descripción |
|------|-------------|
| Checkout | Clona el repositorio |
| Setup Node 20 | Configura el entorno Node |
| npm install | Instala dependencias |
| ng build | Compila la app Angular |
| Docker build | Construye la imagen con nginx |
| Docker push | Publica en Docker Hub |

**Secrets requeridos:**
- `DOCKERHUB_USERNAME` — tu usuario de Docker Hub
- `DOCKERHUB_TOKEN` — token de acceso de Docker Hub

---

### Pipeline 2 — GitHub Actions + Render (`pipeline.yml`)

Compila la app Angular en modo producción y dispara un deploy automático en [Render](https://render.com).

| Paso | Descripción |
|------|-------------|
| Checkout | Clona el repositorio |
| Setup Node 20 | Configura el entorno con caché npm |
| npm ci | Instala dependencias de forma limpia |
| ng build --prod | Compila en modo producción |
| Upload artifact | Guarda el `dist/` como artefacto |
| Render Deploy Hook | Llama al webhook de Render para iniciar el deploy |

**Secrets requeridos:**
- `RENDER_DEPLOY_HOOK_URL` — URL del deploy hook de tu servicio en Render
- `RENDER_SERVICE_URL` — URL pública del servicio desplegado (para notificación)

#### Cómo obtener el Deploy Hook de Render

1. Ingresa a [render.com](https://render.com) y crea un **Static Site** o **Web Service**
2. Ve a **Settings → Deploy Hook**
3. Copia la URL generada
4. Agrégala como secret `RENDER_DEPLOY_HOOK_URL` en GitHub → Settings → Secrets and variables → Actions

---

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and staore the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
