import { PrismaClient } from "@prisma/client";
import consola from "consola";
import fastify, { FastifyInstance } from "fastify";
import http from "http";
import { PORT } from "./config";
import Controller from "./types/controller.type";
import TestController from "./controllers/test.controller";

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
    //Array<Controller>
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

  const controllers: Array<Controller> = [
    new TestController(app),
  ];

  // server.loadMiddleware([testMiddleware]);
  server.loadControllers(controllers);
  const httpServer = server.run();

  return httpServer;
};
