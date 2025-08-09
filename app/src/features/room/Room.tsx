import { Box, Button, Card, CopyButton, Flex, Group, Stack, Text, TextInput, ThemeIcon, Title } from "@mantine/core";
import { IconCopy, IconDoorExit, IconLogin2, IconPlus, IconShare3, IconUsersGroup } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

import { useRoomsApi } from "@src/hooks/Api";
import { useHeader } from "@src/hooks/Header";
import { useScrollPosition } from "@src/hooks/useScrollPosition";

import { useRoomContext } from "./RoomContext";

function Room() {
  // Initialize scroll position management
  useScrollPosition();

  const { roomState, createRoom, joinRoom, leaveRoom } = useRoomContext();
  const room = roomState.room;

  const roomsApi = useRoomsApi();

  const { setCenterContent } = useHeader();
  useEffect(() => {
    setCenterContent(<Text>Room</Text>);
  }, []);

  const [roomCode, setRoomCode] = useState<string | null>(null);

  const currentURL = window.location.href;
  const { roomCode: joinRoomCode } = useParams();

  useEffect(() => {
    if (!roomsApi) {
      return;
    }
    if (joinRoomCode) {
      joinRoom(joinRoomCode);
    }
  }, [roomsApi]);

  if (!roomsApi) {
    return <div>Loading...</div>;
  }

  if (!room) {
    return (
      <Box>
        <Box ta="center" mb="xl">
          <Title order={2} c="primary" mb={4}>
            <IconUsersGroup size={24} style={{ marginRight: 8, verticalAlign: "text-bottom" }} /> Jam Room
          </Title>
          <Text size="sm" c="dimmed">
            Create a room to sync scrolling & song changes with others, or join one with a 6‑char code.
          </Text>
        </Box>

        <Flex direction={{ base: "column", sm: "row" }} gap="md" align="stretch">
          <Card withBorder radius="md" padding="lg" style={{ flex: 1 }}>
            <Group mb="sm">
              <ThemeIcon size={40} radius="md" color="primary">
                <IconPlus size={22} />
              </ThemeIcon>
              <Title order={4}>Create Room</Title>
            </Group>
            <Text size="sm" c="dimmed" mb="md">
              Instantly start a synced session. Share the link or code that appears after creation.
            </Text>
            <Button variant="filled" fullWidth onClick={() => createRoom()} leftSection={<IconPlus size={16} />}>
              Create
            </Button>
          </Card>
          <Card withBorder radius="md" padding="lg" style={{ flex: 1 }}>
            <Group mb="sm">
              <ThemeIcon size={40} radius="md" color="primary">
                <IconLogin2 size={22} />
              </ThemeIcon>
              <Title order={4}>Join Room</Title>
            </Group>
            <Text size="sm" c="dimmed" mb="md">
              Enter a 6‑character room code you received.
            </Text>
            <Flex gap="sm" align="flex-start">
              <TextInput
                placeholder="ABC123"
                name="roomCode"
                onChange={(event) => setRoomCode(event.target.value.trim().toUpperCase())}
                value={roomCode ?? ""}
                error={roomCode?.length && roomCode.length != 6 ? `${6 - (roomCode?.length || 0)} more` : undefined}
                style={{ flex: 1 }}
                maxLength={6}
              />
              <Button variant="outline" onClick={() => joinRoom(roomCode!)} disabled={(roomCode?.length || 0) != 6}>
                Join
              </Button>
            </Flex>
          </Card>
        </Flex>
      </Box>
    );
  }

  const joinLink = room.code ? `${currentURL.replace(/\/room.+/, "/room")}/join/${room.code}` : "";

  return (
    <Box>
      <Box ta="center" mb="xl">
        <Title order={2} c="primary" mb={4}>
          <IconUsersGroup size={24} style={{ marginRight: 8, verticalAlign: "text-bottom" }} /> Room Active
        </Title>
        <Text size="sm" c="dimmed">
          Share the link or code below. Anyone joining stays in sync with scroll & song changes.
        </Text>
      </Box>

      <Flex direction={{ base: "column", sm: "row" }} gap="md" align="stretch">
        <CopyButton value={joinLink}>
          {({ copied, copy }) => (
            <Button
              variant={copied ? "light" : "outline"}
              disabled={room?.code == null}
              onClick={copy}
              fullWidth
              leftSection={<IconShare3 size={16} />}
            >
              {copied ? "Link Copied" : "Copy Join Link"}
            </Button>
          )}
        </CopyButton>
        <CopyButton value={room?.code ?? ""}>
          {({ copied, copy }) => (
            <Button
              variant={copied ? "light" : "outline"}
              disabled={room?.code == null}
              onClick={copy}
              fullWidth
              leftSection={<IconCopy size={16} />}
            >
              {copied ? "Code Copied" : `Copy Code ${room?.code || ""}`}
            </Button>
          )}
        </CopyButton>
        <Button
          variant="outline"
          color="red"
          fullWidth
          onClick={() => leaveRoom()}
          leftSection={<IconDoorExit size={16} />}
        >
          Leave Room
        </Button>
      </Flex>
    </Box>
  );
}

export default Room;
