import { FileGeneratorImp } from '../../../file-generator/file-generator-imp';

const INDEX = `import Fastify from "fastify";
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
`;

export const INDEX_FILE_GENERATOR = new FileGeneratorImp('src/index.ts', INDEX);
