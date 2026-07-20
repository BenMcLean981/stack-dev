## eslint.config.mjs

```
import base from '@acme/eslint-config/base.mjs';

export default [...base, { ignores: ['**/dist/**'] }];
```

## package.json

```
{
  "name": "@acme/widget",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "prebuild": "pnpm check-types",
    "build": "tsup",
    "start": "node dist/index.mjs",
    "check-types": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier . --write",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@fastify/swagger": "catalog:",
    "@fastify/swagger-ui": "catalog:",
    "fastify": "catalog:",
    "pino-pretty": "catalog:"
  },
  "devDependencies": {
    "@acme/eslint-config": "workspace:*",
    "@acme/prettier-config": "workspace:*",
    "@acme/typescript-config": "workspace:*",
    "@types/node": "catalog:",
    "eslint": "catalog:",
    "prettier": "catalog:",
    "tsup": "catalog:",
    "tsx": "catalog:",
    "typescript": "catalog:",
    "vitest": "catalog:"
  },
  "type": "module"
}
```

## prettier.config.mjs

```
import base from '@acme/prettier-config/base.mjs';

export default base;
```

## src/index.ts

```
import Fastify from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";

const fastify = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
    },
    serializers: {
      res(reply) {
        // The default
        return {
          statusCode: reply.statusCode,
        };
      },
      req(request) {
        return {
          method: request.method,
          url: request.url,
          path: request.routeOptions.url,
          parameters: request.params,
          // Including headers in the log could violate privacy laws,
          // e.g., GDPR. Use the "redact" option to remove sensitive
          // fields. It could also leak authentication data in the logs.
          headers: request.headers,
        };
      },
    },
  },
});

await registerSwagger();

registerRoutes();

function registerRoutes() {
  fastify.get("/", async () => {
    return { hello: "world", docs: "/docs" };
  });

  fastify.get<{
    Params: { a: string; b: string };
  }>(
    "/add/:a/:b",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            a: { type: "string" },
            b: { type: "string" },
          },
          required: ["a", "b"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              result: { type: "number" },
            },
          },
        },
      },
    },
    async (request) => {
      // request.params.a should now be recognized as a string
      const a = Number(request.params.a);
      const b = Number(request.params.b);

      return { result: a + b };
    }
  );
}

async function registerSwagger() {
  await fastify.register(fastifySwagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "Test swagger",
        description: "Testing the Fastify swagger API",
        version: "0.1.0",
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Development server",
        },
      ],
      components: {
        securitySchemes: {
          apiKey: {
            type: "apiKey",
            name: "apiKey",
            in: "header",
          },
        },
      },
      externalDocs: {
        url: "https://swagger.io",
        description: "Find more info here",
      },
    },
  });

  await fastify.register(fastifySwaggerUI, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next();
      },
      preHandler: function (request, reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject) => {
      return swaggerObject;
    },
    transformSpecificationClone: true,
  });
}

async function start() {
  try {
    const port = Number(process.env.PORT) || 3000;
    await fastify.listen({ port });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
```

## tsconfig.json

```
{
  "extends": "@acme/typescript-config/tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

## tsup.config.ts

```
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  target: "esnext",
  outExtension({ format }) {
    return {
      js: format === "esm" ? ".mjs" : ".js",
    };
  },
});
```

## vitest.config.ts

```
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
    },
    environment: 'node',
  },
});
```
