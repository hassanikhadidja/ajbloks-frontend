import bcrypt from "bcrypt";
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { requireAuth } from "@/lib/auth";
import { jsonMsg, jsonError, handleRouteError } from "@/lib/api-utils";
import { isValidPassword, passwordRequirementsMessage } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const { id } = await params;
    if (user!.role !== "admin" && String(user!._id) !== id) {
      return jsonError("Forbidden", 403);
    }

    await connectDB();
    const body = await req.json();

    if (body.role && user!.role !== "admin") {
      return jsonError("Cannot change role", 403);
    }

    const update: Record<string, unknown> = { ...body };
    delete update._id;

    if (update.password) {
      if (!isValidPassword(String(update.password))) {
        return jsonError(passwordRequirementsMessage(), 400);
      }
      update.password = await bcrypt.hash(String(update.password), 10);
    }

    await User.findByIdAndUpdate(id, update, { new: true });
    return jsonMsg("Update success", 202);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;
    if (user!.role !== "admin") return jsonError("Access denied - Admins only", 403);

    await connectDB();
    const { id } = await params;
    if (String(user!._id) === id) return jsonError("Cannot delete your own account", 400);

    const result = await User.deleteOne({ _id: id });
    if (result.deletedCount === 0) return jsonError("User not found", 404);
    return jsonMsg("User deleted", 200);
  } catch (error) {
    return handleRouteError(error);
  }
}
