import { db } from "../db";
import { users, session } from "../db/schema";
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

  async loginUser(payload: Pick<typeof users.$inferInsert, "email" | "password">) {
    // 1. Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, payload.email))
      .limit(1);

    if (!user) {
      throw new Error("email atau password salah");
    }

    // 2. Verify password
    const isPasswordValid = await Bun.password.verify(payload.password, user.password);
    if (!isPasswordValid) {
      throw new Error("email atau password salah");
    }

    // 3. Generate session token
    const token = crypto.randomUUID();

    // 4. Create session
    await db.insert(session).values({
      token,
      userId: user.id,
    });

    return token;
  },
};
