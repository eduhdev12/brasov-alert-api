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
