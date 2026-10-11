import { sql } from "drizzle-orm";
import { db } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({ db: "online" });
  } catch {
    return Response.json({ db: "offline" }, { status: 503 });
  }
}
