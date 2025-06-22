import { Hono } from "hono";

const app = new Hono();

app.post("/generateTabelogURL", async (c) => {
  try {
    const body = await c.req.json();
    const { lat, lng } = body;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return c.json(
        { error: "lat and lng are required and must be valid numbers." },
        400
      );
    }

    const { generateTabelogURL } = await import("@/lib/generateTabelogURL/generateTabelogURL");
    const tabelogCitycodeURL: string = await generateTabelogURL(lat, lng);
    return c.json({ tabelogURL: tabelogCitycodeURL });
  } catch (error) {
    console.error("Error generating final Tabelog URL:", error);
    return c.json({ error: "Failed to generate Tabelog URL" }, 500);
  }
});

export default app;