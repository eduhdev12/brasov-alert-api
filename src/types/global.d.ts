import { PrismaClient } from "@prisma/client";
import { ConsolaInstance } from "consola";
import Server from "../server";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: any;
  }
}
declare global {
  var server: Server;
  var logger: ConsolaInstance;
  var database: PrismaClient;
}

export {};
