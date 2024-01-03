export interface LoginBody {
  email: string;
  password: string;
}

export interface RegisterBody {
  firstName: string;
  lastName: string;

  email: string;
  password: string;
  confirmPassword: string;
}

export const AuthorizedRoute = {
  headers: {
    type: "object",
    properties: {
      Authorization: { type: "string" },
    },
    required: ["Authorization"],
  },
};

export const LoginBody = {
  type: "object",
  properties: {
    email: { type: "string" },
    password: { type: "string" },
  },
  required: ["email", "password"],
};

export const LoginResponse = {
  type: "object",
  properties: {
    message: { type: "string" },
    data: {
      type: "object",
      properties: {
        id: { type: "number" },
        firstName: { type: "string" },
        lastName: { type: "string" },
        email: { type: "string" },
        token: { type: "string" },
        sessionId: { type: "string" },
      },
      required: ["id", "firstName", "lastName", "email", "token", "sessionId"],
    },
    statusCode: { type: "number" },
  },
};

export const RegisterBody = {
  type: "object",
  properties: {
    firstName: { type: "string" },
    lastName: { type: "string" },

    email: { type: "string" },

    password: { type: "string" },
    confirmPassword: { type: "string" },
  },
  required: ["firstName", "lastName", "email", "password", "confirmPassword"],
};

export const RegisterResponse = {
  type: "object",
  properties: {
    message: { type: "string" },
    data: {
      type: "object",
      properties: {
        id: { type: "number" },
        email: { type: "string" },
        firstName: { type: "string" },
        lastName: { type: "string" },
      },
      required: ["id", "email", "firstName", "lastName"],
    },
    statusCode: { type: "number" },
  },
};
