import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export const usersService = {
  async registerUser(payload: typeof users.$inferInsert) {
    // 1. Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, payload.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error("email sudah terdaftar");
    }

    // 2. Hash password using Bun's native password hashing
    const hashedPassword = await Bun.password.hash(payload.password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    // 3. Insert new user
    await db.insert(users).values({
      ...payload,
      password: hashedPassword,
    });

    return { success: true };
  },
};
