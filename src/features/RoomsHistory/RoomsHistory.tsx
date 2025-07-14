"use client";

import { fetchRoomsHistory } from "@/lib/fetchRoomsHistory/fetchRoomsHistory";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Container,
  Text,
  Stack,
  Card,
  Group,
  Alert,
  Title,
} from "@mantine/core";
import { IconAlertCircle, IconArrowLeft, IconUsers } from "@tabler/icons-react";
import { RoomsHistoryCardSkeleton } from "@/components/RoomsHistoryCardSkeleton/RoomsHistoryCardSkeleton";
import classes from "./RoomsHistory.module.css";

interface Room {
  id: string;
  area: number;
  createdAt: string;
  date: string;
  mealType: string;
  maxUser: number;
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

  const router = useRouter();
  const handleClickBackHome = () => {
    router.push("/");
  };

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      try {
        const data = await fetchRoomsHistory(userId);
        setRooms(data);
      } catch (err) {
        setError(`${err instanceof Error ? err.message : "不明なエラー"}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  return (
    <Container size="sm" py="xl">
      <Title size="2rem" fw={800} c="white" mt="md" pb={24} ta="center">
        履歴
      </Title>

      <Card
        withBorder
        shadow="sm"
        radius="md"
        p="xs"
        mb="xl"
        className={classes.backHomeCard}
        onClick={handleClickBackHome}
      >
        <Group justify="center" align="center" gap="xs" px="sm" py={4}>
          <IconArrowLeft size={16} stroke={1.5} />
          <Text fw={500} size="sm" c="blue.6">
            ホームに戻る
          </Text>
        </Group>
      </Card>

      {loading && (
        <Stack>
          <RoomsHistoryCardSkeleton />
          <RoomsHistoryCardSkeleton />
          <RoomsHistoryCardSkeleton />
        </Stack>
      )}

      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="エラー"
          color="red"
          withCloseButton
        >
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <Stack>
          {rooms.length === 0 ? (
            <Text color="dimmed">履歴は見つかりませんでした。</Text>
          ) : (
            rooms.map((item) =>
              item.Room ? (
                <Card
                  key={item.roomId}
                  shadow="sm"
                  radius="md"
                  withBorder
                  className={classes.historyCard}
                >
                  <Stack gap="xs">
                    <Group>
                      <Text fw={500}>エリア:</Text>
                      <Text>{item.Room.area}</Text>
                    </Group>
                    <Group>
                      <Text fw={500}>日付:</Text>
                      <Text>
                        {new Date(item.Room.createdAt).toLocaleString("ja-JP")}
                      </Text>
                    </Group>
                    <Group>
                      <Text fw={500}>タイプ:</Text>
                      <Text>{item.Room.mealType}</Text>
                    </Group>
                    <Group>
                      <IconUsers size={16} />
                      <Text>{item.Room.maxUser} 人</Text>
                    </Group>
                  </Stack>
                </Card>
              ) : null
            )
          )}
        </Stack>
      )}
    </Container>
  );
};

export default RoomHistory;
