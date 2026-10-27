# Fulgor IA Analicer Economic — versión de demostración

> **Estado: DEMO TÉCNICA. No lista para decisiones económicas reales ni para monetización.**

Esta rama contiene una versión de trabajo de la interfaz y un servidor API en desarrollo. La compilación y las pruebas de humo no certifican la validez económica de sus resultados ni la seguridad integral para producción.

## Estado verificado
- CI: instalación de dependencias, comprobación TypeScript, compilación y prueba básica de servidor/API.
- La API versionada `/api/v1/*` requiere `FULGOR_API_KEY`, excepto `/api/v1/health`.
- El modo de demostración permanece activado en la interfaz.
- Los planes pagados están deshabilitados; no hay cobros configurados en esta rama.

## Limitaciones y bloqueos antes de producción
- Los conjuntos de datos, indicadores, rankings, parámetros y escenarios incluidos en el código pueden ser valores ilustrativos. No son prueba de una conexión a INEGI, FRED, Eurostat, OCDE, FMI u otra fuente.
- La ficha de una fuente y su enlace no acreditan que se haya descargado, validado o actualizado una serie.
- La inferencia causal, los intervalos, los pronósticos y las simulaciones requieren validación metodológica independiente y datos adecuados; no deben tratarse como resultados empíricos certificados.
- Los endpoints heredados `/api/copilot/chat`, `/api/digital-twin/simulate` y `/api/causal/did-analysis` no forman parte de la protección Bearer de `/api/v1/*`. Antes de alojar el servidor públicamente se debe decidir y probar una estrategia de autenticación, control de abuso y límites de consumo para ellos.
- La configuración de secretos, el alojamiento, la privacidad, la observabilidad operativa y las pruebas de seguridad de despliegue siguen pendientes.
- Stripe/Mercado Pago y la gestión real de suscripciones no están conectados.

## Requisitos para ejecución local
- Node.js 22 recomendado
- npm

```bash
npm install
cp .env.example .env
npm run lint
npm run build
npm start
```

Configure los secretos solo en el entorno del servidor o en un gestor de secretos. Nunca incluya claves privadas en el frontend ni en el repositorio. Para probar la API versionada, defina `FULGOR_API_KEY` con un valor aleatorio fuerte en el entorno del servidor.

## Endpoints y autenticación
- `GET /api/v1/health`: health check público.
- Los demás endpoints `/api/v1/*`: requieren `Authorization: Bearer <FULGOR_API_KEY>`.
- Los endpoints heredados `/api/*` requieren revisión de seguridad antes de exponerlos públicamente.

## Política de publicación
No fusionar ni desplegar automáticamente. Antes de una publicación pública, completar revisión de seguridad de todos los endpoints, pruebas funcionales y de accesibilidad, conexión y validación de fuentes reales, revisión metodológica, política de privacidad y verificación del entorno. No habilitar pagos sin autorización explícita.
