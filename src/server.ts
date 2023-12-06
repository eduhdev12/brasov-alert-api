import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi, { FastifySwaggerUiOptions } from "@fastify/swagger-ui";
import { PrismaClient } from "@prisma/client";
import consola from "consola";
import fastify, { FastifyInstance } from "fastify";
import http from "http";
import { PORT } from "./config";
import TestController from "./controllers/test.controller";
import Controller from "./types/controller.type";

export const swaggerOptions = {
  swagger: {
    info: {
      title: "Brasov alert API",
      description: "API Documentation",
      version: "1.0.0",
    },
  },
  exposeRoute: true,
};

export const swaggerUiOptions: FastifySwaggerUiOptions = {
  routePrefix: "/docs",
  uiConfig: {
    docExpansion: "full",
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
  transformSpecification: (swaggerObject, request, reply) => {
    return swaggerObject;
  },
  transformSpecificationClone: true,
  // logo: {
  //   type: "image/png",
  //   content: // INSERT CONTENT HERE
  // },
};

export default class Server {
  private app: FastifyInstance;
  private readonly port: number;

  constructor(app: FastifyInstance, port: number) {
    this.app = app;
    this.port = port;
  }

  public async run(): Promise<http.Server> {
    try {
      await this.app.listen({ port: this.port, host: "0.0.0.0" });
      global.logger.success(`Fastify server running on port ${this.port}`);
      return this.app.server;
    } catch (err) {
      global.logger.error(err);
      process.exit(1);
    }
  }

  public loadMiddleware(middlewares: Array<any>): void {
    this.app.addHook("onRoute", (routeOptions) => {
      if (routeOptions.preHandler && Array.isArray(routeOptions.preHandler)) {
        routeOptions.preHandler = [...routeOptions.preHandler, ...middlewares];
      } else {
        routeOptions.preHandler = [...middlewares];
      }
    });
  }

  public loadControllers(controllers: Array<Controller>): void {
    this.app.register((app, args, done) => {
      controllers.forEach((controller) => {
        global.logger.info("-----------------------------");
        global.logger.info(`Registering ${controller.path} controller`);
        controller.setRoutes();
        global.logger.info("-----------------------------");
        done();
      });
    });
  }
}

export const createServer = () => {
  const prisma = new PrismaClient();

  global.logger = consola;
  global.database = prisma;

  const app = fastify({
    ajv: {
      customOptions: { allErrors: true, logger: console },
    },
  });
  const server = new Server(app, PORT);

  if (process.env.TS_NODE_DEV) {
    app.addHook("onRequest", (request, reply, done) => {
      let ip =
        request.ip ||
        request.headers["x-real-ip"] ||
        request.headers["x-forwarded-for"] ||
        request.connection.remoteAddress;
      if (request.headers["cf-connecting-ip"]) {
        ip = request.headers["cf-connecting-ip"];
      }

      global.logger.success(
        `Incoming Request: ${request.method} ${request.url} from IP: ${ip}`
      );
      done();
    });
  }

  app.register(fastifySwagger, swaggerOptions);
  app.register(fastifySwaggerUi, swaggerUiOptions);

  const controllers: Array<Controller> = [new TestController(app)];

  // server.loadMiddleware([testMiddleware]);
  server.loadControllers(controllers);
  const httpServer = server.run();

  return httpServer;
};
