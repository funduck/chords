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
  Modal, // added
  Space,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconEdit, IconHelpCircle, IconMusicPlus, IconSearch, IconUsersGroup } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router";

import { RoutesEnum } from "@src/Router";

export function Beta() {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Badge
        variant="light"
        size="md"
        radius="sm"
        mr="xs"
        onClick={() => setOpened(true)}
        style={{ cursor: "pointer" }}
        role="button"
        title="About this beta"
      >
        Beta
      </Badge>
      <Modal opened={opened} onClose={() => setOpened(false)} title="Beta notice" centered size="lg">
        <Text size="sm" mb="sm">
          This is an early build focused on simplicity and real‑time collaboration.
        </Text>
        <Text size="sm" mb="sm">
          Public library is not yet available, so you can only create and share songs with friends in a room.
        </Text>
        <Text size="sm" mb="sm">
          Things may change quickly; features can shift or be refined. Feedback is very welcome—reach out any time.
        </Text>
        <Text size="xs" c="dimmed">
          Core features will stay free if the project grows. Thanks for trying it out!
        </Text>
      </Modal>
    </>
  );
}

export function BetaPanel() {
  return (
    <Group mb="md" align="center" justify="center">
      <Card withBorder radius="md">
        <Beta />
      </Card>
    </Group>
  );
}

export function TitleAbout() {
  return (
    <Box ta="center" mb="xl">
      <Title order={1} c="primary" mb="xs">
        🎵 MyChords
      </Title>

      <Title order={2} c="dimmed" mb="xs">
        Songbook for jam sessions
      </Title>

      <Text size="lg" maw={600} mx="auto" mb="xl">
        Share chord sheets and lyrics in real-time. Keep everyone in sync and hands free to play music.
      </Text>
    </Box>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group mb="md" align="flex-start">
        <ThemeIcon size={40} radius="md" color="var(--mantine-color-dimmed)">
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
      <Grid.Col key="1" span={{ base: 12, sm: 6, lg: 4 }}>
        <FeatureCard
          icon={<IconUsersGroup size={24} />}
          title="Real-time Sync"
          description="Share your screen with bandmates. Everyone sees the same song and scroll position."
        />
      </Grid.Col>
      {/* <Grid.Col key="2" span={{ base: 12, sm: 6, lg: 4 }}>
        <FeatureCard
          icon={<IconPlayerPlayFilled size={24} />}
          title="Auto-scroll"
          description="Hands-free playing with adjustable auto-scroll speed. Perfect for performances and practice."
        />
      </Grid.Col> */}
      <Grid.Col key="3" span={{ base: 12, sm: 6, lg: 4 }}>
        <FeatureCard
          icon={<IconEdit size={24} />}
          title="Smart Editor"
          description="Paste songs from an external source. Auto-format to ChordPro (Work In Progress: it may require some manual editing)."
        />
      </Grid.Col>
      <Grid.Col key="4" span={{ base: 12, sm: 6, lg: 4 }}>
        <FeatureCard
          icon={<IconSearch size={24} />}
          title="Full-text Search"
          description="Find songs by title, artist or lyrics."
        />
      </Grid.Col>
      {/* <Grid.Col key="5" span={{ base: 12, sm: 6, lg: 4 }}>
        <FeatureCard
          icon={<IconMusic size={24} />}
          title="Chord Diagrams"
          description="Interactive chord diagrams with multiple fingering positions. Perfect for learning new songs."
        />
      </Grid.Col> */}
      {/* <Grid.Col key="6" span={{ base: 12, sm: 6, lg: 4 }}>
        <FeatureCard
          icon={<IconDeviceMobile size={24} />}
          title="Mobile Ready"
          description="Works perfectly on phones and tablets. Take your songbook anywhere, no app installation needed."
        />
      </Grid.Col> */}
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
              Start Playing
            </Title>
            <List spacing="sm" size="sm" mb="md">
              <List.Item key="1">Create a new song with the editor</List.Item>
              <List.Item key="2">Paste lyrics with chords from any source</List.Item>
              <List.Item key="3">Use auto-format to convert to ChordPro</List.Item>
              <List.Item key="4">Preview and adjust as needed</List.Item>
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
              <List.Item key="1">Create or join a room</List.Item>
              <List.Item key="2">Pick a song from your library or open an editor</List.Item>
              <List.Item key="3">Everyone sees the same content in sync</List.Item>
              <List.Item key="4">Anybody can scroll or pick the next song</List.Item>
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
        <Accordion.Item value="sync" key="sync">
          <Accordion.Control>How do we sync our screens?</Accordion.Control>
          <Accordion.Panel>
            Create a room and share its link or code.
            <br />
            Anyone who joins will have the same song in player and same content in editor.
            <br />
            Anybody in the room can scroll or pick the next song, so everyone stays in sync.
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="paste" key="paste">
          <Accordion.Control>How do I add my song quickly?</Accordion.Control>
          <Accordion.Panel>
            Open the editor and paste text (plain or ChordPro). You can play right away without saving.
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="account" key="account">
          <Accordion.Control>Do I need an account?</Accordion.Control>
          <Accordion.Panel>
            No. You can use anonymous login but on another device or browser you won't be able to access your songs.
            <br />
            But if you want to access the app from multiple devices or browsers, you should create an account.
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="public_library" key="public_library">
          <Accordion.Control>Why public library is so small?</Accordion.Control>
          <Accordion.Panel>
            For now I'm not sure about making user-generated content public. It may change in the future.
            <br />
            So the public library just allows newcomers to get a feel of the app.
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="chord_diagrams" key="chord_diagrams">
          <Accordion.Control>Some chords are not recognised or displayed incorrectly</Accordion.Control>
          <Accordion.Panel>
            Yes, for now parsing and visualization of chord diagrams is limited. It will be improved in the future.
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Box>
  );
}

function About() {
  return (
    <Box mt="xl">
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
