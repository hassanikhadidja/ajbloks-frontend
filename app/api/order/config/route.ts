import { getOrderConfig } from "@/lib/order-config";
import { jsonCached } from "@/lib/api-utils";

export async function GET() {
  return jsonCached(getOrderConfig(), 3600, 86400);
}
