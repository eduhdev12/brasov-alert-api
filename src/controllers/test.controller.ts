import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
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
      path: "/",
      method: Methods.POST,
      handler: this.createUser.bind(this),
    },
    {
      path: "/:id",
      method: Methods.PUT,
      handler: this.updateUser.bind(this),
    },
    {
      path: "/:id",
      method: Methods.DELETE,
      handler: this.deleteUser.bind(this),
    },
  ];

  constructor(router: FastifyInstance) {
    super(router);
  }

  private async getAllUsers(req: FastifyRequest, reply: FastifyReply) {
    const users = await global.database.user.count();
    this.sendSuccess(reply, { users });
  }

  private async createUser(req: FastifyRequest, reply: FastifyReply) {}

  private async updateUser(req: FastifyRequest, reply: FastifyReply) {}

  private async deleteUser(req: FastifyRequest, reply: FastifyReply) {}
}
