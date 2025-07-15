import { Card, Group, Skeleton, Stack } from "@mantine/core";

export function RoomsHistoryCardSkeleton() {
  return (
    <Card shadow="sm" radius="md" withBorder mb="sm">
      <Stack gap="xs">
        <Group>
          <Skeleton height={16} width="20%" radius="xl" />
          <Skeleton height={16} width="40%" radius="xl" />
        </Group>
        <Group>
          <Skeleton height={16} width="20%" radius="xl" />
          <Skeleton height={16} width="50%" radius="xl" />
        </Group>
        <Group>
          <Skeleton height={16} width="20%" radius="xl" />
          <Skeleton height={16} width="30%" radius="xl" />
        </Group>
        <Group>
          <Skeleton height={16} width="10%" radius="xl" />
          <Skeleton height={16} width="25%" radius="xl" />
        </Group>
      </Stack>
    </Card>
  );
}
