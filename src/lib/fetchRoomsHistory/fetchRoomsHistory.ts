export const fetchRoomsHistory = async (userId: string) => {
  const response = await fetch(`/api/roomsHistory?userId=${encodeURIComponent(userId)}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "不明なエラーが発生しました" }));
    throw new Error(errorData.error || '履歴データの取得に失敗しました');
  }

  return response.json();
};