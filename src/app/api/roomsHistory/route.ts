import { Hono } from "hono";
import { handle } from "hono/vercel";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const app = new Hono();

app.get("/", async (c) => {
  const userId = c.req.query("userId");
  if (!userId) {
    return c.json({ error: "userId is required" }, 400);
  }

  try {
    const cookieStore = cookies();

    // ★★★
    // お使いの @supabase/ssr のバージョンに合わせ、こちらの書き方を使用します。
    // 'createServerClient' に非推奨の警告(ts6387)が表示される場合がありますが、
    // これはエラーではないため、現時点では無視して問題ありません。
    // ★★★
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // Route Handlersではcookieのセットが失敗することがあるため、エラーを無視します
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: "", ...options });
            } catch (error) {
              // Route Handlersではcookieのセットが失敗することがあるため、エラーを無視します
            }
          },
        },
      }
    );

    const { data, error } = await supabase
      .from("RoomParticipant")
      .select(
        `
        roomId,
        Room!inner (
          area,
          mealType,
          createdAt,
          isClosed
        )
      `
      )
      .eq("userId", userId);

    if (error) {
      console.error("Supabase query error:", error.message);
      return c.json({ error: "データベースクエリに失敗しました" }, 500);
    }

    const formattedData = data.map((item) => ({
      roomId: item.roomId,
      ...(item.Room as any),
    }));

    return c.json(formattedData);
  } catch (e) {
    const error = e as Error;
    console.error("An unexpected error occurred:", error.message);
    return c.json({ error: "サーバーで予期せぬエラーが発生しました" }, 500);
  }
});

export const GET = handle(app);
