import { Hono } from "hono";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const app = new Hono();

app.get("/roomsHistory", async (c) => {
  const userId = c.req.query("userId");
  if (!userId) return c.json({ error: "userId is required" }, 400);

  const cookieStore = cookies(); // ✅ ここはすでに CookieStore そのもの
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: cookieStore, // ✅ 直接渡す
  });

  const { data, error } = await supabase
    .from("RoomParticipant")
    .select(
      `
      roomId,
      Room (
        id,
        area,
        createdAt,
        isClosed,
        mealType
      )
    `
    )
    .eq("userId", userId);

  if (error) {
    console.error("Supabase error:", error.message);
    return c.json({ error: "履歴データの取得に失敗しました" }, 500);
  }

  const parsedData = (data ?? []).map((item: any) => ({
    roomId: item.roomId,
    Room: Array.isArray(item.Room) ? item.Room[0] : item.Room,
  }));

  return c.json(parsedData);
});

export const GET = app.fetch;
