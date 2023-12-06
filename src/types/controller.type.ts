import consola from "consola";
import {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
  FastifyError,
  FastifySchema,
} from "fastify";

export enum Methods {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

export interface IRoute {
  path: string;
  method: Methods;
  handler: (
    req: FastifyRequest<any>,
    reply: FastifyReply
  ) => void | Promise<void>;
  preHandler?: ((
    req: FastifyRequest,
    reply: FastifyReply,
    done: (err?: FastifyError) => void
  ) => void)[];
  schema?: FastifySchema;
}

export default abstract class Controller {
  public router: FastifyInstance;
  public abstract path: string;
  protected readonly routes: Array<IRoute> = [];

  constructor(router: FastifyInstance) {
    this.router = router;
  }

  public setRoutes = (): FastifyInstance => {
    for (const route of this.routes) {
      const options = {
        url: this.path + route.path,
        method: route.method,
        preHandler: route.preHandler,
        handler: route.handler,
        schema: route.schema,
      };

      try {
        this.router.route(options);
        consola.info(`${options.method}: ${options.url} registered`);
      } catch (error) {
        consola.error(`Error creating route ${route.path}: ${error}`);
      }
    }

    return this.router;
  };

  protected sendSuccess(
    reply: FastifyReply,
    data: object,
    message?: string
  ): FastifyReply {
    return reply.code(200).send({
      message: message || "success",
      data: data,
    });
  }

  protected sendError(reply: FastifyReply, message?: string): FastifyReply {
    return reply.code(500).send({
      message: message || "internal server error",
    });
  }
}
