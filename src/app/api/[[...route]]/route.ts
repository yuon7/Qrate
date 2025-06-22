import { Hono } from "hono";
import { handle } from "hono/vercel";
import restaurants from "../routes/restaurants";
import rooms from "../routes/rooms";
import tabelog from "../routes/tabelog";

export const runtime = "nodejs";

export const app = new Hono().basePath("/api");

// ルートを統合
app.route("/", restaurants);
app.route("/", rooms);
app.route("/", tabelog);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
