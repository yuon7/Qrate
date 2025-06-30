import { Hono } from "hono";
import { handle } from "hono/vercel";
import restaurants from "../routes/restaurants";
import rooms from "../routes/rooms";
import tabelog from "../routes/tabelog";
import roomsHistory from "../roomsHistory/route";

export const runtime = "nodejs";

export const app = new Hono().basePath("/api");

// ルートを統合
app.route("/", restaurants);
app.route("/", rooms);
app.route("/", tabelog);
app.route("/", roomsHistory);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
