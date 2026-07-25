import bcrypt from "bcrypt";
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { signToken } from "@/lib/auth";
import { jsonMsg, jsonError, handleRouteError } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();
    const normalizedEmail = String(email ?? "").trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return jsonError("E-mail ou mot de passe incorrect.", 400);

    const match = await bcrypt.compare(String(password ?? ""), user.password);
    if (!match) return jsonError("E-mail ou mot de passe incorrect.", 400);

    const token = signToken(String(user._id));
    return jsonMsg("login success", 200, { token });
  } catch (error) {
    return handleRouteError(error);
  }
}
