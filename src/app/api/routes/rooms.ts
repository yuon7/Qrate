import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";

const prisma = new PrismaClient();
const app = new Hono();

// TODO: 仮置き、ルーム参加ができたら消す
app.get("/rooms", async (c) => {
  try {
    const rooms = await prisma.room.findMany({
      where: { isClosed: false },
      orderBy: { createdAt: "desc" },
    });
    return c.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return c.json({ error: "Failed to fetch rooms" }, 500);
  }
});

app.get("/rooms/:roomId", async (c) => {
  try {
    const roomId = c.req.param("roomId");
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { RoomParticipant: true },
    });
    
    if (!room) {
      return c.json({ error: "Room not found" }, 404);
    }
    
    return c.json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    return c.json({ error: "Failed to fetch room" }, 500);
  }
});

app.get("/rooms/:roomId/messages", async (c) => {
  try {
    const roomId = c.req.param("roomId");
    const messages = await prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: "asc" },
    });
    return c.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return c.json({ error: "Failed to fetch messages" }, 500);
  }
});

app.post("/rooms/:roomId/messages", async (c) => {
  try {
    const roomId = c.req.param("roomId");
    const body = await c.req.json();
    const { text, userId } = body;

    if (!text || !userId) {
      return c.json({ error: "Text and userId are required" }, 400);
    }

    const newMessage = await prisma.message.create({
      data: {
        text,
        userId,
        roomId,
      },
    });

    return c.json(newMessage, 201);
  } catch (error) {
    console.error("Error creating message:", error);
    return c.json({ error: "Failed to create message" }, 500);
  }
});

app.get("/rooms/:roomId/participants", async (c) => {
  try {
    const roomId = c.req.param("roomId");
    const participants = await prisma.roomParticipant.findMany({
      where: { roomId },
    });
    return c.json(participants);
  } catch (error) {
    console.error("Error fetching participants:", error);
    return c.json({ error: "Failed to fetch participants" }, 500);
  }
});

app.get("/rooms/:roomId/recommended-restaurants", async (c) => {
  try {
    const roomId = c.req.param("roomId");
    const recommendedRestaurants = await prisma.recommendedRestaurant.findMany({
      where: { roomId },
      include: {
        restaurant: true,
      },
      orderBy: { matchScore: "desc" },
    });
    return c.json(recommendedRestaurants);
  } catch (error) {
    console.error("Error fetching recommended restaurants:", error);
    return c.json({ error: "Failed to fetch recommended restaurants" }, 500);
  }
});

export default app;