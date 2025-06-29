import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";

const prisma = new PrismaClient();
const app = new Hono();

app.post("/select-restaurant", async (c) => {
  try {
    const body = await c.req.json();
    const { restaurantData, recommendReason, matchScore, userId, roomId } =
      body;

    if (!restaurantData || !userId) {
      return c.json({ error: "Restaurant data and userId are required" }, 400);
    }

    // まずRestaurantを作成または取得
    let restaurant = await prisma.restaurant.findFirst({
      where: {
        name: restaurantData.name,
        url: restaurantData.url,
      },
    });

    if (!restaurant) {
      restaurant = await prisma.restaurant.create({
        data: {
          name: restaurantData.name,
          url: restaurantData.url,
          genre: restaurantData.genre,
          area: restaurantData.area,
          station: restaurantData.station,
          distance: restaurantData.distance,
          description: restaurantData.description,
          rating: restaurantData.rating,
          reviewCount: restaurantData.reviewCount,
          savedCount: restaurantData.savedCount,
          budgetDinner: restaurantData.budgetDinner,
          budgetLunch: restaurantData.budgetLunch,
          isHotRestaurant: restaurantData.isHotRestaurant || false,
        },
      });
    }

    const recommendedRestaurant = await prisma.recommendedRestaurant.create({
      data: {
        recommendReason,
        matchScore,
        userId,
        roomId,
        restaurantId: restaurant.id,
        isSelected: true,
      },
      include: {
        restaurant: true,
        room: true,
      },
    });

    return c.json(recommendedRestaurant, 201);
  } catch (error) {
    console.error("Error selecting restaurant:", error);
    return c.json({ error: "Failed to select restaurant" }, 500);
  }
});

export default app;