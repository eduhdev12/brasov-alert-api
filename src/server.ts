import consola from "consola";
import fastify, { FastifyInstance } from "fastify";
import http from "http";
import { PORT } from "./config";

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
      consola.success(`Fastify server running on port ${this.port}`);
      return this.app.server;
    } catch (err) {
      consola.error(err);
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

  public loadControllers(controllers: any[]): void {
    //Array<Controller>
    this.app.register((app, args, done) => {
      controllers.forEach((controller) => {
        consola.info("-----------------------------");
        consola.info(`Registering ${controller.path} controller`);
        controller.setRoutes();
        consola.info("-----------------------------");
        done();
      });
    });
  }
}

export const createServer = () => {
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

      consola.success(
        `Incoming Request: ${request.method} ${request.url} from IP: ${ip}`
      );
      done();
    });
  }

  // server.loadMiddleware([testMiddleware]);
  // server.loadControllers(controllers);
  const httpServer = server.run();

  return httpServer;
};
