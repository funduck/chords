import { Anchor, Box, Divider, Group, Space, Text, Title } from "@mantine/core";

export function TitleAbout() {
  return (
    <Box>
      <Title order={2}>MyChords</Title>
      <Space h="xs" />
      <Title order={3}>Personal songbook</Title>
      <Space h="md" />
      <Group gap={"xs"}>
        <Text>Don't expect much, this is just a pet project.</Text>
      </Group>
      <Space h="sm" />
    </Box>
  );
}

function About() {
  return (
    <Box>
      <TitleAbout />
      <Title order={5}>What is this?</Title>
      <Text>
        MyChords should help musicians share lyrics and chords in real-time during jam sessions.
        <br /> It allows you to sync screens so everyone can see the same content and have free hands.
      </Text>
      <Space h="sm" />

      <Title order={5}>How it works?</Title>
      <Text>* invite people to your "Room"</Text>
      <Text>* pick a song</Text>
      <Text>* go to player and have your screens synced!</Text>
      <Space h="sm" />

      <Title order={5}>Limitations & Notes</Title>
      <Text>
        ⚠️ This is a pet project by a backend developer - the frontend may be laggy or rough around the edges!
      </Text>
      <Space h="xl" />
      <Divider />
      <Space h="xl" />

      <Text>
        Better documentation is available in the <Anchor href="https://github.com/funduck/chords">repository</Anchor>
      </Text>
      <Space h="xl" />

      <Text>
        My email <Anchor href="mailto:qlfunduck@gmail.com">qlfunduck@gmail.com</Anchor>
      </Text>
      <Space h="sm" />
    </Box>
  );
}
export default About;
