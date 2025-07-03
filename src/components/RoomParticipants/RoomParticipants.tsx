import React from "react";
import {
  Box,
  Group,
  Text,
  Progress,
  Avatar,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { IconUsers, IconCrown } from "@tabler/icons-react";

import styles from "./RoomParticipants.module.css";

export interface RoomParticipant {
  id: string;
  roomId: string;
  userId: string;
  isHost: boolean;
  profile: {
    name: string | null;
    avatarUrl: string | null;
    userId: string;
  };
}

interface ParticipantsSectionProps {
  participants: RoomParticipant[];
  maxUser: number;
}

export function ParticipantsSection({
  participants,
  maxUser,
}: ParticipantsSectionProps) {
  const participantCount = participants.length;
  const progressValue = (participantCount / maxUser) * 100;
  const isRoomFull = participantCount >= maxUser;

  return (
    <Box className={styles.container}>
      <Group justify="space-between" mb="xs">
        <Group>
          <IconUsers size={20} />
          <Text fw={500}>参加者</Text>
        </Group>
        <Text size="sm" c="dimmed">
          {participantCount} / {maxUser} 名
        </Text>
      </Group>

      <Progress
        value={progressValue}
        color={isRoomFull ? "orange" : "blue"}
        size="md"
        radius="xl"
        mb="md"
      />

      <Group>
        {participants.map((participant, index) => {
          const displayName =
            participant.profile.name || `ユーザー${index + 1}`;
          const roleLabel = participant.isHost ? "ホスト" : "参加者";

          return (
            <Tooltip
              key={participant.id}
              label={`${displayName} (${roleLabel})`}
              withArrow
            >
              <Box className={styles.avatarWrapper}>
                <Avatar
                  src={participant.profile.avatarUrl}
                  radius="xl"
                  size="md"
                  color={participant.isHost ? "blue" : "gray"}
                >
                  {participant.profile.avatarUrl
                    ? null
                    : participant.isHost
                      ? "H"
                      : displayName.charAt(0)}
                </Avatar>
                {participant.isHost && (
                  <ThemeIcon
                    size="xs"
                    radius="xl"
                    color="yellow"
                    className={styles.hostBadge}
                  >
                    <IconCrown size={12} />
                  </ThemeIcon>
                )}
              </Box>
            </Tooltip>
          );
        })}

        {participantCount < maxUser && (
          <Text size="sm" c="dimmed">
            @{maxUser - participantCount} 名募集中...
          </Text>
        )}
      </Group>
    </Box>
  );
}
