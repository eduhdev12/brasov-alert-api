import { PrismaClient } from "@prisma/client";
import { ConsolaInstance } from "consola";

declare module 'fastify' {
  interface FastifyInstance extends 
  FastifyJwtNamespace<{namespace: 'security'}> {
  }
}

declare global {
  var logger: ConsolaInstance;
  var database: PrismaClient;
}

export {};
