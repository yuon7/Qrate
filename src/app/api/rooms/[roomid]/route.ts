"use server";

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getRoomInfo(roomId: string) {
  if (!roomId) {
    return { success: false, error: "roomId が未定義です" };
  }
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "認証が必要です" };
  }

  let userProfile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (!userProfile) {
    userProfile = await prisma.profile.create({
      data: {
        userId: user.id,
        name:
          user.user_metadata?.name || user.email?.split("@")[0] || "ユーザー",
        avatarUrl: user.user_metadata?.avatar_url || null,
      },
    });
  }

  const roomWithParticipant = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      RoomParticipant: {
        include: {
          profile: {
            select: {
              name: true,
              avatarUrl: true,
              userId: true,
            },
          },
        },
      },
    },
  });

  if (!roomWithParticipant) {
    return { success: false, error: "ルームが見つかりません" };
  }

  return { success: true, room: roomWithParticipant };
}

async function joinRoom(roomId: string) {
  if (!roomId) {
    return { success: false, error: "roomId が未定義です" };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "認証が必要です" };
  }

  let userProfile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (!userProfile) {
    userProfile = await prisma.profile.create({
      data: {
        userId: user.id,
        name:
          user.user_metadata?.name || user.email?.split("@")[0] || "ユーザー",
        avatarUrl: user.user_metadata?.avatar_url || null,
      },
    });
  }

  const roomWithParticipant = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      RoomParticipant: {
        include: {
          profile: {
            select: {
              name: true,
              avatarUrl: true,
              userId: true,
            },
          },
        },
      },
    },
  });

  if (!roomWithParticipant) {
    return { success: false, error: "ルームが見つかりません" };
  }

  const already = roomWithParticipant.RoomParticipant.some(
    (p) => p.userId === user.id
  );
  if (already) {
    return { success: true, room: roomWithParticipant };
  }

  if (
    roomWithParticipant.RoomParticipant.length >= roomWithParticipant.maxUser
  ) {
    return { success: false, error: "ルームが満員です" };
  }

  await prisma.roomParticipant.create({
    data: {
      roomId,
      userId: user.id,
      isHost: false,
    },
  });

  const updatedRoom = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      RoomParticipant: {
        include: {
          profile: {
            select: {
              name: true,
              avatarUrl: true,
              userId: true,
            },
          },
        },
      },
    },
  });

  if (!updatedRoom) {
    return { success: false, error: "ルーム情報の取得に失敗しました" };
  }

  return { success: true, room: updatedRoom };
}

export async function GET(
  request: Request,
  { params }: { params: { roomid: string } }
) {
  const roomId = params.roomid;
  const result = await getRoomInfo(roomId);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result.room, { status: 200 });
}

export async function POST(
  request: Request,
  { params }: { params: { roomid: string } }
) {
  const roomId = params.roomid;
  const result = await joinRoom(roomId);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result.room, { status: 200 });
}
