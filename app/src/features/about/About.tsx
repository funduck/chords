import { Accordion, Anchor, Box, Button, Divider, Group, List, Space, Text, Title } from "@mantine/core";
import { IconMusic, IconMusicPlus, IconMusicSearch, IconUsersGroup } from "@tabler/icons-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";

import { useSongContext } from "@src/features/song/SongContext";
import { useHeader } from "@src/hooks/Header";

export function TitleAbout() {
  return (
    <Box>
      <Title order={2}>MyChords</Title>
      <Space h="xs" />
      <Title order={3}>Minimal, real‑time songbook</Title>
      <Space h="md" />
      <Text c="dimmed">Share lyrics and chords live. Keep hands free and stay in sync.</Text>
      <Space h="sm" />
      <Text c="dimmed">
        Open source on <Anchor href="https://github.com/funduck/chords">GitHub</Anchor>
      </Text>
      <Space h="lg" />
    </Box>
  );
}

function QuickActions() {
  const navigate = useNavigate();
  const { songState } = useSongContext();
  const hasSong = Boolean(songState.songId);

  return (
    <Group wrap="wrap" gap="sm">
      <Button leftSection={<IconUsersGroup size={18} />} variant="light" onClick={() => navigate("/room")}>
        Start a Room
      </Button>
      <Button leftSection={<IconMusicPlus size={18} />} variant="light" onClick={() => navigate("/editor")}>
        Create song
      </Button>
      <Button leftSection={<IconMusicSearch size={18} />} variant="light" onClick={() => navigate("/search/songs")}>
        Browse songs
      </Button>
      {hasSong && (
        <Button
          leftSection={<IconMusic size={18} />}
          variant="subtle"
          onClick={() => navigate(`/songs/${songState.songId}`)}
        >
          Play current
        </Button>
      )}
    </Group>
  );
}

function ShortGuide() {
  const navigate = useNavigate();
  return (
    <Box>
      <Title order={4}>How to use</Title>
      <Space h="sm" />
      <List spacing="xs" size="sm" withPadding>
        <List.Item>
          Create or paste a song{" "}
          <Button
            size="xs"
            variant="subtle"
            leftSection={<IconMusicPlus size={16} />}
            onClick={() => navigate("/editor")}
          >
            Open editor
          </Button>
        </List.Item>
        <List.Item>
          Start a room and share the link{" "}
          <Button
            size="xs"
            variant="subtle"
            leftSection={<IconUsersGroup size={16} />}
            onClick={() => navigate("/room")}
          >
            Start room
          </Button>
        </List.Item>
        <List.Item>Everyone in the room sees the same page and scrolls together</List.Item>
      </List>
    </Box>
  );
}

function FAQ() {
  return (
    <Box>
      <Title order={4}>FAQ</Title>
      <Space h="sm" />
      <Accordion variant="separated" radius="md">
        <Accordion.Item value="sync">
          <Accordion.Control>How do we sync our screens?</Accordion.Control>
          <Accordion.Panel>
            Create a room and share its link or code. Anyone who joins sees the same song and scroll position.
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="paste">
          <Accordion.Control>How do I add my song quickly?</Accordion.Control>
          <Accordion.Panel>
            Open the editor and paste text (plain or ChordPro). You can play right away—no need to save first.
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="account">
          <Accordion.Control>Do I need an account?</Accordion.Control>
          <Accordion.Panel>
            No. You can use anonymous login but on another device or browser you won't be able to access your songs.
            <br />
            But if you want to access the app from multiple devices or browsers, you should create an account.
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Box>
  );
}

function About() {
  const { setCenterContent } = useHeader();
  useEffect(() => {
    setCenterContent("About");
  }, []);

  return (
    <Box m="md">
      <TitleAbout />

      <QuickActions />

      <Space h="xl" />
      <Divider />
      <Space h="xl" />

      <ShortGuide />

      <Space h="xl" />
      <Divider />
      <Space h="xl" />

      <FAQ />

      <Space h="xl" />
      <Text c="dimmed">
        Questions or ideas? Feel free to write me <Anchor href="mailto:qlfunduck@gmail.com">qlfunduck@gmail.com</Anchor>
      </Text>
    </Box>
  );
}
export default About;
