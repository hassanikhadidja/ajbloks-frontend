import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { jsonOk, handleRouteError } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;
    return jsonOk(user);
  } catch (error) {
    return handleRouteError(error);
  }
}
