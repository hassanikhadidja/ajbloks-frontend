import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { requireAdmin } from "@/lib/auth";
import { jsonOk, handleRouteError } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    await connectDB();
    const users = await User.find().select("-password");
    return jsonOk(users);
  } catch (error) {
    return handleRouteError(error);
  }
}
