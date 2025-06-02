## Como correr los test

#### Unitarios

```sh
npm test
```

#### e2e

Hay que tener levantado el front y el back además de agregar esta variable de entorno

```
WEB_SERVER_URL="http://localhost:8080"
```

```sh
npx playwright test
```

Correr con resumen de video de la prueba

```sh
npx playwright test --ui
```

Se puede hacer en entorno de desarrollo, pero es probable que falle por tiempos de compilación, por eso es preferible hacerlo en un entorno compilado con

```sh
npm run build
npm run start
```