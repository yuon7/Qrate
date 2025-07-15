import createServiceClient from "@/utils/supabase/service";
import { Hono } from "hono";

const roomsHistory = new Hono();

roomsHistory.get("/roomsHistory", async (c) => {
  const userId = c.req.query("userId");
  if (!userId) return c.json({ error: "userId is required" }, 400);

  try {
    const supabase = createServiceClient();

    // 直接データを取得（認証チェックを削除）
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
      console.error("Error details:", error);
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
  } catch (error) {
    console.error("Service client error:", error);
    return c.json({ error: "サービスエラーが発生しました" }, 500);
  }
});

export default roomsHistory;
