import { createClient } from "@/utils/supabase/server";
import { Hono } from "hono";

const roomsHistory = new Hono();

roomsHistory.get("/roomsHistory", async (c) => {
  const userId = c.req.query("userId");
  if (!userId) return c.json({ error: "userId is required" }, 400);

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("RoomParticipant")
    .select(
      `
        roomId,
        Room (
          id,
          area,
          maxUser,
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
    .map((item: any) => ({
      roomId: item.roomId,
      Room: item.Room,
    }));

  return c.json(parsed);
});

export default roomsHistory;
