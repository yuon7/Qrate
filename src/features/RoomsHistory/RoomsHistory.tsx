"use client";

import { fetchRoomsHistory } from "@/lib/fetchRoomsHistory/fetchRoomsHistory";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Room {
  id: string;
  area: number;
  createdAt: string;
  date: string;
  isClosed: boolean;
  mealType: string;
}

interface RoomsHistory {
  roomId: string;
  Room: Room | null;
}


const RoomHistory = () => {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [rooms, setRooms] = useState<RoomsHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      try {
        const data = await fetchRoomsHistory(userId);
        setRooms(data);
      } catch (err) {
        setError("履歴データの取得に失敗しました");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);
  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>{error}</div>;
  return (
    <div>
      <h2>履歴</h2>
      <p>ユーザーID: {userId}</p>
      {rooms.length === 0 ? (
        <p>履歴は見つかりませんでした。</p>
      ) : (
        <ul>
          {rooms.map((item) =>
            item.Room ? (
              <li key={item.roomId}>
                <strong>エリア:</strong> {item.Room.area} <strong>日付:</strong>{" "}
                {new Date(item.Room.createdAt).toLocaleString()}{" "}
                <strong>タイプ:</strong> {item.Room.mealType}{" "}
                <strong>状態:</strong> {item.Room.isClosed ? "締切" : "受付中"}
              </li>
            ) : null
          )}
        </ul>
      )}
    </div>
  );
};

export default RoomHistory;
