export const fetchRoomsHistory = async (userId: string) => {
  const res = await fetch(`/api/roomsHistory?userId=${userId}`);
  if (!res.ok) throw new Error("履歴データの取得に失敗しました");

  const data = await res.json();
  return data;
};
