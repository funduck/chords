import { Anchor, Box, Divider, Space, Text, Title } from "@mantine/core";
import { useEffect } from "react";

import { useHeader } from "@src/hooks/Header";

export function TitleAbout() {
  return (
    <Box>
      <Title order={2}>MyChords</Title>
      <Space h="xs" />
      <Title order={3}>Personal songbook</Title>
      <Space h="md" />
      <Text>⚠️ Don't expect much, this is a pet project, so the app may be laggy!</Text>
      <Text>
        You might want to take a look in <Anchor href="https://github.com/funduck/chords">repository</Anchor>.
      </Text>
      <Space h="lg" />
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
      <Title order={4}>What is this?</Title>
      <Text>
        MyChords should help musicians share lyrics and chords in real-time during jam sessions.
        <br /> It allows you to sync screens so everyone can see the same content and have free hands.
      </Text>
      <Space h="lg" />

      <Title order={4}>How it works?</Title>
      <Text>* invite people to your "Room" by sending a link or a room code</Text>
      <Text>* pick a song from your library or create a new one on-the-go (no need to save though)</Text>
      <Text>* anybody in room can scroll screen or toggle auto-scroll, so your hands are free to play some music</Text>

      <Space h="xl" />
      <Divider />
      <Space h="xl" />

      <Title order={4}>Questions, ideas?</Title>
      <Text>
        Feel free to write me <Anchor href="mailto:qlfunduck@gmail.com">qlfunduck@gmail.com</Anchor>
      </Text>
    </Box>
  );
}
export default About;
