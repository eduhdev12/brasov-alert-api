import consola from "consola";
import {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  FastifySchema,
} from "fastify";

export enum Methods {
  GET = "GET",
  POST = "POST",
  PATCH = "PATCH",
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
  preValidation?: ((
    req: FastifyRequest,
    reply: FastifyReply,
    done: (err?: FastifyError) => void
  ) => void)[];
  schema?: FastifySchema;
  onRequest?: any;
}

export interface IError {
  message?: string;
  error: string;
  statusCode: number;
}

export const ErrorResponse = {
  type: "object",
  properties: {
    message: {
      type: "string",
    },
    error: {
      type: "string",
    },
    statusCode: {
      type: "number",
    },
  },
  required: ["message", "statusCode"],
};

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
        preValidation: route.preValidation,
        preHandler: route.preHandler,
        handler: route.handler,
        schema: route.schema,
        onRequest: route.onRequest,
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
      statusCode: 500,
    });
  }
}
