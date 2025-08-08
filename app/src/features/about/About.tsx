import {
  Accordion,
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  List,
  Space,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconDeviceMobile,
  IconEdit,
  IconHelpCircle,
  IconMusic,
  IconMusicPlus,
  IconPlayerPlayFilled,
  IconSearch,
  IconUsersGroup,
} from "@tabler/icons-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";

import { RoutesEnum } from "@src/Router";
import { useHeader } from "@src/hooks/Header";

export function TitleAbout() {
  return (
    <Box ta="center" mb="xl">
      <Group justify="center" gap="xs" mb="xs">
        <Title order={1} c="primary" m={0}>
          🎵 MyChords
        </Title>
        <Tooltip
          withArrow
          multiline
          w={320}
          label="Beta — a personal pet project focused on a lightweight, neat, clean experience. It may become commercial later, but most core features will remain free."
        >
          <Badge variant="light" color="gray" size="sm" radius="sm">
            Beta
          </Badge>
        </Tooltip>
      </Group>
      <Title order={3} c="dimmed" fw={400} mb="lg">
        Collaborative songbook for jam sessions
      </Title>
      <Text size="lg" maw={600} mx="auto">
        Share chord sheets and lyrics in real-time. Keep everyone in sync and hands free to play music.
      </Text>
    </Box>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group mb="md" align="flex-start">
        <ThemeIcon size={40} radius="md" color="primary">
          {icon}
        </ThemeIcon>
        <Title order={4}>{title}</Title>
      </Group>
      <Text size="sm" c="dimmed">
        {description}
      </Text>
    </Card>
  );
}

function Features() {
  return (
    <Grid mb="xl" mt="xl">
      <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
        <FeatureCard
          icon={<IconUsersGroup size={24} />}
          title="Real-time Sync"
          description="Share your screen with bandmates. Everyone sees the same song and scroll position automatically."
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
        <FeatureCard
          icon={<IconPlayerPlayFilled size={24} />}
          title="Auto-scroll"
          description="Hands-free playing with adjustable auto-scroll speed. Perfect for performances and practice."
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
        <FeatureCard
          icon={<IconEdit size={24} />}
          title="Smart Editor"
          description="Paste songs from Ultimate Guitar or any source. Auto-format to ChordPro with intelligent parsing."
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
        <FeatureCard
          icon={<IconSearch size={24} />}
          title="Full-text Search"
          description="Find songs by title, artist, or even lyrics. Lightning-fast search through your entire library."
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
        <FeatureCard
          icon={<IconMusic size={24} />}
          title="Chord Diagrams"
          description="Interactive chord diagrams with multiple fingering positions. Perfect for learning new songs."
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
        <FeatureCard
          icon={<IconDeviceMobile size={24} />}
          title="Mobile Ready"
          description="Works perfectly on phones and tablets. Take your songbook anywhere, no app installation needed."
        />
      </Grid.Col>
    </Grid>
  );
}

function QuickStartGuide() {
  const navigate = useNavigate();

  return (
    <Box mt="xl" mb="xl">
      <Title order={2} mb="md" ta="center">
        🚀 Quick Start Guide
      </Title>

      <Space h="md" />

      <Grid mb="xl">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Title order={4} mb="md" c="primary">
              <IconMusicPlus size={20} style={{ marginRight: "8px" }} />
              Start Playing Now
            </Title>
            <List spacing="sm" size="sm" mb="md">
              <List.Item>Create a new song with the editor</List.Item>
              <List.Item>Paste lyrics with chords from any source</List.Item>
              <List.Item>Use auto-format to convert to ChordPro</List.Item>
              <List.Item>Preview and adjust as needed</List.Item>
            </List>
            <Button
              fullWidth
              variant="filled"
              leftSection={<IconMusicPlus size={16} />}
              onClick={() => navigate(RoutesEnum.Editor)}
            >
              Create Your First Song
            </Button>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Title order={4} mb="md" c="primary">
              <IconUsersGroup size={20} style={{ marginRight: "8px" }} />
              Jam with Friends
            </Title>
            <List spacing="sm" size="sm" mb="md">
              <List.Item>Create or join a room</List.Item>
              <List.Item>Share the room code or link</List.Item>
              <List.Item>Pick a song from your library</List.Item>
              <List.Item>Everyone sees the same content in sync</List.Item>
            </List>
            <Button
              fullWidth
              variant="outline"
              leftSection={<IconUsersGroup size={16} />}
              onClick={() => navigate(RoutesEnum.Room())}
            >
              Start a Jam Session
            </Button>
          </Card>
        </Grid.Col>
      </Grid>
    </Box>
  );
}

function FAQ() {
  return (
    <Box mt="xl" mb="xl">
      <Title order={2} mb="md" ta="center">
        <IconHelpCircle size={22} style={{ marginRight: 8, verticalAlign: "middle" }} /> FAQ
      </Title>

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

      <Features />

      <Space h="xs" />
      <QuickStartGuide />

      <Space h="xs" />
      <FAQ />

      <Space h="xs" />
      <Divider my="xl" />

      <Text c="dimmed">
        Open source on <Anchor href="https://github.com/funduck/chords">GitHub</Anchor>
      </Text>
      <Text c="dimmed">
        Feel free to write me <Anchor href="mailto:qlfunduck@gmail.com">qlfunduck@gmail.com</Anchor>
      </Text>

      <Space h="xl" />
    </Box>
  );
}
export default About;
