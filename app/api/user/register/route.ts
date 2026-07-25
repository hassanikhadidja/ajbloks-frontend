import bcrypt from "bcrypt";
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { jsonMsg, jsonError, handleRouteError } from "@/lib/api-utils";
import {
  isValidEmail,
  isValidPassword,
  passwordRequirementsMessage,
} from "@/lib/validators";
import { syncAccountMarketingEmail } from "@/lib/newsletter";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    if (body.role) return jsonError("Not auth !!", 400);

    const email = String(body.email ?? "").trim().toLowerCase();
    if (!isValidEmail(email)) return jsonError("Should be format email", 400);

    const existing = await User.findOne({ email });
    if (existing) return jsonError("Email exist please login", 400);

    if (!isValidPassword(String(body.password ?? ""))) {
      return jsonError(passwordRequirementsMessage(), 400);
    }

    const hashed = await bcrypt.hash(String(body.password), 10);
    const marketingEmail = body.marketingEmail !== false;
    const user = await User.create({
      email,
      password: hashed,
      name: body.name ? String(body.name) : undefined,
      marketingEmail,
    });

    try {
      await syncAccountMarketingEmail({
        email: user.email,
        name: user.name || "",
        userId: String(user._id),
        marketingEmail,
      });
    } catch (e) {
      console.warn("Newsletter sync on register failed", e);
    }

    return jsonMsg("Register success", 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
