import * as bcrypt from "bcrypt";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  LoginBody,
  LoginResponse,
  RegisterBody,
  RegisterResponse,
} from "../dto/auth.dto";
import Controller, { ErrorResponse, Methods } from "../types/controller.type";

export default class AuthController extends Controller {
  public path = "/auth";
  public routes = [
    {
      path: "/login",
      method: Methods.POST,
      handler: this.loginUser.bind(this),
      schema: {
        tags: ["auth"],
        body: LoginBody,
        response: {
          200: LoginResponse,
          401: ErrorResponse,
        },
      },
    },
    {
      path: "/register",
      method: Methods.POST,
      handler: this.registerUser.bind(this),
      schema: {
        tags: ["auth"],
        body: RegisterBody,
        response: {
          200: RegisterResponse,
          401: ErrorResponse,
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

    const token = global.server.app.jwt.sign({
      id: searchUser.id,
      email: searchUser.email,
      name: `${searchUser.firstName} ${searchUser.lastName}`,
    });

    const newSession = await global.database.session.create({
      data: { token, user: { connect: { id: searchUser.id } } },
    });

    const { password: userPassword, ...loginUserData } = searchUser;

    return this.sendSuccess(reply, {
      ...loginUserData,
      token: newSession.token,
      sessionId: newSession.id,
    });
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
