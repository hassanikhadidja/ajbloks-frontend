import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User, { IUser } from "@/lib/models/User";
import { jsonError } from "@/lib/api-utils";

function getSecret() {
  const secret = process.env.secretKey || process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT secret. Set `secretKey` or `JWT_SECRET`");
  return secret;
}

export function signToken(userId: string) {
  return jwt.sign({ _id: userId }, getSecret());
}

export function verifyToken(token: string) {
  return jwt.verify(token, getSecret()) as { _id: string };
}

export function getBearerToken(req: NextRequest): string | null {
  const header = req.headers.get("authorization");
  if (!header) return null;
  const [, token] = header.split(" ");
  return token || null;
}

export async function getAuthUser(req: NextRequest): Promise<IUser | null> {
  const token = getBearerToken(req);
  if (!token) return null;

  try {
    const decoded = verifyToken(token);
    await connectDB();
    const user = await User.findById(decoded._id).select("-password");
    return user;
  } catch {
    return null;
  }
}

export async function requireAuth(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return { user: null, error: jsonError("Unauthorized", 401) };
  return { user, error: null };
}

export async function requireAdmin(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return { user: null, error };
  if (user!.role !== "admin") return { user: null, error: jsonError("Access denied - Admins only", 403) };
  return { user, error: null };
}

export async function optionalAuth(req: NextRequest) {
  const user = await getAuthUser(req);
  return user;
}
