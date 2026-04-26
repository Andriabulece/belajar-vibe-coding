import { Elysia, t } from "elysia";
import { usersService } from "../services/users-service";

export const usersRoute = new Elysia({ prefix: "/api" }).post(
  "/users",
  async ({ body, set }) => {
    try {
      await usersService.registerUser(body);
      return { data: "ok" };
    } catch (error: any) {
      if (error.message === "email sudah terdaftar") {
        set.status = 400;
        return { error: error.message };
      }
      set.status = 500;
      return { error: "Internal Server Error", details: error.message };
    }
  },
  {
    body: t.Object({
      name: t.String(),
      email: t.String({ format: "email" }),
      password: t.String({ minLength: 6 }),
    }),
  }
)
.post(
  "/users/login",
  async ({ body, set }) => {
    try {
      const token = await usersService.loginUser(body);
      return { data: token };
    } catch (error: any) {
      if (error.message === "email atau password salah") {
        set.status = 401;
        return { error: error.message };
      }
      set.status = 500;
      return { error: "Internal Server Error", details: error.message };
    }
  },
  {
    body: t.Object({
      email: t.String({ format: "email" }),
      password: t.String(),
    }),
  }
);
