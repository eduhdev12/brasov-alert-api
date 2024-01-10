import { Localitate } from "@prisma/client";

const LocationSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    description: { type: "string" },
    resolved: { type: "boolean" },
    images: { type: "array", items: { format: "binary" } },
    localitate: { type: "string" },
    authorId: { type: "number" },
    resolvedById: { type: "number" },
    createdAt: { type: "string", format: "date" },
    updatedAt: { type: "string", format: "date" },
  },
  required: [
    "id",
    "name",
    "resolved",
    "localitate",
    "authorId",
    "createdAt",
    "updatedAt",
  ],
};

const LocationWithUserSchema = {
  ...LocationSchema,
  properties: {
    ...LocationSchema.properties,
    author: {
      type: "object",
      properties: {
        id: { type: "number" },
        firstName: { type: "string" },
        lastName: { type: "string" },
        email: { type: "string" },
      },
    },
  },
};

export const ManipulateReport = {
  type: "object",
  properties: {
    name: { type: "string" },
    description: { type: "string" },
    images: { type: "array", items: { type: "string", format: "byte" } },

    localitate: { type: "string" },
  },
  required: ["name", "description", "localitate"],
};

export interface IManipulateReport {
  name: string;
  description?: string;
  images: string[];

  localitate: Localitate;
}

export const LocationReportsResponse = {
  type: "object",
  properties: {
    message: { type: "string" },
    data: {
      type: "array",
      items: LocationSchema,
    },
  },
  required: ["data"],
};

export const LocationReportsWithUserResponse = {
  type: "object",
  properties: {
    message: { type: "string" },
    data: {
      type: "array",
      items: LocationWithUserSchema,
    },
  },
  required: ["data"],
};

export const TouchedReport = {
  type: "object",
  properties: {
    message: { type: "string" },
    data: LocationSchema,
  },
  required: ["data"],
};
