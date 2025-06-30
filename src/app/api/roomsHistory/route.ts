import { Hono } from "hono";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const roomsHistory = new Hono();

roomsHistory.get("/roomsHistory", async (c) => {
  const userId = c.req.query("userId");
  if (!userId) return c.json({ error: "userId is required" }, 400);

  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: cookieStore,
  });

  const { data, error } = await supabase
    .from("RoomParticipant")
    .select(
      `
      Room (
        area,
        mealType,
        date,
        createdAt
      )
    `
    )
    .eq("userId", userId);

  if (error) {
    console.error("Supabase error:", error.message);
    return c.json({ error: "履歴データの取得に失敗しました" }, 500);
  }

  const parsed = (data ?? [])
    .filter((item: any) => item.Room)
    .sort(
      (a: any, b: any) =>
        new Date(b.Room.createdAt).getTime() -
        new Date(a.Room.createdAt).getTime()
    )
    .slice(0, 10)
    .map((item: any) => item.Room);

  return c.json(parsed);
});

export default roomsHistory;
