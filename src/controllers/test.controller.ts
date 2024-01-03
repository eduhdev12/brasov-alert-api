import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AuthorizedRoute } from "../dto/auth.dto";
import Controller, { Methods } from "../types/controller.type";

export default class TestController extends Controller {
  public path = "/users";
  public routes = [
    {
      path: "",
      method: Methods.GET,
      handler: this.getAllUsers.bind(this),
    },
    {
      path: "/auth",
      method: Methods.GET,
      handler: this.checkAuth.bind(this),
      onRequest: [global.server.app.authenticate],
      schema: { ...AuthorizedRoute },
    },
  ];

  constructor(router: FastifyInstance) {
    super(router);
  }

  private async getAllUsers(req: FastifyRequest, reply: FastifyReply) {
    const users = await global.database.user.count();
    this.sendSuccess(reply, { users });
  }

  private async checkAuth(req: FastifyRequest, reply: FastifyReply) {
    return this.sendSuccess(reply, req.user);
  }
}
