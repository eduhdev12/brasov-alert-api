import "@fastify/jwt";
import { IUser } from "./userJWT.type";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: IUser; // payload type is used for signing and verifying
    user: IUser; // user type is return type of `request.user` object
  }
}
