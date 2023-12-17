import * as bcrypt from "bcrypt";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { LoginBody, RegisterBody } from "../dto/auth.dto";
import Controller, { ErrorResponse, Methods } from "../types/controller.type";

export default class AuthController extends Controller {
  public path = "/auth";
  public routes = [
    {
      path: "/login",
      method: Methods.POST,
      handler: this.loginUser.bind(this),
    },
    {
      path: "/register",
      method: Methods.POST,
      handler: this.registerUser.bind(this),
      schema: {
        body: {
          type: "object",
          properties: {
            email: { type: "string" },
            password: { type: "string" },
            confirmPassword: { type: "string" },
          },
          required: ["email", "password", "confirmPassword"],
        },
        response: {
          401: ErrorResponse,
          //   200: {},
        },
      },
    },
  ];

  constructor(router: FastifyInstance) {
    super(router);
  }

  private async loginUser(
    req: FastifyRequest<{ Body: LoginBody }>,
    reply: FastifyReply
  ) {
    const { email, password } = req.body;

    const searchUser = await global.database.user.findUnique({
      where: { email },
    });

    if (!searchUser) {
      return this.sendError(reply, "You are not authorized");
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      searchUser.password
    );

    if (!isPasswordCorrect) {
      return this.sendError(reply, "Password incorrect");
    }

    return this.sendSuccess(reply, searchUser);
  }

  private async registerUser(
    req: FastifyRequest<{
      Body: RegisterBody;
    }>,
    reply: FastifyReply
  ) {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return this.sendError(
        reply,
        "Confirm password doesn't match the password"
      );
    }

    const alreadyExists = await global.database.user.findUnique({
      where: { email },
    });

    if (!!alreadyExists) {
      return this.sendError(reply, "Email is already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newRegisteredUser = await global.database.user.create({
      data: { firstName, lastName, email, password: hashedPassword },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    return this.sendSuccess(
      reply,
      newRegisteredUser,
      "Registered successfully"
    );
  }
}
