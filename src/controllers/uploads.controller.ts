import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fs from "fs";
import { AuthorizedRoute } from "../dto/auth.dto";
import Controller, { ErrorResponse, Methods } from "../types/controller.type";

export default class UploadsController extends Controller {
  public path = "/uploads";
  public routes = [
    {
      path: "/:file_name",
      method: Methods.GET,
      handler: this.getFile.bind(this),
      onRequest: [global.server.app.authenticate],
      schema: {
        tags: ["uploads"],
        response: {
          200: { type: "string", format: "binary" },
          500: ErrorResponse,
        },
        ...AuthorizedRoute,
      },
    },
  ];

  constructor(router: FastifyInstance) {
    super(router);
  }

  private async getFile(
    req: FastifyRequest<{ Params: { file_name: string } }>,
    reply: FastifyReply
  ) {
    const { file_name } = req.params;

    try {
      const filePath = `${process.cwd()}/uploads/${file_name}`;
      if (!fs.existsSync(filePath))
        return this.sendError(reply, "File is not existing");

      const file = fs.readFileSync(filePath);

      reply.header("Content-Type", "image/jpg");
      reply.header("Cache-Control", "public, max-age=31536000");
      reply.send(file);
    } catch (getError) {
      global.logger.error("get file error", getError);
      return this.sendError(reply, `Unable to get file ${file_name}`);
    }
  }
}
