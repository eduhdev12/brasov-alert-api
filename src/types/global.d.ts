import { PrismaClient } from "@prisma/client";
import { ConsolaInstance } from "consola";

declare global {
  var logger: ConsolaInstance;
  var database: PrismaClient;
}

export {};
